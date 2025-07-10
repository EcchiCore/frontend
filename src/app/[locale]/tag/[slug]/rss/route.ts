// app/[[...locale]]/tag/[slug]/rss/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

// Interface for Article (adjust based on your actual Article interface)
interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  createdAt: string;
  mainImage: string;
  images?: string[];
  ver?: string;
  engine?: string;
  sequentialCode?: string;
  author: {
    username: string;
  };
}

interface ArticlesResponse {
  articles: Article[];
}

// Interface for route params
interface RouteParams {
  params: Promise<{ slug: string; locale?: string[] }>;
}

// Define supported locales
const SUPPORTED_LOCALES = ['en', 'th', 'ja', 'ko'];
const DEFAULT_LOCALE = 'en';

// Fetch articles without locale in API call
async function fetchArticles(slug: string): Promise<ArticlesResponse> {
  const apiUrl = `${process.env.API_URL}/api/articles?tag=${encodeURIComponent(slug)}&status=PUBLISHED`;
  const res = await fetch(apiUrl, { next: { revalidate: 0 } }); // Remove cache

  if (!res.ok) {
    throw new Error('Failed to fetch articles');
  }

  return res.json();
}

async function generateRSSFeed(articles: Article[], tagName: string, locale: string) {
  const siteURL = process.env.frontend;
  const tagSlug = encodeURIComponent(tagName);
  const feedURL = `${siteURL}/${locale}/tag/${tagSlug}/rss`;
  const websiteURL = `${siteURL}/${locale}/tag/${tagSlug}`;

  // Current date in RSS format
  const pubDate = new Date().toUTCString();

  // Get translations
  const t = await getTranslations({ locale, namespace: 'rss' });

  // Localized channel metadata using next-intl
  const channelTitle = t('tagFeedTitle', { tagName });
  const channelDescription = t('tagFeedDescription', { tagName });

  // XML header with media namespace
  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>${escapeXML(channelTitle)}</title>
  <link>${websiteURL}</link>
  <description>${escapeXML(channelDescription)}</description>
  <language>${locale}</language>
  <lastBuildDate>${pubDate}</lastBuildDate>
  <atom:link href="${feedURL}" rel="self" type="application/rss+xml" />
`;

  articles.forEach((article) => {
    // Handle article date safely
    let articleDate;
    try {
      articleDate = article.createdAt && typeof article.createdAt === 'string'
        ? new Date(article.createdAt).toUTCString()
        : new Date().toUTCString();
      if (articleDate === 'Invalid Date') {
        console.warn(`Invalid date format for article ${article.id}: ${article.createdAt}`);
        articleDate = new Date().toUTCString();
      }
    } catch (e) {
      console.error(`Error parsing date for article ${article.id}:`, e);
      articleDate = new Date().toUTCString();
    }

    const articleUrl = `${siteURL}/${locale}/articles/${encodeURIComponent(article.slug)}`;

    xml += `
  <item>
    <title>${escapeXML(article.title)}</title>
    <link>${articleUrl}</link>
    <guid>${articleUrl}</guid>
    <pubDate>${articleDate}</pubDate>
    <description>${escapeXML(article.description || '')}</description>
    <author>${escapeXML(article.author.username)}</author>
    <ver>${escapeXML(article.ver || '')}</ver>
    <engine>${escapeXML(article.engine || '')}</engine>
    <sequentialCode>${escapeXML(article.sequentialCode || '')}</sequentialCode>
`;

    // Add mainImage as a media:content element
    if (article.mainImage) {
      xml += `
    <media:content url="${escapeXML(article.mainImage)}" medium="image" />
`;
    }

    // Add additional images as media:content elements
    if (article.images && article.images.length > 0) {
      article.images.forEach((image) => {
        xml += `
    <media:content url="${escapeXML(image)}" medium="image" />
`;
      });
    }

    xml += `
  </item>`;
  });

  // Close XML tags
  xml += `
</channel>
</rss>`;

  return xml;
}

// Helper function to escape XML special characters
function escapeXML(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const { slug, locale: localeArray } = resolvedParams;

    // Extract locale from the array or use default
    let locale = DEFAULT_LOCALE;
    if (localeArray && localeArray.length > 0) {
      const potentialLocale = localeArray[0];
      if (SUPPORTED_LOCALES.includes(potentialLocale)) {
        locale = potentialLocale;
      }
    }

    const decodedSlug = decodeURIComponent(slug);

    const { articles } = await fetchArticles(decodedSlug);
    const rssContent = await generateRSSFeed(articles, decodedSlug, locale);

    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        // Cache removed as requested
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    );
  }
}