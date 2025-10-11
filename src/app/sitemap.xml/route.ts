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
      ...articleChunks.map((_, index) => `${siteUrl}/sitemap-articles.xml?page=${index}`),
    ];

    const body = buildSitemapIndexXml(sitemapEntries);

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function buildSitemapIndexXml(entries: string[]): string {
  const sitemaps = entries
    .map(entry => `  <sitemap>
    <loc>${entry}</loc>
  </sitemap>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
}
