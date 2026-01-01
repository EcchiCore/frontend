// app/[[...locale]]/platforms/[slug]/rss/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { createChanomhubClient, type ArticleListItem } from '@chanomhub/sdk';

// Updated interface to match Next.js expectations
interface RouteParams {
  params: Promise<{ slug: string; locale: string }>;
}

// Define supported locales
const SUPPORTED_LOCALES = ['en', 'th', 'ja', 'ko'];
const DEFAULT_LOCALE = 'en';

const FRONTEND_URL = process.env.frontend || 'https://chanomhub.com';

// Create SDK client
const sdk = createChanomhubClient();

async function fetchArticles(slug: string): Promise<ArticleListItem[]> {
  return sdk.articles.getByPlatform(slug, { limit: 20 });
}

async function generateRSSFeed(articles: ArticleListItem[], platformName: string, locale: string) {
  const siteURL = FRONTEND_URL;
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
    // Check if platform matches (redundant if API filters correctly, but good for safety)
    const platformList = article.platforms?.map(p => p.name) || [];
    if (!platformList.map((p) => p.toLowerCase()).includes(platformName.toLowerCase())) {
      // console.warn(`Article ${article.id} skipped: platformList does not include ${platformName}`);
      // return; 
      // Note: The API filter should handle this, but if fuzzy matching is used, we might keep it.
      // For now, let's trust the API or be lenient.
    }

    let articleDate;
    try {
      if (article.createdAt) {
        articleDate = new Date(article.createdAt).toUTCString();
        if (articleDate === 'Invalid Date') {
          articleDate = new Date().toUTCString();
        }
      } else {
        articleDate = new Date().toUTCString();
      }
    } catch (e) {
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
    <engine>${escapeXML(typeof article.engine === 'object' ? article.engine?.name || '' : '')}</engine>
    <sequentialCode>${escapeXML(article.sequentialCode || '')}</sequentialCode>
    <platformList>${escapeXML(platformName)}</platformList>
`;

    // Add mainImage (already transformed by SDK)
    if (article.mainImage) {
      xml += `
    <media:content url="${escapeXML(article.mainImage)}" medium="image" />
`;
    }

    // Add images (already transformed by SDK)
    if (article.images && article.images.length > 0) {
      article.images.forEach((image) => {
        xml += `
    <media:content url="${escapeXML(image.url)}" medium="image" />
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
    const { slug, locale: localeParam } = resolvedParams;

    // Validate and set locale
    let locale = DEFAULT_LOCALE;
    if (localeParam && SUPPORTED_LOCALES.includes(localeParam)) {
      locale = localeParam;
    }

    const decodedSlug = decodeURIComponent(slug);

    const articles = await fetchArticles(decodedSlug);
    const rssContent = await generateRSSFeed(articles, decodedSlug, locale);

    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return NextResponse.json(
      { error: `Failed to generate RSS feed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}