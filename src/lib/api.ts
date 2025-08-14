// ===============================
// lib/api.ts
// ===============================
export type Article = {
  id: string | number;
  title: string;
  description?: string;
  coverImage?: string;
  mainImage?: string;
  createdAt?: string;
  updatedAt?: string;
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
  usp.delete("page");
  usp.delete("pageSize");

  const url = `${API_BASE}/api/articles?${usp.toString()}`;
  console.log('Fetching articles from:', url);
  const res = await fetch(url, { cache: "no-store" }); // dynamic hole for PPR
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