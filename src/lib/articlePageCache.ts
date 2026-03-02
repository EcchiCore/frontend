import { unstable_cache } from 'next/cache';
import { getArticleBySlug, getArticleWithDownloads } from './article-api';
import { Article } from '@/types/article';

// Cache article fetch to deduplicate and enable ISR
// Revalidates every 1 hour (3600 seconds) for guests
export const getCachedArticle = async (slug: string, locale: string, token?: string): Promise<Article | null> => {
    if (token) {
        // Bypass unstable_cache for authenticated users to ensure fresh purchase status
        return getArticleBySlug(slug, locale);
    }
    
    return unstable_cache(
        async (s: string, l: string) => {
            return getArticleBySlug(s, l);
        },
        ['article-by-slug'], // Base tag
        { revalidate: 3600 }
    )(slug, locale);
};

// Cache article with downloads for the main page
// Revalidates every 1 hour (3600 seconds) for guests
export const getCachedArticleWithDownloads = async (slug: string, locale: string, token?: string) => {
    if (token) {
        // Bypass unstable_cache for authenticated users
        return getArticleWithDownloads(slug, locale);
    }

    return unstable_cache(
        async () => getArticleWithDownloads(slug, locale),
        [`article-with-downloads-${slug}-${locale}-guest`],
        { revalidate: 3600, tags: ['articles', `article-${slug}`] }
    )();
};
