
export interface QdrantSearchResult {
    id: string | number;
    version: number;
    score: number;
    payload: Record<string, any>;
    vector?: number[];
}

interface QdrantResponse {
    result: { points: QdrantSearchResult[] } | QdrantSearchResult[];
    status: string;
    time: number;
}

const QDRANT_URL = 'https://6ef4d4e1-0558-4de1-8df7-189d497d7c6b.eu-central-1-0.aws.cloud.qdrant.io:6333';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOlt7ImNvbGxlY3Rpb24iOiJhcnRpY2xlcyIsImFjY2VzcyI6InIifV19.qp7wkjt_UcAp9h4Apksm9LFGJ-JPvyBX3401szshRk4';

export async function searchArticles(query: string): Promise<QdrantSearchResult[]> {
    try {
        const response = await fetch(`/api/qdrant/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            console.error('Search request failed:', response.statusText);
            return [];
        }

        const data = await response.json();
        return data.result || [];
    } catch (error) {
        console.error('Error searching articles:', error);
        return [];
    }
}
