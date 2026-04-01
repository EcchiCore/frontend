import { unstable_cache } from 'next/cache';
import { getArticleBySlug, getArticleWithDownloads } from './article-api';
import { Article } from '@/types/article';
import { singleFlight } from '@/lib/cache/singleFlight';

// ============================================================
// สร้าง unstable_cache ครั้งเดียว (module scope) ไม่ใช่ทุก request
// ============================================================

// Cache สำหรับ guest — article เดี่ยว
const _cachedArticleBySlug = unstable_cache(
    async (slug: string, locale: string): Promise<Article | null> => {
        return getArticleBySlug(slug, locale);
    },
    ['article-by-slug'],
    { revalidate: 3600 } // 1 ชม.
);

// Cache สำหรับ guest — article + downloads
const _cachedArticleWithDownloads = unstable_cache(
    async (slug: string, locale: string) => {
        return getArticleWithDownloads(slug, locale);
    },
    ['article-with-downloads'],
    { revalidate: 3600, tags: ['articles'] }
);

// ============================================================
// Public API: ห่อด้วย singleFlight ป้องกัน thundering herd
// ============================================================

/**
 * ดึง article แบบ cached (guest) หรือ singleFlight (authenticated)
 * - Guest: unstable_cache + singleFlight
 * - Auth: singleFlight เท่านั้น (ไม่ cache เพราะต้องเช็ค purchase status)
 */
export const getCachedArticle = async (
    slug: string,
    locale: string,
    token?: string
): Promise<Article | null> => {
    if (token) {
        // Authenticated: ไม่ cache แต่ใช้ singleFlight ป้องกัน concurrent ซ้ำ
        return singleFlight(
            `article-auth-${slug}-${locale}`,
            () => getArticleBySlug(slug, locale)
        );
    }

    // Guest: unstable_cache + singleFlight
    return singleFlight(
        `article-guest-${slug}-${locale}`,
        () => _cachedArticleBySlug(slug, locale)
    );
};

/**
 * ดึง article + downloads แบบ cached
 * - Guest: unstable_cache + singleFlight
 * - Auth: singleFlight เท่านั้น
 */
export const getCachedArticleWithDownloads = async (
    slug: string,
    locale: string,
    token?: string
) => {
    if (token) {
        return singleFlight(
            `article-dl-auth-${slug}-${locale}`,
            () => getArticleWithDownloads(slug, locale)
        );
    }

    return singleFlight(
        `article-dl-guest-${slug}-${locale}`,
        () => _cachedArticleWithDownloads(slug, locale)
    );
};
