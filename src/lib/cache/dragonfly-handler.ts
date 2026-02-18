
import type { CacheHandler } from 'next/dist/server/lib/cache-handlers/types';
import Redis from 'ioredis';

// Create a Redis client instance
// Global instance to prevent multiple connections in dev mode
const globalForRedis = global as unknown as { redis: Redis };

const redis =
    globalForRedis.redis ||
    new Redis(process.env.DRAGONFLY_URL || 'redis://localhost:6379');

// Prevent unhandled error events from crashing the process
redis.on('error', (err) => {
    // Suppress connection errors during build/runtime if Dragonfly is not available
    // Next.js will simply not cache if the handler returns undefined
    // console.error('Redis error:', err);
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default class DragonflyCacheHandler implements CacheHandler {
    // Use a prefix to avoid collisions
    private prefix = 'next-cache:';

    async get(key: string, softTags: string[]): Promise<any> {
        try {
            const data = await redis.get(this.prefix + key);
            if (!data) return undefined;

            // Data is stored as JSON string
            const entry = JSON.parse(data);

            // Check for expiration? Next.js says "The implementation check logic is up to the handler"
            // But typically we return the entry and let Next.js decide or we verify here.
            // The interface says return undefined if not found or if soft tags are stale.

            // Convert buffer back to ReadableStream
            const buffer = Buffer.from(entry.value, 'base64');
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(buffer);
                    controller.close();
                },
            });

            return {
                ...entry,
                value: stream,
            };
        } catch (error) {
            console.error('Cache get error:', error);
            return undefined;
        }
    }

    async set(key: string, pendingEntry: Promise<any>): Promise<void> {
        try {
            const data = await pendingEntry;

            // Convert buffer value to base64 for storage
            let buffer: Buffer;
            if (Buffer.isBuffer(data.value)) {
                buffer = data.value;
            } else if (data.value && typeof data.value.getReader === 'function') {
                // Handle ReadableStream
                const reader = data.value.getReader();
                const chunks: Uint8Array[] = [];
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (value) chunks.push(value);
                }
                buffer = Buffer.concat(chunks);
            } else {
                // Fallback or error
                return;
            }

            const entry = {
                ...data,
                lastModified: Date.now(),
                value: buffer.toString('base64'),
            };

            // Calculate TTL
            let ttl = 31536000; // Default 1 year
            if (typeof data.revalidate === 'number') {
                ttl = Math.max(data.revalidate, 60);
            }

            const cacheKey = this.prefix + key;
            const pipeline = redis.pipeline();
            pipeline.set(cacheKey, JSON.stringify(entry), 'EX', ttl);

            if (data.tags && data.tags.length > 0) {
                for (const tag of data.tags) {
                    pipeline.sadd(`tags:${tag}`, cacheKey);
                }
            }

            await pipeline.exec();
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async revalidateTag(tags: string | string[]): Promise<void> {
        // Compatibility with older interface just in case?
        await this.updateTags(Array.isArray(tags) ? tags : [tags]);
    }

    // Interface methods
    async refreshTags(): Promise<void> {
        // No-op for now
    }

    async getExpiration(tags: string[]): Promise<number> {
        // Check tags expiration
        return 0; // Not implemented / Valid
    }

    async updateTags(tags: string[], durations?: { expire?: number }): Promise<void> {
        try {
            for (const tag of tags) {
                const keys = await redis.smembers(`tags:${tag}`);
                if (keys.length > 0) {
                    await redis.del(...keys);
                    await redis.del(`tags:${tag}`);
                }
            }
        } catch (error) {
            console.error('Cache updateTags error:', error);
        }
    }
}
