import type { Article } from "@/types/article"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Clock } from "lucide-react"
import Image from "next/image"
import GameCardImage from "./GameCardImage"

export default function GameCard({ article }: { article: Article }) {
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const created = new Date(dateString)
    const hours = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    )

    if (hours < 1) return "ใหม่"
    if (hours < 24) return `${hours} ชม.`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} วัน`
    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks} สัปดาห์`
    const months = Math.floor(days / 30)
    return `${months} เดือน`
  }

  return (
    <div className="group block h-full">
      <Link href={`/articles/${article.slug}`} className="block h-full">
        {/* Mobile: ลด effects เพื่อ performance, Desktop: เต็ม effects */}
        <Card className="overflow-hidden bg-card/50 md:backdrop-blur-sm border-border/40 md:hover:border-primary/40 md:hover:shadow-xl md:hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col">
          {/* Image Container (Client Component) */}
          <GameCardImage article={article} />

          {/* Content (Server Component) */}
          <div className="p-4 space-y-3 flex-1 flex flex-col">
            {/* Title */}
            <h3 className="font-bold text-base line-clamp-2 text-foreground md:group-hover:text-primary transition-colors leading-tight min-h-[2.5rem]">
              {article.title}
            </h3>

            {/* Description - Mobile: simple, Desktop: glass effect + expand on hover */}
            {article.description && (
              <div className="relative overflow-hidden rounded-lg">
                {/* Desktop only: glass effect background */}
                <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 backdrop-blur-sm border border-border/30"></div>
                {/* Mobile: simple background */}
                <div className="md:hidden absolute inset-0 bg-muted/30 border border-border/30 rounded-lg"></div>
                <div className="relative p-3 max-h-16 md:group-hover:max-h-32 md:transition-all md:duration-300 overflow-hidden">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 md:group-hover:line-clamp-6">
                    {article.description}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/80 to-transparent md:group-hover:opacity-0 md:transition-opacity"></div>
                </div>
              </div>
            )}

            {/* Author */}
            {article.author && (
              <div className="flex items-center gap-2">
                {article.author.image ? (
                  <Image
                    src={article.author.image}
                    alt={article.author.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {article.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {article.author.name}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-border/40">
              <div className="flex items-center gap-1 hover:text-primary transition-colors">
                <Heart className="w-3.5 h-3.5" />
                <span className="font-medium">{article.favoritesCount}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{getTimeAgo(article.updatedAt)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {(article.tags ?? []).slice(0, 5).map((tag) => (
                <Badge
                  key={tag.name}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 bg-secondary/80 md:hover:bg-primary md:hover:text-primary-foreground transition-colors border-0"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}
