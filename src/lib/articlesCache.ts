// src/lib/articlesCache.ts
// Shared cache for articles data - used by games page and article recommendations

import { unstable_cache } from 'next/cache';
import { createChanomhubClient, ArticleListItem } from '@chanomhub/sdk';
import { singleFlight } from '@/lib/cache/singleFlight';

const sdk = createChanomhubClient();

// Cache for recommendation pool - revalidates every 10 minutes
// This is shared between all article pages to avoid extra API calls
const _getCachedRecommendationPool = unstable_cache(
    async (token?: string): Promise<ArticleListItem[]> => {
        const sdk = createChanomhubClient({ token });
        const result = await sdk.articles.getAllPaginated({
            limit: 30, // Pool of articles for recommendations (ลดจาก 50 → 30)
            status: 'PUBLISHED',
            fields: [
                'id', 'title', 'slug', 'description',
                'mainImage', 'coverImage', 'backgroundImage',
                'author', 'tags', 'price', 'isPaid', 'isUnlocked', 'viewsCount'
            ]
        });
        return result.items;
    },
    ['recommendation-pool'],
    { revalidate: 600 } // 10 นาที (เดิม 5 นาที → ลด frequency ของ cache refresh)
);

// ห่อด้วย singleFlight ป้องกัน concurrent article pages trigger พร้อมกัน
export const getCachedRecommendationPool = (token?: string) =>
    singleFlight(`recommendation-pool-${token ? 'auth' : 'guest'}`, () => _getCachedRecommendationPool(token));

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
