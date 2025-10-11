import { generateLanguageAlternates } from '@/utils/metadataUtils';
import { siteUrl, supportedLocales } from '@/utils/localeUtils';

export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SitemapField {
  loc: string;
  lastmod: string;
  changefreq: ChangeFrequency;
  priority: number;
  contentPath: string;
}

export interface ArticleSummary {
  id: number;
  slug: string;
  updatedAt?: string;
}

const staticRouteMeta: Array<{
  path: string;
  changefreq: ChangeFrequency;
  priority: number;
}> = [
  { path: '', changefreq: 'daily', priority: 1.0 },
  { path: 'home', changefreq: 'daily', priority: 0.9 },
  { path: 'community', changefreq: 'weekly', priority: 0.6 },
  { path: 'content', changefreq: 'weekly', priority: 0.6 },
  { path: 'docs', changefreq: 'weekly', priority: 0.6 },
  { path: 'games', changefreq: 'weekly', priority: 0.6 },
  { path: 'contact', changefreq: 'monthly', priority: 0.5 },
  { path: 'login', changefreq: 'monthly', priority: 0.5 },
  { path: 'logout', changefreq: 'monthly', priority: 0.4 },
  { path: 'member/dashboard', changefreq: 'weekly', priority: 0.6 },
  { path: 'member/dashboard/moderator', changefreq: 'weekly', priority: 0.5 },
  { path: 'member/dashboard/profile', changefreq: 'weekly', priority: 0.5 },
  { path: 'member/dashboard/settings', changefreq: 'weekly', priority: 0.5 },
  { path: 'member/profile', changefreq: 'monthly', priority: 0.5 },
  { path: 'member/settings', changefreq: 'monthly', priority: 0.4 },
  { path: 'moderator/pending-posts', changefreq: 'weekly', priority: 0.5 },
  { path: 'nst', changefreq: 'monthly', priority: 0.4 },
  { path: 'privacy-policy', changefreq: 'yearly', priority: 0.3 },
  { path: 'register', changefreq: 'monthly', priority: 0.5 },
  { path: 's', changefreq: 'weekly', priority: 0.5 },
  { path: 'search', changefreq: 'weekly', priority: 0.6 },
  { path: 'tools', changefreq: 'weekly', priority: 0.6 },
  { path: 'upload/games', changefreq: 'weekly', priority: 0.6 },
  { path: 'user', changefreq: 'weekly', priority: 0.6 },
  { path: 'articles', changefreq: 'daily', priority: 0.7 },
  { path: 'articles/Official/user', changefreq: 'weekly', priority: 0.6 },
  { path: 'articles/Official/moderator', changefreq: 'weekly', priority: 0.6 },
];

export const SITEMAP_ARTICLE_PAGE_SIZE = 500;

export async function fetchPublishedArticles(fallbackLastMod: string): Promise<ArticleSummary[]> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    console.warn('API_URL is not defined; skipping article entries.');
    return [];
  }

  const pageSize = SITEMAP_ARTICLE_PAGE_SIZE;
  const allArticles: ArticleSummary[] = [];

  try {
    let offset = 0;
    let hasNextPage = true;
    let safetyCounter = 0;
    let totalCount: number | undefined;
    const maxPages = 200; // Prevent unbounded loops

    while (hasNextPage && safetyCounter < maxPages) {
      const response = await fetch(
        `${apiUrl}/api/articles?status=PUBLISHED&limit=${pageSize}&offset=${offset}`,
        {
          headers: { accept: 'application/json' },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch articles for sitemap:', response.status, response.statusText);
        break;
      }

      const data = await response.json();
      const articles: any[] = Array.isArray(data?.articles) ? data.articles : [];
      const reportedCount = typeof data?.articlesCount === 'number' ? data.articlesCount : undefined;

      if (typeof totalCount === 'undefined' && typeof reportedCount === 'number') {
        totalCount = reportedCount;
      }

      if (articles.length === 0) {
        break;
      }

      allArticles.push(
        ...articles.map(article => ({
          id: article.id,
          slug: article.slug,
          updatedAt: article.updatedAt ?? fallbackLastMod,
        }))
      );

      offset += pageSize;

      if (typeof totalCount === 'number') {
        hasNextPage = offset < totalCount;
      } else {
        hasNextPage = articles.length === pageSize;
      }

      safetyCounter += 1;
    }
  } catch (error) {
    console.error('Unhandled error fetching articles for sitemap:', error);
  }

  return allArticles;
}

export function buildStaticFields(lastmod: string): SitemapField[] {
  const fields: SitemapField[] = [];

  staticRouteMeta.forEach(({ path, changefreq, priority }) => {
    const suffix = path ? `/${path}` : '';

    for (const locale of supportedLocales) {
      fields.push({
        loc: `${siteUrl}/${locale}${suffix}`,
        lastmod,
        changefreq,
        priority,
        contentPath: path,
      });
    }
  });

  fields.push({
    loc: siteUrl,
    lastmod,
    changefreq: 'daily',
    priority: 1.0,
    contentPath: '',
  });

  return fields;
}

export function buildArticleFields(
  articles: ArticleSummary[],
  fallbackLastMod: string
): SitemapField[] {
  const fields: SitemapField[] = [];

  articles.forEach(article => {
    if (!article.slug) return;

    const contentPath = `articles/${article.slug}`;
    const lastmod = article.updatedAt ? new Date(article.updatedAt).toISOString() : fallbackLastMod;

    for (const locale of supportedLocales) {
      fields.push({
        loc: `${siteUrl}/${locale}/${contentPath}`,
        lastmod,
        changefreq: 'weekly',
        priority: 0.7,
        contentPath,
      });
    }
  });

  return fields;
}

export function buildSitemapXml(fields: SitemapField[]): string {
  const urls = fields
    .map(field => `  <url>
    <loc>${field.loc}</loc>
    <lastmod>${field.lastmod}</lastmod>
    <changefreq>${field.changefreq}</changefreq>
    <priority>${field.priority.toFixed(1)}</priority>
    ${buildAlternateLinks(field.contentPath)}
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

export function buildAlternateLinks(contentPath: string): string {
  const alternates = generateLanguageAlternates(contentPath);

  return Object.entries(alternates)
    .map(([hreflang, href]) => `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`)
    .join('\n    ');
}

export function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  return chunks;
}
