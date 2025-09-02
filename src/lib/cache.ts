
// src/lib/cache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cachedEntry = cache.get(key);

  if (cachedEntry && (now - cachedEntry.timestamp < CACHE_TTL)) {
    console.log(`[Cache] HIT for key: ${key}`);
    return cachedEntry.data as T;
  }

  console.log(`[Cache] MISS for key: ${key}`);
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });

  return data;
}
