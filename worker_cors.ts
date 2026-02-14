
import { verifyJWT, extractBearerToken, hasRole } from './auth';
import { checkRateLimit, incrementDownloadCount } from './rateLimit';
import { WasmLayerPack, initSync } from 'layer-pack-wasm';
// @ts-ignore — Cloudflare Workers support .wasm imports natively
import wasmModule from '../node_modules/layer-pack-wasm/layer_pack_wasm_bg.wasm';

export interface Env {
    MOD_BUCKET: R2Bucket;
    MOD_RATE_LIMIT: KVNamespace;
    JWT_SECRET: string;
    MAX_DOWNLOADS_PER_DAY: string;
    CORS_ORIGIN: string;
}

function corsHeaders(origin: string): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Max-Age': '86400',
    };
}

function jsonResponse(
    body: Record<string, unknown>,
    status: number,
    corsOrigin: string,
): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(corsOrigin),
        },
    });
}

function getClientIP(request: Request): string {
    return (
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
        '0.0.0.0'
    );
}

const LPACK_EXTENSION = '.lpack';

/**
 * Sanitize a pack name into a URL-safe snake_case string.
 */
function sanitizePackName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        || 'unnamed';
}

/**
 * Generate a date-based object key: YYYY/MM/DD/{seq}_{sanitized_name}{ext}
 * Counts existing objects in the day's prefix to determine the sequence number.
 */
async function generateObjectKey(
    bucket: R2Bucket,
    packName: string,
    extension: string,
): Promise<string> {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const prefix = `${yyyy}/${mm}/${dd}/`;

    // Count existing objects for today to determine sequence number
    let count = 0;
    let cursor: string | undefined;
    let truncated = true;
    while (truncated) {
        const list = await bucket.list({ prefix, cursor });
        count += list.objects.length;
        truncated = list.truncated;
        cursor = list.truncated ? list.cursor : undefined;
    }

    const seq = count + 1;
    const safeName = sanitizePackName(packName);
    return `${prefix}${seq}_${safeName}${extension}`;
}

/**
 * Authenticate request — verifies JWT and returns payload.
 */
async function authenticate(request: Request, env: Env, corsOrigin: string) {
    const authHeader = request.headers.get('Authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
        return {
            error: jsonResponse(
                { error: 'Authorization required. Provide Bearer token.' },
                401,
                corsOrigin,
            ),
        };
    }

    try {
        const payload = await verifyJWT(token, env.JWT_SECRET);
        return { payload };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid token';
        return {
            error: jsonResponse(
                { error: 'Invalid or expired token', detail: message },
                401,
                corsOrigin,
            ),
        };
    }
}

/**
 * Handle GET /download/:key — download file from R2 with rate limiting.
 */
async function handleDownload(
    request: Request,
    env: Env,
    corsOrigin: string,
    objectKey: string,
): Promise<Response> {
    // Authenticate
    const auth = await authenticate(request, env, corsOrigin);
    if (auth.error) return auth.error;
    const payload = auth.payload!;

    const userId = Number(payload.sub);
    const clientIP = getClientIP(request);

    // Check rate limit
    const maxDownloads = parseInt(env.MAX_DOWNLOADS_PER_DAY, 10) || 5;
    const rateLimitResult = await checkRateLimit(
        env.MOD_RATE_LIMIT,
        userId,
        clientIP,
        maxDownloads,
    );

    if (!rateLimitResult.allowed) {
        return jsonResponse(
            {
                error: 'Rate limit exceeded',
                message: `Maximum ${rateLimitResult.limit} downloads per day. Try again tomorrow.`,
                limit: rateLimitResult.limit,
                used: rateLimitResult.current,
                remaining: 0,
            },
            429,
            corsOrigin,
        );
    }

    // Fetch from R2
    const object = await env.MOD_BUCKET.get(objectKey);

    if (!object) {
        return jsonResponse(
            { error: 'File not found', key: objectKey },
            404,
            corsOrigin,
        );
    }

    // Increment download count (after successful R2 fetch)
    const newCount = await incrementDownloadCount(
        env.MOD_RATE_LIMIT,
        userId,
        clientIP,
    );

    // Stream file response
    const headers = new Headers({
        ...corsHeaders(corsOrigin),
        'Content-Type':
            object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${objectKey.split('/').pop()}"`,
        'Cache-Control': 'no-store',
        'X-RateLimit-Limit': maxDownloads.toString(),
        'X-RateLimit-Remaining': (maxDownloads - newCount).toString(),
        'X-RateLimit-Used': newCount.toString(),
    });

    if (object.size) {
        headers.set('Content-Length', object.size.toString());
    }

    return new Response(object.body, { status: 200, headers });
}

/**
 * Handle PUT /upload — upload file to R2 (ADMIN only).
 * Filename is auto-generated: YYYY/MM/DD/{uuid}.{ext}
 */
async function handleUpload(
    request: Request,
    env: Env,
    corsOrigin: string,
): Promise<Response> {
    // Authenticate
    const auth = await authenticate(request, env, corsOrigin);
    if (auth.error) return auth.error;
    const payload = auth.payload!;

    // Check ADMIN role
    if (!hasRole(payload, 'ADMIN')) {
        return jsonResponse(
            { error: 'Forbidden. ADMIN role required.' },
            403,
            corsOrigin,
        );
    }

    // Validate request body
    if (!request.body) {
        return jsonResponse(
            { error: 'Request body is required' },
            400,
            corsOrigin,
        );
    }

    // Read entire body and validate as LayerPack archive
    const data = new Uint8Array(await request.arrayBuffer());
    initSync({ module: wasmModule });

    let pack: WasmLayerPack;
    try {
        pack = new WasmLayerPack(data);
    } catch {
        return jsonResponse(
            {
                error: 'Invalid file',
                message: 'File is not a valid .lpack archive.',
            },
            400,
            corsOrigin,
        );
    }

    // Extract metadata from archive
    const packName = pack.name;
    const packAuthor = pack.author;
    const fileList = pack.get_file_list();
    pack.free();

    // Generate date-based key
    const originalFilename = request.headers.get('X-Filename') || 'unknown';
    const objectKey = await generateObjectKey(env.MOD_BUCKET, packName, LPACK_EXTENSION);

    // Upload validated bytes to R2
    const object = await env.MOD_BUCKET.put(objectKey, data, {
        httpMetadata: {
            contentType: 'application/vnd.layerpack',
        },
        customMetadata: {
            uploadedBy: String(payload.sub),
            uploadedByName: payload.username || 'unknown',
            uploadedAt: new Date().toISOString(),
            originalFilename,
            packName,
            packAuthor: packAuthor || 'unknown',
            fileCount: String(fileList.length),
        },
    });

    return jsonResponse(
        {
            success: true,
            key: objectKey,
            size: object.size,
            uploaded: object.uploaded.toISOString(),
            packName,
            packAuthor: packAuthor || undefined,
            fileCount: fileList.length,
        },
        201,
        corsOrigin,
    );
}

/**
 * Handle DELETE /upload/:key — delete file from R2 (ADMIN only).
 */
async function handleDelete(
    request: Request,
    env: Env,
    corsOrigin: string,
    objectKey: string,
): Promise<Response> {
    // Authenticate
    const auth = await authenticate(request, env, corsOrigin);
    if (auth.error) return auth.error;
    const payload = auth.payload!;

    // Check ADMIN role
    if (!hasRole(payload, 'ADMIN')) {
        return jsonResponse(
            { error: 'Forbidden. ADMIN role required.' },
            403,
            corsOrigin,
        );
    }

    await env.MOD_BUCKET.delete(objectKey);

    return jsonResponse(
        { success: true, key: objectKey, deleted: true },
        200,
        corsOrigin,
    );
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const corsOrigin = env.CORS_ORIGIN || '*';

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(corsOrigin),
            });
        }

        // Route: /download/:key
        const downloadPrefix = '/download/';
        if (url.pathname.startsWith(downloadPrefix)) {
            const objectKey = decodeURIComponent(
                url.pathname.slice(downloadPrefix.length),
            );
            if (!objectKey) {
                return jsonResponse({ error: 'Missing file key' }, 400, corsOrigin);
            }

            if (request.method === 'GET') {
                return handleDownload(request, env, corsOrigin, objectKey);
            }
            return jsonResponse({ error: 'Method not allowed' }, 405, corsOrigin);
        }

        // Route: PUT /upload — auto-generates filename
        if (url.pathname === '/upload' && request.method === 'PUT') {
            return handleUpload(request, env, corsOrigin);
        }

        // Route: DELETE /upload/:key
        const uploadPrefix = '/upload/';
        if (url.pathname.startsWith(uploadPrefix) && request.method === 'DELETE') {
            const objectKey = decodeURIComponent(
                url.pathname.slice(uploadPrefix.length),
            );
            if (!objectKey) {
                return jsonResponse({ error: 'Missing file key' }, 400, corsOrigin);
            }
            return handleDelete(request, env, corsOrigin, objectKey);
        }

        return jsonResponse(
            {
                error: 'Not found',
                routes: {
                    download: 'GET /download/{key}',
                    upload: 'PUT /upload (ADMIN only, filename auto-generated)',
                    delete: 'DELETE /upload/{key} (ADMIN only)',
                },
            },
            404,
            corsOrigin,
        );
    },
} satisfies ExportedHandler<Env>;
