// src/lib/sitemap.ts
import { siteUrl } from '@/utils/localeUtils';

export const SITEMAP_ARTICLE_PAGE_SIZE = 10000;

export type Article = {
  slug: string;
  updatedAt: string;
  createdAt: string;
};

export const chunkArray = <T>(array: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );

const GRAPHQL_ENDPOINT = `${siteUrl}/api/graphql`;

const GET_ARTICLES = `
  query GetArticles($limit: Int!, $offset: Int!) {
    articles(filter: {}, limit: $limit, offset: $offset, status: PUBLISHED) {
      slug
      updatedAt
      createdAt
    }
  }
`;

export async function fetchPublishedArticles(generatedAt: string): Promise<Article[]> {
  const all: Article[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_ARTICLES,
        variables: { limit, offset },
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) break;

    const { data } = await res.json();
    const articles = data?.articles || [];

    if (articles.length === 0) break;

    all.push(...articles);
    offset += limit;
  }

  return all;
}

export const getArticleUrl = (slug: string, locale: Locale = 'en'): string => {
  const base = locale === 'en' ? `/${slug}` : `/${locale}/${slug}`;
  return `${siteUrl}${base}`;
};

export const buildArticleFields = (articles: Article[], generatedAt: string) => {
  return articles.map(article => ({
    loc: getArticleUrl(article.slug),
    lastmod: article.updatedAt || article.createdAt || generatedAt,
    changefreq: 'weekly' as const,
    priority: 0.7,
    alternates: {
      en: getArticleUrl(article.slug, 'en'),
      th: getArticleUrl(article.slug, 'th'),
      'x-default': getArticleUrl(article.slug, 'en'),
    },
  }));
};

export const buildStaticFields = (generatedAt: string) => {
  const routes = ['', 'articles', 'games', 'search', 'about', 'contact'];
  return routes.map(route => {
    const path = route ? `/${route}` : '';
    return {
      loc: `${siteUrl}${path}`,
      lastmod: generatedAt,
      changefreq: route ? 'daily' : 'hourly',
      priority: route ? 0.8 : 1.0,
      alternates: {
        en: `${siteUrl}${path}`,
        th: `${siteUrl}/th${path || ''}`,
        'x-default': `${siteUrl}${path}`,
      },
    };
  });
};

export const buildSitemapXml = (fields: any[]) => {
  const urls = fields
    .map(field => {
      const alt = field.alternates
        ? Object.entries(field.alternates)
          .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`)
          .join('\n')
        : '';

      return `  <url>
    <loc>${field.loc}</loc>
    <lastmod>${field.lastmod}</lastmod>
    <changefreq>${field.changefreq}</changefreq>
    <priority>${field.priority.toFixed(1)}</priority>
${alt}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
};