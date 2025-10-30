import { Article } from '@/types/article';

export async function fetchDownloadsByArticleId(articleId: number): Promise<Article["downloads"] | null> {
  const query = `query DownloadsByArticleId($articleId: Int!) {
    downloads(articleId: $articleId) {
      id
      name
      url
      vipOnly
      isActive
    }
  }`;

  const variables = {
    articleId,
  };

  const res = await fetch("https://api.chanomhub.online/api/graphql", {
    method: "POST",
    headers: {
      "accept": "application/graphql-response+json, application/json, multipart/mixed",
      "accept-language": "en-US,en;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Brave\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1"
    },
    body: JSON.stringify({
      query,
      variables,
      operationName: "DownloadsByArticleId",
    }),
    credentials: "include",
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('API error response:', errorBody);
    throw new Error(`API error ${res.status} for URL: https://api.chanomhub.online/api/graphql`);
  }

  const { data, errors } = await res.json();

  if (errors) {
    console.error("GraphQL Errors:", errors);
    throw new Error("GraphQL query failed");
  }

  return data.downloads ?? null;
}

export async function fetchArticleAndDownloads(slug: string, downloadsArticleId: number): Promise<{ article: Article | null; downloads: Article["downloads"] | null }> {
  const query = `query MyQuery($slug: String!, $downloadsArticleId: Int!) {
    article(slug: $slug) {
      author {
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

  const variables = {
    slug,
    downloadsArticleId,
  };

  const res = await fetch("https://api.chanomhub.online/api/graphql", {
    method: "POST",
    headers: {
      "accept": "application/graphql-response+json, application/json, multipart/mixed",
      "accept-language": "en-US,en;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Brave\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1"
    },
    body: JSON.stringify({
      query,
      variables,
      operationName: "MyQuery",
    }),
    credentials: "include",
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('API error response:', errorBody);
    throw new Error(`API error ${res.status} for URL: https://api.chanomhub.online/api/graphql`);
  }

  const { data, errors } = await res.json();

  if (errors) {
    console.error("GraphQL Errors:", errors);
    throw new Error("GraphQL query failed");
  }

  return { article: data.article ?? null, downloads: data.downloads ?? null };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
      const query = `query MyQuery($slug: String!) {
        article(slug: $slug) {
          author {
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

  const variables = {
    slug,
  };

  const res = await fetch("https://api.chanomhub.online/api/graphql", {
    method: "POST",
    headers: {
      "accept": "application/graphql-response+json, application/json, multipart/mixed",
      "accept-language": "en-US,en;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Brave\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1"
    },
    body: JSON.stringify({
      query,
      variables,
      operationName: "MyQuery",
    }),
    credentials: "include",
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('API error response:', errorBody);
    throw new Error(`API error ${res.status} for URL: https://api.chanomhub.online/api/graphql`);
  }

  const { data, errors } = await res.json();

  if (errors || !data) {
    console.error("GraphQL Errors:", errors);
    // If article is not found, data.article will be null, so we return null.
    // Otherwise, re-throw the error if it's a different kind of GraphQL error.
    if (!data?.article) {
      return null;
    }
    throw new Error("GraphQL query failed");
  }

  return data.article ?? null;
}
