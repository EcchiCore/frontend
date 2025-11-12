// app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import { siteUrl } from '@/utils/localeUtils';
import {
  SITEMAP_ARTICLE_PAGE_SIZE,
  chunkArray,
  fetchPublishedArticles,
} from '@/lib/sitemap';

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();
    const articles = await fetchPublishedArticles(generatedAt);
    const articleChunks = chunkArray(articles, SITEMAP_ARTICLE_PAGE_SIZE);

    const sitemapEntries = [
      `${siteUrl}/sitemap-static.xml`,
      ...articleChunks.map((_, i) => `${siteUrl}/sitemap-articles.xml?page=${i}`),
    ];

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
      .map(entry => `  <sitemap>
    <loc>${entry}</loc>
    <lastmod>${generatedAt}</lastmod>
  </sitemap>`)
      .join('\n')}
</sitemapindex>`;

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=60, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap index error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}