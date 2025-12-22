import { Article } from '@/types/article';
import { resolveArticleImageUrl, resolveArticleImageObject } from './articleImageUrl';

// ฟังก์ชันช่วยสำหรับเรียก GraphQL API
async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any>,
  operationName: string
): Promise<T> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    console.log(`[${operationName}] Token found:`, !!token);
    console.log(`[${operationName}] Token value:`, token ? `${token.substring(0, 20)}...` : 'none');

    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`[${operationName}] Headers:`, headers);

    const res = await fetch(`${process.env.API_URL || "https://api.chanomhub.com"}/api/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
        operationName,
      }),
      credentials: "include",
      ...(token ? { cache: 'no-store' } : { next: { revalidate: 3600 } })
    });

    // Log response status สำหรับ debug
    console.log(`[${operationName}] Status:`, res.status);

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

    // Log response สำหรับ debug
    console.log(`[${operationName}] Response:`, json);

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
  const query = `query ArticleBySlug($slug: String!, $language: String) {
    article(slug: $slug, language: $language) {
      id
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
  }`;

  try {
    const data = await graphqlRequest<{ article: Article }>(
      query,
      { slug, language },
      "ArticleBySlug"
    );
    console.log('Article data from API:', data.article);
    console.log('Author following status:', data.article?.author.following);
    return data.article ? transformArticleImages(data.article) : null;
  } catch (error) {
    console.error(`Failed to fetch article by slug "${slug}":`, error);
    return null;
  }
}