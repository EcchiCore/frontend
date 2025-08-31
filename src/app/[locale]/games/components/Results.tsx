// ===============================
// app/games/components/Results.tsx
// ===============================
import { fetchArticles, type Article } from "@/lib/api";
import GameCard from "./GameCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Results({ searchParams }: { searchParams: Record<string, string | string[] | undefined> | null | undefined }) {
  const { items, total, page, pageSize } = await fetchArticles(searchParams);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4 ">
      <div className="text-sm opacity-80">ทั้งหมด {total.toLocaleString()} รายการ</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {items.map((a: Article) => (
          <GameCard key={String(a.id)} article={a} />
        ))}
      </div>
      <Pager page={page} pages={pages} searchParams={searchParams} />
    </div>
  );
}

function Pager({ page, pages, searchParams }: { page: number; pages: number; searchParams: Record<string, string | string[] | undefined> | null | undefined }) {
  const prev = page > 1 ? page - 1 : 1;
  const next = page < pages ? page + 1 : pages;
  const params = (p: number) => {
    const usp = new URLSearchParams();
    // Check for null or undefined before using Object.entries
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (typeof v === "string" && v) usp.set(k, v);
        else if (Array.isArray(v)) v.forEach((vv) => vv && usp.append(k, vv));
      });
    }
    usp.set('page', String(p));
    return `?${usp.toString()}`;
  };
  return (
    <div className="flex items-center gap-2 justify-center pt-2 text-foreground">
      <Button asChild variant="outline">
        <Link href={params(prev)}>ก่อนหน้า</Link>
      </Button>
      <span className="text-sm opacity-70 text-foreground">หน้า {page} / {pages}</span>
      <Button asChild variant="outline">
        <Link href={params(next)}>ถัดไป</Link>
      </Button>
    </div>
  );
}
