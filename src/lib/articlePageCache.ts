import { unstable_cache } from 'next/cache';
import { createChanomhubClient } from '@chanomhub/sdk';

const sdk = createChanomhubClient();

// Cache article fetch to deduplicate and enable ISR
// Revalidates every 1 hour (3600 seconds)
export const getCachedArticle = unstable_cache(
    async (slug: string, locale: string) => {
        return sdk.articles.getBySlug(slug, locale);
    },
    ['article-by-slug'],
    { revalidate: 3600 }
);

// Cache article with downloads for the main page
// Revalidates every 1 hour (3600 seconds)
export const getCachedArticleWithDownloads = unstable_cache(
    async (slug: string, locale: string) => {
        return sdk.articles.getWithDownloads(slug, locale);
    },
    ['article-with-downloads'],
    { revalidate: 3600 }
);
