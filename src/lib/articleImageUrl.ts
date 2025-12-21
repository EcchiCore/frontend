/**
 * Article Image URL Helper & Centralized GraphQL Client
 * 
 * Provides:
 * 1. URL transformation utilities (resolveArticleImageUrl)
 * 2. Centralized GraphQL client that auto-transforms image URLs in responses
 */

// CDN Base URL - can be configured via environment variable
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.chanomhub.com';
const API_URL = process.env.API_URL || 'https://api.chanomhub.online';

/**
 * Resolves an article image URL.
 * - If it's just a filename (e.g., "abc.jpg"), prepends the CDN base URL
 * - If it's already a full URL, returns it as-is
 * - Handles null/undefined gracefully
 */
export function resolveArticleImageUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;

    // Already a full URL - return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Filename only - prepend CDN base URL
    return `${CDN_BASE_URL}/${imageUrl}`;
}

/**
 * Resolves an image object with url property.
 */
export function resolveArticleImageObject(
    image: { url: string } | null | undefined
): { url: string } | null {
    if (!image?.url) return null;
    const resolvedUrl = resolveArticleImageUrl(image.url);
    if (!resolvedUrl) return null;
    return { url: resolvedUrl };
}

/**
 * Deep transforms all image URLs in an object/array recursively.
 * Looks for common image field patterns and transforms them.
 */
function transformImageUrlsDeep<T>(data: T): T {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
        return data.map(item => transformImageUrlsDeep(item)) as T;
    }

    if (typeof data === 'object') {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            // Transform known image URL fields
            if (isImageField(key) && typeof value === 'string') {
                result[key] = resolveArticleImageUrl(value);
            }
            // Transform image objects with url property
            else if (key === 'images' && Array.isArray(value)) {
                result[key] = value.map(img => {
                    if (img && typeof img === 'object' && 'url' in img) {
                        return { ...img, url: resolveArticleImageUrl(img.url) };
                    }
                    return img;
                });
            }
            // Recursively transform nested objects
            else if (value !== null && typeof value === 'object') {
                result[key] = transformImageUrlsDeep(value);
            }
            else {
                result[key] = value;
            }
        }

        return result as T;
    }

    return data;
}

/**
 * Check if a field name is likely an image URL field
 */
function isImageField(fieldName: string): boolean {
    const imageFields = [
        'mainImage',
        'backgroundImage',
        'coverImage',
        'image',
        'url' // for nested image objects
    ];
    return imageFields.includes(fieldName);
}

/**
 * Centralized GraphQL client that automatically transforms image URLs
 */
export async function graphqlFetch<T>(
    query: string,
    variables: Record<string, unknown> = {},
    options: {
        operationName?: string;
        token?: string;
        cache?: RequestCache | { next: { revalidate: number } };
    } = {}
): Promise<{ data: T | null; errors?: Array<{ message: string }> }> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
    }

    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
        method: 'POST',
        headers,
        body: JSON.stringify({
            query,
            variables,
            ...(options.operationName && { operationName: options.operationName }),
        }),
    };

    // Handle cache options
    if (options.cache) {
        if (typeof options.cache === 'string') {
            fetchOptions.cache = options.cache;
        } else if (options.cache.next) {
            fetchOptions.next = options.cache.next;
        }
    } else {
        // Default: revalidate every hour
        fetchOptions.next = { revalidate: 3600 };
    }

    const res = await fetch(`${API_URL}/api/graphql`, fetchOptions);

    if (!res.ok) {
        const errorText = await res.text();
        console.error('GraphQL fetch error:', res.status, errorText);
        return {
            data: null,
            errors: [{ message: `HTTP ${res.status}: ${res.statusText}` }]
        };
    }

    const json = await res.json();

    if (json.errors) {
        console.error('GraphQL errors:', json.errors);
        return { data: null, errors: json.errors };
    }

    // Auto-transform all image URLs in the response
    const transformedData = transformImageUrlsDeep(json.data) as T;

    return { data: transformedData };
}

/**
 * Server-side GraphQL client (uses next/headers for auth)
 */
export async function graphqlFetchServer<T>(
    query: string,
    variables: Record<string, unknown> = {},
    operationName?: string
): Promise<{ data: T | null; errors?: Array<{ message: string }> }> {
    try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        return graphqlFetch<T>(query, variables, {
            operationName,
            token,
            cache: token ? 'no-store' : { next: { revalidate: 3600 } },
        });
    } catch (error) {
        console.error('Server GraphQL fetch error:', error);
        return {
            data: null,
            errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
        };
    }
}
