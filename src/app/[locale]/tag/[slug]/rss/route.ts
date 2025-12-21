// app/[[...locale]]/tag/[slug]/rss/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { resolveArticleImageUrl } from '@/lib/articleImageUrl';

// Interface for Article based on GraphQL response
interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  createdAt: string;
  mainImage: string | null;
  images: { url: string }[];
  ver: string | null;
  engine: { name: string } | null;
  sequentialCode: string | null;
  author: {
    name: string; // Changed from username to name as per GraphQL schema
  };
}

// Updated interface to match Next.js expectations
interface RouteParams {
  params: Promise<{ slug: string; locale: string }>;
}

// Define supported locales
const SUPPORTED_LOCALES = ['en', 'th', 'ja', 'ko'];
const DEFAULT_LOCALE = 'en';

const API_URL = process.env.API_URL || 'https://api.chanomhub.online';
const FRONTEND_URL = process.env.frontend || 'https://chanomhub.online';

async function fetchArticles(slug: string): Promise<Article[]> {
  const query = `query RSSTagArticles($tag: String!) {
    articles(filter: { tag: $tag }, status: PUBLISHED, limit: 20) {
      id
      title
      slug
      description
      createdAt
      mainImage
      images {
        url
      }
      ver
      engine {
        name
      }
      sequentialCode
      author {
        name
      }
    }
  }`;

  const res = await fetch(`${API_URL}/api/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { tag: slug },
    }),
    next: { revalidate: 0 }, // Remove cache
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch articles: ${res.status} ${res.statusText} - ${errorText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL Error: ${json.errors.map((e: any) => e.message).join(', ')}`);
  }

  return json.data.articles || [];
}

async function generateRSSFeed(articles: Article[], tagName: string, locale: string) {
  const siteURL = FRONTEND_URL;
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
      articleDate = article.createdAt
        ? new Date(article.createdAt).toUTCString()
        : new Date().toUTCString();
      if (articleDate === 'Invalid Date') {
        articleDate = new Date().toUTCString();
      }
    } catch (e) {
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
    <author>${escapeXML(article.author?.name || '')}</author>
    <ver>${escapeXML(article.ver || '')}</ver>
    <engine>${escapeXML(article.engine?.name || '')}</engine>
    <sequentialCode>${escapeXML(article.sequentialCode || '')}</sequentialCode>
`;

    // Add mainImage as a media:content element
    if (article.mainImage) {
      const resolvedMainImage = resolveArticleImageUrl(article.mainImage);
      if (resolvedMainImage) {
        xml += `
    <media:content url="${escapeXML(resolvedMainImage)}" medium="image" />
`;
      }
    }

    // Add additional images as media:content elements
    if (article.images && article.images.length > 0) {
      article.images.forEach((image) => {
        const resolvedImageUrl = resolveArticleImageUrl(image.url);
        if (resolvedImageUrl) {
          xml += `
    <media:content url="${escapeXML(resolvedImageUrl)}" medium="image" />
`;
        }
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