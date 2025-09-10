// src/app/api/home/route.ts
import { NextResponse } from 'next/server';

async function fetchArticles(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
    },
    next: {
      revalidate: 3600, // Revalidate every hour
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch articles from ${url}`);
  }
  return response.json();
}

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json({ error: 'API URL is not configured' }, { status: 500 });
  }

  try {
    const [carouselData, featuredData, latestData] = await Promise.all([
      fetchArticles(`${apiUrl}/api/articles?status=PUBLISHED&limit=3`),
      fetchArticles(`${apiUrl}/api/articles?status=PUBLISHED&platform=windows`),
      fetchArticles(`${apiUrl}/api/articles?status=PUBLISHED`),
    ]);

    return NextResponse.json({
      carousel: carouselData.articles || [],
      featured: featuredData.articles || [],
      latest: latestData.articles || [],
    });
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return NextResponse.json({ error: 'Failed to fetch home page data' }, { status: 500 });
  }
}
