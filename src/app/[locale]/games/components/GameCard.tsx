import type { Article } from "@/types/article"
import Link from "next/link"
import { Heart, Clock } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useFormatter } from "next-intl"
import GameCardImage from "./GameCardImage"

export default function GameCard({ article }: { article: Article }) {
  const format = useFormatter()

  const getTimeAgo = (dateString: string) => {
    return format.relativeTime(new Date(dateString))
  }

  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <div className="bg-card border border-border/40 rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md hover:shadow-black/5 transition-all duration-200 h-full flex flex-col">
        {/* Cover image */}
        <GameCardImage article={article} />

        {/* Body */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Author row */}
          {article.author && (
            <div className="flex items-center gap-1.5">
              {article.author.image ? (
                <Image
                  src={article.author.image}
                  alt={article.author.name}
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-primary">
                    {article.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xs text-muted-foreground truncate">
                by {article.author.name}
              </span>
            </div>
          )}

          {/* Tags row */}
          {(article.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(article.tags ?? []).slice(0, 4).map((tag) => (
                <span
                  key={tag.name}
                  className="inline-block rounded px-1.5 py-0.5 text-[10px] bg-secondary/60 text-muted-foreground border border-border/40"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer: hearts + time */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span className="font-medium">{article.favoritesCount?.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{getTimeAgo(article.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
