// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface GameResult {
  title: string;
  version: string;
  url: string;
  description: string;
  site: string;
  tags: string[] | null;
  metadata: {
    platforms?: string;
    [key: string]: any;
  };
  score: number;
  extracted_at: string;
  image_urls: string[] | null;
}

interface SearchResponse {
  query: string;
  results: GameResult[];
  total: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const site = searchParams.get('site') || 'lewdzone.com';
    const limit = searchParams.get('limit') || '10';

    if (!q) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Build the external API URL
    const externalParams = new URLSearchParams({
      q: q,
      site: site,
      limit: limit
    });

    const externalUrl = `http://${process.env.SEARXNG_URL}/search?${externalParams}`;

    console.log('Fetching from:', externalUrl);

    const response = await fetch(externalUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Chanom Search Bot/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response:', textResponse.substring(0, 200));
      return NextResponse.json(
        { error: 'External API returned non-JSON response' },
        { status: 502 }
      );
    }

    const data: SearchResponse = await response.json();

    // Validate the response structure
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid response structure' },
        { status: 502 }
      );
    }

    // Ensure results is an array
    if (!Array.isArray(data.results)) {
      data.results = [];
    }

    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('API route error:', error);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { error: `Server error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown server error' },
      { status: 500 }
    );
  }
}