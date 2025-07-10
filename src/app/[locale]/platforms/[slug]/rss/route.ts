// app/[[...locale]]/platforms/[slug]/rss/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

// Interface for Article
interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  createdAt: string;
  mainImage: string;
  images?: string[];
  ver: string;
  version: number;
  engine: string;
  platformList: string[];
  sequentialCode: string;
}

interface RouteParams {
  params: Promise<{ slug: string; locale?: string[] }>;
}

// Define supported locales
const SUPPORTED_LOCALES = ['en', 'th', 'ja', 'ko'];
const DEFAULT_LOCALE = 'en';

async function fetchArticles(slug: string): Promise<{ articles: Article[] }> {
  const apiUrl = `${process.env.API_URL}/api/articles?platform=${encodeURIComponent(slug)}&status=PUBLISHED`;
  const res = await fetch(apiUrl, { next: { revalidate: 0 } }); // Remove cache

  if (!res.ok) {
    throw new Error('Failed to fetch articles');
  }

  return res.json();
}

async function generateRSSFeed(articles: Article[], platformName: string, locale: string) {
  const siteURL = process.env.frontend;
  const platformSlug = encodeURIComponent(platformName);
  const feedURL = `${siteURL}/${locale}/platforms/${platformSlug}/rss`;
  const websiteURL = `${siteURL}/${locale}/platforms/${platformSlug}`;

  // Current date in RSS format
  const pubDate = new Date().toUTCString();

  // Get translations
  const t = await getTranslations({ locale, namespace: 'rss' });

  // Localized channel metadata using next-intl
  const channelTitle = t('platformFeedTitle', { platformName });
  const channelDescription = t('platformFeedDescription', { platformName });

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
    if (!article.platformList.map((p) => p.toLowerCase()).includes(platformName.toLowerCase())) {
      console.warn(`Article ${article.id} skipped: platformList does not include ${platformName}`);
      return;
    }

    let articleDate;
    try {
      if (article.createdAt && typeof article.createdAt === 'string') {
        articleDate = new Date(article.createdAt).toUTCString();
        if (articleDate === 'Invalid Date') {
          console.warn(`Invalid date format for article ${article.id}: ${article.createdAt}`);
          articleDate = new Date().toUTCString();
        }
      } else {
        articleDate = new Date().toUTCString();
      }
    } catch (e) {
      console.error(`Error parsing date for article ${article.id}:`, e);
      articleDate = new Date().toUTCString();
    }

    const articleUrl = `${siteURL}/${locale}/articles/${article.slug}`;

    xml += `
  <item>
    <title>${escapeXML(article.title)}</title>
    <link>${articleUrl}</link>
    <guid>${articleUrl}</guid>
    <pubDate>${articleDate}</pubDate>
    <description>${escapeXML(article.description || '')}</description>
    <ver>${escapeXML(article.ver || '')}</ver>
    <engine>${escapeXML(article.engine)}</engine>
    <sequentialCode>${escapeXML(article.sequentialCode)}</sequentialCode>
    <platformList>${escapeXML(platformName)}</platformList>
`;

    if (article.mainImage) {
      xml += `
    <media:content url="${escapeXML(article.mainImage)}" medium="image" />
`;
    }

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

  // Close the channel and RSS tags
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