// src/lib/articlesCache.ts
// Shared cache for articles data - used by games page and article recommendations

import { unstable_cache } from 'next/cache';
import { createChanomhubClient, ArticleListItem } from '@chanomhub/sdk';

const sdk = createChanomhubClient();

// Cache for recommendation pool - revalidates every 5 minutes
// This is shared between all article pages to avoid extra API calls
export const getCachedRecommendationPool = unstable_cache(
    async (): Promise<ArticleListItem[]> => {
        const result = await sdk.articles.getAllPaginated({
            limit: 50, // Pool of articles for recommendations
            status: 'PUBLISHED',
            fields: [
                'id', 'title', 'slug', 'description',
                'mainImage', 'coverImage', 'backgroundImage',
                'author', 'tags'
            ]
        });
        return result.items;
    },
    ['recommendation-pool'],
    { revalidate: 300 } // 5 minutes
);

// Get related articles from cached pool (no extra API calls)
export function getRelatedFromPool(
    pool: ArticleListItem[],
    currentTags: string[],
    excludeId: number
): ArticleListItem[] {
    if (currentTags.length === 0 || pool.length === 0) {
        return [];
    }

    const currentTagSet = new Set(currentTags.map(t => t.toLowerCase()));

    // Score each article by tag overlap
    const scored = pool
        .filter(a => a.id !== excludeId)
        .map(article => {
            const articleTags = article.tags?.map(t => t.name.toLowerCase()) || [];
            const matchCount = articleTags.filter(t => currentTagSet.has(t)).length;
            return { article, score: matchCount };
        })
        .filter(item => item.score > 0); // Only include articles with at least 1 matching tag

    // Sort by score and return top 12
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map(item => item.article);
}
