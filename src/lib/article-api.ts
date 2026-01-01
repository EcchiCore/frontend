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

/**
 * Transform article image URLs from filename to full CDN URLs
 */
function transformArticleImages(article: Article): Article {
  return {
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
  };
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
    const data = await graphqlRequest<{ downloads: Article["downloads"] }>(
      query,
      { articleId },
      "DownloadsByArticleId"
    );
    return data.downloads ?? null;
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
    const data = await graphqlRequest<{
      article: Article;
      downloads: Article["downloads"];
    }>(
      query,
      { slug, downloadsArticleId, language },
      "ArticleAndDownloads"
    );

    return {
      article: data.article ? transformArticleImages(data.article) : null,
      downloads: data.downloads ?? null
    };
  } catch (error) {
    console.error(`Failed to fetch article "${slug}" and downloads:`, error);
    return { article: null, downloads: null };
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
    }
  }`;

  try {
    const data = await graphqlRequest<{ article: Article }>(
      query,
      { slug, language },
      "ArticleBySlug"
    );

    return data.article ? transformArticleImages(data.article) : null;
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
    }
  }`;

  try {
    const articleData = await graphqlRequest<{ article: Article }>(
      query,
      { slug, language },
      "ArticleWithDownloads"
    );

    if (!articleData.article) {
      return { article: null, downloads: null };
    }

    const article = transformArticleImages(articleData.article);

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