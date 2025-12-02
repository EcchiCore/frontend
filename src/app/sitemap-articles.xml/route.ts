// app/sitemap-articles.xml/route.ts
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
    const page = Number(request.nextUrl.searchParams.get('page') ?? '0');
    if (isNaN(page) || page < 0) return new NextResponse('Bad Request', { status: 400 });

    const generatedAt = new Date().toISOString();
    const articles = await fetchPublishedArticles();
    const chunks = chunkArray(articles, SITEMAP_ARTICLE_PAGE_SIZE);
    const chunk = chunks[page] || [];

    const xml = buildSitemapXml(buildArticleFields(chunk, generatedAt));

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=60, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Articles sitemap error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}