import { Link } from "@/i18n/navigation";
import { createChanomhubClient } from "@chanomhub/sdk";
import { ArticleListItem } from "@chanomhub/sdk";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Heart } from "lucide-react";
import { unstable_cache } from "next/cache";
import { singleFlight } from "@/lib/cache/singleFlight";
import { getTranslations } from "next-intl/server";
import { getImageUrl } from "@/lib/imageUrl";

// Cache query results for 5 minutes
const _getCachedArticleResults = unstable_cache(
  async (
    limit: number,
    offset: number,
    filter: Record<string, string | boolean | undefined>,
    sortBy?: string,
    sortOrder?: string
  ) => {
    const sdk = createChanomhubClient();
    return sdk.articles.getAllPaginated({
      limit,
      offset,
      status: "PUBLISHED",
      filter: {
        ...filter,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      } as any,
      fields: [
        "id", "title", "slug", "description", "ver",
        "mainImage", "coverImage", "backgroundImage",
        "author", "tags", "platforms", "categories",
        "favoritesCount", "createdAt", "updatedAt",
        "price", "isPaid", "viewsCount",
      ],
    });
  },
  ["article-results"],
  { revalidate: 300 }
);

const getCachedArticleResults = (
  limit: number,
  offset: number,
  filter: Record<string, string | boolean | undefined>,
  sortBy?: string,
  sortOrder?: string
) =>
  singleFlight(
    `article-results-${limit}-${offset}-${JSON.stringify(filter)}-${sortBy}-${sortOrder}`,
    () => _getCachedArticleResults(limit, offset, filter, sortBy, sortOrder)
  );

export default async function ArticleResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("gameResults");
  const params = await searchParams;

  const limit = Number(params.pageSize ?? 30);
  const offset = (Number(params.page ?? 1) - 1) * limit;
  const sort = String(params.sort ?? "latest");

  let sortBy: string | undefined = "updatedAt";
  let sortOrder: string | undefined = "desc";

  if (sort === "popular") {
    sortBy = "viewsCount";
    sortOrder = "desc";
  } else if (sort === "views_asc") {
    sortBy = "viewsCount";
    sortOrder = "asc";
  } else if (sort === "az") {
    sortBy = "title";
    sortOrder = "asc";
  } else if (sort === "oldest") {
    sortBy = "createdAt";
    sortOrder = "asc";
  }

  const filter = {
    q: params.q ? String(params.q) : undefined,
    tag: params.tag ? String(params.tag) : undefined,
    platform: params.platform ? String(params.platform) : undefined,
    category: params.category ? String(params.category) : undefined,
    author: params.author ? String(params.author) : undefined,
    engine: params.engine ? String(params.engine) : undefined,
    sequentialCode: params.sequentialCode ? String(params.sequentialCode) : undefined,
    favorited: params.favorited === "true" ? true : undefined,
  };

  const result = await getCachedArticleResults(limit, offset, filter, sortBy, sortOrder);
  const { items, total, page, pageSize } = result;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4 text-muted-foreground">
      {/* Top filter results bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted border border-border rounded-lg px-4 py-2.5 shadow-sm">
        <span className="text-xs text-muted-foreground">
          พบผลลัพธ์ทั้งหมด <span className="font-bold text-foreground">{total.toLocaleString()}</span> รายการ
        </span>
        <SortBar current={sort} searchParams={params} />
      </div>

      {/* Steam Search List Layout styled with Shadcn */}
      {items.length > 0 ? (
        <div className="border border-border rounded-lg divide-y divide-border bg-card overflow-hidden shadow-lg">
          {items.map((a: ArticleListItem) => {
            const hasCover = a.coverImage || a.mainImage || null;
            const coverUrl = hasCover ? (getImageUrl(hasCover, "cardThumbnail") || hasCover) : null;
            const releaseYear = new Date(a.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });

            return (
              <Link
                key={String(a.id)}
                href={`/articles/${a.slug}`}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2.5 hover:bg-muted/50 transition-all duration-150 border-l-2 border-l-transparent hover:border-l-primary"
              >
                {/* Left: Thumbnail Image */}
                <div className="relative w-full sm:w-40 aspect-video rounded-md overflow-hidden bg-black/40 border border-border shrink-0">
                  {coverUrl ? (
                    <img src={coverUrl} alt={a.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xl">📰</div>
                  )}
                </div>

                {/* Center: Title & Platform Badges */}
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate mb-1.5">
                    {a.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    {/* Platforms */}
                    {a.platforms?.map((p: any, idx: number) => (
                      <span key={idx} className="bg-muted border border-border text-muted-foreground px-1.5 py-0.2 rounded-sm font-semibold uppercase">
                        {p.name}
                      </span>
                    ))}
                    <span className="text-muted-foreground/60 mx-1">•</span>
                    {/* Categories */}
                    {a.categories?.slice(0, 1).map((c: any, idx: number) => (
                      <span key={idx} className="text-primary font-bold uppercase">
                        {c.name}
                      </span>
                    ))}
                    <span className="text-muted-foreground/60 mx-1">•</span>
                    <span className="text-muted-foreground/80">{releaseYear}</span>
                  </div>
                </div>

                {/* Right: Stats, Rating, Price */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto shrink-0 gap-2 sm:gap-1 text-right pl-2 sm:pl-0 border-t border-border/40 sm:border-t-0 pt-2 sm:pt-0">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1" title="ผู้เข้าชม">
                      <Eye className="w-3.5 h-3.5" />
                      {(a.viewsCount || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1" title="รายการโปรด">
                      <Heart className="w-3.5 h-3.5 text-primary" />
                      {(a.favoritesCount || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Price Box */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {a.isPaid ? (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-0.5 text-amber-500 font-bold">
                        {a.price} CC
                      </div>
                    ) : (
                      <div className="bg-primary/10 border border-primary/20 rounded-md px-2 py-0.5 text-primary font-bold uppercase tracking-wider text-[9px]">
                        FREE
                      </div>
                    )}
                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-lg shadow-md">
          <div className="text-6xl mb-4 opacity-20">🎮</div>
          <h3 className="text-xl font-bold text-foreground mb-2">ไม่พบบทความ</h3>
          <p className="text-muted-foreground text-center max-w-md text-xs">
            ลองปรับเปลี่ยนคำค้นหา หรือคลิกตัวเลือกตัวกรองอื่นที่แถบเมนูด้านข้าง
          </p>
        </div>
      )}

      {items.length > 0 && <Pager page={page} pages={pages} searchParams={params} />}
    </div>
  );
}

function SortBar({
  current,
  searchParams,
}: {
  current: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const options = [
    { label: "ล่าสุด", value: "latest" },
    { label: "ยอดนิยม", value: "popular" },
    { label: "วิวน้อยที่สุด", value: "views_asc" },
    { label: "A–Z", value: "az" },
  ];

  const makeHref = (sort: string) => {
    const usp = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (typeof v === "string" && v) usp.set(k, v);
      else if (Array.isArray(v)) v.forEach((vv) => vv && usp.append(k, vv));
    });
    usp.set("sort", sort);
    usp.delete("page");
    return `?${usp.toString()}`;
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] text-muted-foreground mr-1">เรียงตาม:</span>
      {options.map((o) => (
        <Link
          key={o.value}
          href={makeHref(o.value)}
          className={`px-2.5 py-0.5 rounded-md text-[11px] transition-colors border ${
            current === o.value
              ? "bg-primary text-primary-foreground border-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}

function Pager({
  page,
  pages,
  searchParams,
}: {
  page: number;
  pages: number;
  searchParams: Record<string, string | string[] | undefined> | null | undefined;
}) {
  const prev = page > 1 ? page - 1 : 1;
  const next = page < pages ? page + 1 : pages;

  const toHref = (p: number) => {
    const usp = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (typeof v === "string" && v) usp.set(k, v);
        else if (Array.isArray(v)) v.forEach((vv) => vv && usp.append(k, vv));
      });
    }
    usp.set("page", String(p));
    return `?${usp.toString()}`;
  };

  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(pages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6 text-foreground text-xs">
      <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page === 1}>
        <Link href={toHref(prev)}><ChevronLeft className="w-4 h-4" /></Link>
      </Button>

      <div className="flex items-center gap-1.5">
        {startPage > 1 && (
          <>
            <Button asChild variant="outline" size="sm" className="h-8 min-w-[32px] p-0">
              <Link href={toHref(1)}>1</Link>
            </Button>
            {startPage > 2 && <span className="text-muted-foreground text-xs px-0.5">…</span>}
          </>
        )}
        {pageNumbers.map((n) => (
          <Button key={n} asChild variant={n === page ? "default" : "outline"} size="sm" className="h-8 min-w-[32px] p-0">
            <Link href={toHref(n)}>{n}</Link>
          </Button>
        ))}
        {endPage < pages && (
          <>
            {endPage < pages - 1 && <span className="text-muted-foreground text-xs px-0.5">…</span>}
            <Button asChild variant="outline" size="sm" className="h-8 min-w-[32px] p-0">
              <Link href={toHref(pages)}>{pages}</Link>
            </Button>
          </>
        )}
      </div>

      <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page === pages}>
        <Link href={toHref(next)}><ChevronRight className="w-4 h-4" /></Link>
      </Button>
    </div>
  );
}
