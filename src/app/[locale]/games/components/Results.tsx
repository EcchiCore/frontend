import { createServerClient } from "@chanomhub/sdk/next"
import { ArticleListItem, ArticleListOptions } from "@chanomhub/sdk"
import GameCard from "./GameCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default async function Results({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const sdk = await createServerClient();

  // Prepare list options
  const options: ArticleListOptions = {
    limit: Number(params.pageSize ?? 12),
    offset: (Number(params.page ?? 1) - 1) * Number(params.pageSize ?? 12),
    status: 'PUBLISHED',
    filter: {}
  };

  // Map params to filter
  if (params.tag) options.filter!.tag = String(params.tag);
  if (params.platform) options.filter!.platform = String(params.platform);
  if (params.category) options.filter!.category = String(params.category);
  if (params.author) options.filter!.author = String(params.author);
  if (params.favorited) options.filter!.favorited = params.favorited === 'true';

  const { items, total, page, pageSize } = await sdk.articles.getAllPaginated(options);
  const pages = Math.max(1, Math.ceil(total / pageSize))


  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div className="text-sm text-muted-foreground">
          พบ <span className="font-semibold text-foreground">{total}</span> รายการ
        </div>
      )}

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a: ArticleListItem) => (
            <GameCard key={String(a.id)} article={a as any} />
          ))}

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="text-6xl mb-4 opacity-20">🎮</div>
          <h3 className="text-xl font-bold text-foreground mb-2">ไม่พบรายการ</h3>
          <p className="text-muted-foreground text-center max-w-md">
            ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา ลองปรับเงื่อนไขหรือค้นหาใหม่อีกครั้ง
          </p>
        </div>
      )}

      {items.length > 0 && <Pager page={page} pages={pages} searchParams={params} />}
    </div>
  )
}

function Pager({
  page,
  pages,
  searchParams,
}: { page: number; pages: number; searchParams: Record<string, string | string[] | undefined> | null | undefined }) {
  const prev = page > 1 ? page - 1 : 1
  const next = page < pages ? page + 1 : pages

  const params = (p: number) => {
    const usp = new URLSearchParams()
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (typeof v === "string" && v) usp.set(k, v)
        else if (Array.isArray(v)) v.forEach((vv) => vv && usp.append(k, vv))
      })
    }
    usp.set("page", String(p))
    return `?${usp.toString()}`
  }

  // คำนวณช่วงหน้าที่จะแสดง (แสดง 5 หน้า โดยหน้าปัจจุบันอยู่กลาง)
  const maxVisible = 5
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
  let endPage = Math.min(pages, startPage + maxVisible - 1)

  // ปรับ startPage ถ้า endPage ชนขอบ
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  )

  return (
    <div className="flex items-center justify-center gap-2 pt-6 text-foreground">
      <Button asChild variant="outline" size="sm" disabled={page === 1}>
        <Link href={params(prev)}>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        {startPage > 1 && (
          <>
            <Button asChild variant="outline" size="sm" className="min-w-[40px]">
              <Link href={params(1)}>1</Link>
            </Button>
            {startPage > 2 && <span className="text-muted-foreground">...</span>}
          </>
        )}

        {pageNumbers.map((pageNum) => {
          const isActive = pageNum === page
          return (
            <Button key={pageNum} asChild variant={isActive ? "default" : "outline"} size="sm" className="min-w-[40px]">
              <Link href={params(pageNum)}>{pageNum}</Link>
            </Button>
          )
        })}

        {endPage < pages && (
          <>
            {endPage < pages - 1 && <span className="text-muted-foreground">...</span>}
            <Button asChild variant="outline" size="sm" className="min-w-[40px]">
              <Link href={params(pages)}>{pages}</Link>
            </Button>
          </>
        )}
      </div>

      <Button asChild variant="outline" size="sm" disabled={page === pages}>
        <Link href={params(next)}>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  )
}
