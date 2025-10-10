import { fetchArticles, type Article } from "@/lib/api"
import GameCard from "./GameCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default async function Results({
                                        searchParams,
                                      }: { searchParams: Record<string, string | string[] | undefined> | null | undefined }) {
  const { items, total, page, pageSize } = await fetchArticles(searchParams)
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
          {items.map((a: Article) => (
            <GameCard key={String(a.id)} article={a} />
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

      {items.length > 0 && <Pager page={page} pages={pages} searchParams={searchParams} />}
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

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <Button asChild variant="outline" size="sm" disabled={page === 1}>
        <Link href={params(prev)}>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          const pageNum = i + 1
          const isActive = pageNum === page
          return (
            <Button key={pageNum} asChild variant={isActive ? "default" : "outline"} size="sm" className="min-w-[40px]">
              <Link href={params(pageNum)}>{pageNum}</Link>
            </Button>
          )
        })}
        {pages > 5 && <span className="text-muted-foreground">...</span>}
      </div>

      <Button asChild variant="outline" size="sm" disabled={page === pages}>
        <Link href={params(next)}>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  )
}
