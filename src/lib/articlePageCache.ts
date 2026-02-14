import { unstable_cache } from 'next/cache';
import { getArticleBySlug, getArticleWithDownloads } from './article-api';
import { Article } from '@/types/article';

// Cache article fetch to deduplicate and enable ISR
// Revalidates every 1 hour (3600 seconds)
export const getCachedArticle = unstable_cache(
    async (slug: string, locale: string): Promise<Article | null> => {
        return getArticleBySlug(slug, locale);
    },
    ['article-by-slug'],
    { revalidate: 3600 }
);

// Cache article with downloads for the main page
// Revalidates every 1 hour (3600 seconds)
export const getCachedArticleWithDownloads = unstable_cache(
    async (slug: string, locale: string): Promise<{ article: Article | null; downloads: Article["downloads"] | null }> => {
        return getArticleWithDownloads(slug, locale);
    },
    ['article-with-downloads'],
    { revalidate: 3600 }
);
