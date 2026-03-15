import { Article } from '@/types/article';
import { resolveArticleImageUrl, resolveArticleImageObject } from './articleImageUrl';

// ฟังก์ชันช่วยสำหรับเรียก GraphQL API
// Note: token parameter is optional - if not provided, request will be cached
async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any>,
  operationName: string,
  token?: string | null
): Promise<T> {
  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${process.env.API_URL || "https://api.chanomhub.com"}/api/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
        operationName,
      }),
      credentials: "include",
      // Only disable cache if we have a token (authenticated request)
      ...(token ? { cache: 'no-store' as const } : { next: { revalidate: 3600 } })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[${operationName}] HTTP Error:`, {
        status: res.status,
        statusText: res.statusText,
        body: errorText
      });
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();

    if (json.errors) {
      console.error(`[${operationName}] GraphQL Errors:`, json.errors);
      throw new Error(`GraphQL Error: ${json.errors.map((e: any) => e.message).join(', ')}`);
    }

    return json.data;
  } catch (error) {
    console.error(`[${operationName}] Request Failed:`, error);
    throw error;
  }
}

// Helper function to get token from cookies (only call when needed for authenticated requests)
async function getAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value ?? null;
  } catch {
    return null;
  }
}

// CDN Base URL - can be configured via environment variable
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.chanomhub.com/cdn-cgi/image/format=auto';
const STORAGE_DOWNLOAD_URL = process.env.NEXT_PUBLIC_STORAGE_DOWNLOAD_URL || 'https://storage.chanomhub.com';

/**
 * Resolves an article download URL.
 * - If it's already a full URL, returns it as-is
 * - If it's just a path (e.g., "public/abc.zip"), prepends the storage base URL
 * - Handles null/undefined gracefully
 */
export function resolveDownloadUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Already a full URL - return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Path only - prepend storage base URL
  const baseUrl = STORAGE_DOWNLOAD_URL.endsWith('/') ? STORAGE_DOWNLOAD_URL.slice(0, -1) : STORAGE_DOWNLOAD_URL;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${path}`;
}

/**
 * Transform article data (images and downloads) from filename/paths to full URLs
 */
function transformArticleData(article: Article): Article {
  const transformed = {
    ...article,
    mainImage: resolveArticleImageUrl(article.mainImage),
    backgroundImage: resolveArticleImageUrl(article.backgroundImage),
    coverImage: resolveArticleImageUrl(article.coverImage),
    images: article.images
      .map(img => resolveArticleImageObject(img))
      .filter((img): img is { url: string } => img !== null),
    author: {
      ...article.author,
      image: resolveArticleImageUrl(article.author.image),
      backgroundImage: resolveArticleImageUrl(article.author.backgroundImage),
    },
    // Transform official download sources
    officialDownloadSources: article.officialDownloadSources?.map(source => ({
      ...source,
      url: resolveDownloadUrl(source.url) || source.url
    })) || [],
  };

  // Transform downloads if they exist in the article object
  if (transformed.downloads) {
    transformed.downloads = transformed.downloads.map(download => ({
      ...download,
      url: resolveDownloadUrl(download.url) || download.url
    }));
  }

  return transformed;
}

export async function fetchDownloadsByArticleId(
  articleId: number
): Promise<Article["downloads"] | null> {
  const query = `query DownloadsByArticleId($articleId: Int!) {
    downloads(articleId: $articleId) {
      id
      name
      url
      vipOnly
      isActive
    }
  }`;

  try {
    const token = await getAuthToken();
    const data = await graphqlRequest<{ downloads: Article["downloads"] }>(
      query,
      { articleId },
      "DownloadsByArticleId",
      token
    );

    if (!data.downloads) return null;

    // Transform download URLs in the standalone fetch
    return data.downloads.map(download => ({
      ...download,
      url: resolveDownloadUrl(download.url) || download.url
    }));
  } catch (error) {
    console.error(`Failed to fetch downloads for article ${articleId}:`, error);
    return null;
  }
}

export async function fetchArticleAndDownloads(
  slug: string,
  downloadsArticleId: number,
  language?: string
): Promise<{ article: Article | null; downloads: Article["downloads"] | null }> {
  const query = `query ArticleAndDownloads($slug: String!, $downloadsArticleId: Int!, $language: String) {
    article(slug: $slug, language: $language) {
      id
      slug
      author {
        following
        id
        image
        name
      }
      backgroundImage
      body
      categories {
        name
      }
      coverImage
      createdAt
      creators {
        name
      }
      description
      favorited
      favoritesCount
      mainImage
      images {
        url
      }
      officialDownloadSources {
        name
        url
        status
      }
      platforms {
        name
      }
      status
      tags {
        name
      }
      title
      updatedAt
      ver
      price
      isPaid
      isUnlocked
      viewsCount
    }
    downloads(articleId: $downloadsArticleId) {
      id
      name
      url
      vipOnly
      isActive
    }
  }`;

  try {
    const token = await getAuthToken();
    const data = await graphqlRequest<{
      article: Article;
      downloads: Article["downloads"];
    }>(
      query,
      { slug, downloadsArticleId, language },
      "ArticleAndDownloads",
      token
    );

    const article = data.article ? transformArticleData(data.article) : null;
    const downloads = data.downloads ? data.downloads.map(d => ({
      ...d,
      url: resolveDownloadUrl(d.url) || d.url
    })) : null;

    return {
      article,
      downloads
    };
  } catch (error) {
    console.error(`Failed to fetch article "${slug}" and downloads:`, error);
    return { article: null, downloads: null };
  }
}

import { getSdk } from '@/lib/sdk';

export async function getArticleMods(articleId: number): Promise<any[]> {
  try {
    const sdk = await getSdk();
    const mods = await sdk.articles.getMods(articleId, {
      fields: ['id', 'name', 'version', 'description', 'status', 'downloadLink', 'images', 'creditTo', 'categories']
    });

    // SDK might already transform URLs, but ensure consistency
    return mods.map(mod => ({
      ...mod,
      downloadLink: resolveDownloadUrl(mod.downloadLink) || mod.downloadLink
    }));
  } catch (error) {
    console.error(`Failed to fetch mods for article ${articleId}:`, error);
    return [];
  }
}

export async function getArticleBySlug(slug: string, language?: string): Promise<Article | null> {
  // Note: This query intentionally excludes user-specific fields (favorited, following)
  // to enable caching for anonymous users. User-specific data should be fetched client-side.
  const query = `query ArticleBySlug($slug: String!, $language: String) {
    article(slug: $slug, language: $language) {
      id
      slug
      author {
        id
        image
        name
      }
      backgroundImage
      body
      categories {
        name
      }
      coverImage
      createdAt
      creators {
        name
      }
      description
      favoritesCount
      mainImage
      images {
        url
      }
      officialDownloadSources {
        name
        url
        status
      }
      platforms {
        name
      }
      status
      tags {
        name
      }
      title
      updatedAt
      ver
      price
      isPaid
      isUnlocked
      viewsCount
    }
  }`;

  try {
    const token = await getAuthToken();
    const data = await graphqlRequest<{ article: Article }>(
      query,
      { slug, language },
      "ArticleBySlug",
      token
    );

    return data.article ? transformArticleData(data.article) : null;
  } catch (error) {
    console.error(`Failed to fetch article by slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch article by slug and its downloads.
 * Uses the article's own ID for the downloads query.
 * This is the preferred function for article pages - no need for ID in URL.
 */
export async function getArticleWithDownloads(
  slug: string,
  language?: string
): Promise<{ article: Article | null; downloads: Article["downloads"] | null }> {
  // First, fetch the article to get its ID
  const query = `query ArticleWithDownloads($slug: String!, $language: String) {
    article(slug: $slug, language: $language) {
      id
      slug
      author {
        id
        image
        name
      }
      backgroundImage
      body
      categories {
        name
      }
      coverImage
      createdAt
      creators {
        name
      }
      description
      favoritesCount
      mainImage
      images {
        url
      }
      officialDownloadSources {
        name
        url
        status
      }
      platforms {
        name
      }
      status
      tags {
        name
      }
      title
      updatedAt
      ver
      price
      isPaid
      isUnlocked
      viewsCount
    }
  }`;

  try {
    const token = await getAuthToken();
    const articleData = await graphqlRequest<{ article: Article }>(
      query,
      { slug, language },
      "ArticleWithDownloads",
      token
    );

    if (!articleData.article) {
      return { article: null, downloads: null };
    }

    const article = transformArticleData(articleData.article);

    // Ensure ID is a number for the downloads query
    const articleId = typeof article.id === 'string' ? parseInt(article.id, 10) : article.id;

    // Now fetch downloads using the article's ID
    const downloads = await fetchDownloadsByArticleId(articleId);

    return { article, downloads };
  } catch (error) {
    console.error(`Failed to fetch article "${slug}" with downloads:`, error);
    return { article: null, downloads: null };
  }
}