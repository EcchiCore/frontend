// ===============================
// lib/api.ts
// ===============================


import { Article } from "@/types/article";

export type PagedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};



export async function fetchArticles(params: Record<string, string | string[] | undefined> | null | undefined) {
  const resolvedParams = await Promise.resolve(params);

  const page = Number(resolvedParams?.page ?? 1);
  const pageSize = Number(resolvedParams?.pageSize ?? 12);
  const offset = (page - 1) * pageSize;

  const filter: Record<string, any> = {};
  if (resolvedParams) {
    Object.entries(resolvedParams).forEach(([k, v]) => {
      if (typeof v === "string" && v && k !== "page" && k !== "pageSize" && k !== "status" && k !== "limit") {
        if (k === "favorited") {
          if (v === "true") {
            filter[k] = true;
          } else if (v === "false") {
            filter[k] = false;
          }
          // If not 'true' or 'false', omit 'favorited' from the filter
        } else {
          filter[k] = v;
        }
      } else if (Array.isArray(v)) {
        if (v.length > 0 && typeof v[0] === "string") {
          filter[k] = v[0];
        }
      }
    });
  }

  const filterString = Object.entries(filter)
    .map(([k, v]) => {
      if (typeof v === "string") {
        return `${k}: "${v}"`;
      } else if (typeof v === "boolean") {
        return `${k}: ${v}`;
      }
      return "";
    })
    .filter(Boolean)
    .join(", ");

  // Only include filter argument if we have filters
  const filterArg = filterString ? `filter: { ${filterString} }, ` : '';

  // Fetch one extra item to check if there's a next page
  const fetchLimit = pageSize + 1;

  const query = `query MyQuery {
    articles(${filterArg}limit: ${fetchLimit}, offset: ${offset}, status: PUBLISHED) {
      id
      author {
        image
        name
      }
      categories {
        name
      }
      coverImage
      createdAt
      creators {
        name
      }
      favoritesCount
      favorited
      mainImage
      status
      updatedAt
      ver
      platforms {
        name
      }
      tags {
        name
      }
      title
      author {
                image
                name
              }
      slug
    }

  }`;
  const variables = {}; // No variables are used now

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

  const allItems: Article[] = data.articles ?? [];

  // Check if there's a next page by seeing if we got more items than requested
  const hasNextPage = allItems.length > pageSize;

  // Only return the requested number of items
  const items = allItems.slice(0, pageSize);

  // Estimate total: if we have next page, total is at least current offset + items + 1
  // This allows pagination to work without knowing exact total
  const total = hasNextPage ? offset + pageSize + 1 : offset + items.length;

  return { items, total, page, pageSize } satisfies PagedResponse<Article>;
}

export async function fetchDownloadsByArticleId(articleId: number): Promise<Article["downloads"] | null> {
  const query = `query DownloadsByArticleId($articleId: Int!) {
    downloads(articleId: $articleId) {
      id
      isActive
      name
      url
      createdAt
      vipOnly
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

export async function fetchArticle(slug: string): Promise<Article | null> {
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
      downloads {
        id
        isActive
        name
        url
        createdAt
        vipOnly
      }
      favorited
      favoritesCount
      mainImage
      images {
        url
      }
      mods {
        downloadLink
        description
        creditTo
        categories {
          name
        }
        images {
          url
        }
        name
        status
        version
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
      "sec-ch-ua": "\"Brave\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",      "sec-ch-ua-mobile": "?0",
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

  return data.article ?? null;
}
