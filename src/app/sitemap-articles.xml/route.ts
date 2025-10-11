import { NextRequest, NextResponse } from 'next/server';

import {
  SITEMAP_ARTICLE_PAGE_SIZE,
  buildArticleFields,
  buildSitemapXml,
  chunkArray,
  fetchPublishedArticles,
} from '@/lib/sitemap';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pageParam = url.searchParams.get('page') ?? '0';
    const pageIndex = Number.parseInt(pageParam, 10);

    if (Number.isNaN(pageIndex) || pageIndex < 0) {
      return new NextResponse('Invalid page parameter', { status: 400 });
    }

    const generatedAt = new Date().toISOString();
    const articles = await fetchPublishedArticles(generatedAt);
    const chunks = chunkArray(articles, SITEMAP_ARTICLE_PAGE_SIZE);
    const chunk = chunks[pageIndex] ?? [];

    if (chunk.length === 0) {
      const xml = buildSitemapXml([]);

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      });
    }

    const xml = buildSitemapXml(buildArticleFields(chunk, generatedAt));

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Error generating articles sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
