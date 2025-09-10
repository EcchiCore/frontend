// ===============================
// lib/api.ts
// ===============================
export type Article = {
  id: number;
  title: string;
  slug: string;
  description: string;
  body: string;
  ver: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED' | 'NOT_APPROVED' | 'NEEDS_REVISION';
  engine: 'RENPY' | 'RPGM' | 'UNITY' | 'UNREAL' | 'GODOT' | 'TyranoBuilder' | 'WOLFRPG' | 'KIRIKIRI' | 'FLASH' | 'BakinPlayer';
  mainImage: string | null;
  backgroundImage: string | null;
  coverImage: string | null;
  images: string[];
  tagList: string[];
  categoryList: string[];
  platformList: string[];
  author: {
    username: string;
    bio: string | null;
    image: string | null;
    backgroundImage: string | null;
    following: boolean;
    socialMediaLinks: { platform: string; url: string }[];
  };
  favorited: boolean;
  favoritesCount: number;
  sequentialCode: string | null;
};

export type PagedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://api.chanomhub.online";

export async function fetchArticles(params: Record<string, string | string[] | undefined> | null | undefined) {
  const usp = new URLSearchParams();
  
  // Handle params after ensuring they are ready
  const resolvedParams = await Promise.resolve(params);
  // Check for null or undefined before using Object.entries
  if (resolvedParams) {
    Object.entries(resolvedParams).forEach(([k, v]) => {
      if (typeof v === "string" && v.length) usp.set(k, v);
      else if (Array.isArray(v)) v.forEach((vv) => vv && usp.append(k, vv));
    });
  }

  // Translate page and pageSize to offset and limit
  const page = Number(usp.get("page") ?? 1);
  const pageSize = Number(usp.get("pageSize") ?? 12);
  const offset = (page - 1) * pageSize;
  usp.set("limit", String(pageSize));
  usp.set("offset", String(offset));
  usp.delete("pageSize");

  const url = `${API_BASE}/api/articles?${usp.toString()}`;
  console.log('Fetching articles from:', url);
  const res = await fetch(url, { next: { revalidate: 3600 } }); // cache for 1 hour
  if (!res.ok) throw new Error(`API error ${res.status} for URL: ${url}`);

  // Normalize response to match PagedResponse
  const data = await res.json();

  const items: Article[] = data.articles ?? data.items ?? data.data ?? (Array.isArray(data) ? data : []);
  
  const total =
    typeof data.articlesCount === "number"
      ? data.articlesCount
      : typeof data.total === "number"
      ? data.total
      : typeof data.count === "number"
      ? data.count
      : items.length;

  return { items, total, page, pageSize } satisfies PagedResponse<Article>;
}