
import { NextRequest, NextResponse } from 'next/server';
import { searchArticlesServer } from '@/lib/qdrant-server';

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        // Use shared server-side search logic
        const filteredPoints = await searchArticlesServer(query);

        return NextResponse.json({ result: filteredPoints });

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
