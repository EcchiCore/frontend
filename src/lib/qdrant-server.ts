
import { QdrantSearchResult } from './qdrant';

const QDRANT_URL = 'https://6ef4d4e1-0558-4de1-8df7-189d497d7c6b.eu-central-1-0.aws.cloud.qdrant.io:6333';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOlt7ImNvbGxlY3Rpb24iOiJhcnRpY2xlcyIsImFjY2VzcyI6InIifV19.qp7wkjt_UcAp9h4Apksm9LFGJ-JPvyBX3401szshRk4';

export async function searchArticlesServer(query: string): Promise<QdrantSearchResult[]> {
    try {
        const response = await fetch(`${QDRANT_URL}/collections/articles/points/scroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY,
            },
            body: JSON.stringify({
                limit: 100, // Fetch top 100 newest/first items
                with_payload: true,
            }),
            cache: 'no-store', // Ensure we fetch fresh data on server
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Qdrant API error:', response.status, errorText);
            return [];
        }

        const data = await response.json();
        const points: QdrantSearchResult[] = data.result?.points || [];

        // Filter points in-memory
        const filteredPoints = points.filter((point) => {
            if (!query) return true;
            const q = query.toLowerCase();
            const title = (point.payload?.title as string)?.toLowerCase() || '';
            const description = (point.payload?.description as string)?.toLowerCase() || '';
            const tags = Array.isArray(point.payload?.tags)
                ? (point.payload.tags as string[]).join(' ').toLowerCase()
                : '';

            return title.includes(q) || description.includes(q) || tags.includes(q);
        });

        return filteredPoints;

    } catch (error) {
        console.error('Server-side search error:', error);
        return [];
    }
}
