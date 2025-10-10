import type { Article } from "@/lib/api"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, Clock, Star } from "lucide-react"
import Image from "next/image"

export default function GameCard({ article }: { article: Article }) {
  const getHoursAgo = (dateString: string) => {
    const now = new Date()
    const created = new Date(dateString)
    const hours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    return hours
  }

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Windows: "bg-blue-600",
      Mac: "bg-gray-600",
      Linux: "bg-yellow-600",
      Android: "bg-green-600",
      HTML: "bg-orange-600",
      Unity: "bg-purple-600",
      "Unreal Engine": "bg-cyan-600",
      RenPy: "bg-pink-600",
    }
    return colors[platform] || "bg-gray-600"
  }

  const hoursAgo = getHoursAgo(article.createdAt)
  const randomViews = Math.floor(Math.random() * 50000) + 1000
  const randomRating = (Math.random() * 2 + 3).toFixed(1)

  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <Card className="overflow-hidden bg-card border-border/50 hover:border-primary/50 transition-all duration-300">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {(() => {
            const imageSrc = article.coverImage || article.mainImage || article.backgroundImage || null

            return imageSrc ? (
              <Image
                src={imageSrc || "/placeholder.svg"}
                alt={article.title}
                width={600}
                height={375}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
                <div className="text-muted-foreground text-4xl font-bold opacity-20">
                  {article.title.charAt(0).toUpperCase()}
                </div>
              </div>
            )
          })()}

          <div className="absolute top-2 left-2 flex gap-1.5">
            {article.platformList.slice(0, 2).map((platform) => (
              <Badge
                key={platform}
                className={`${getPlatformColor(platform)} text-white text-xs px-2 py-0.5 font-semibold border-0`}
              >
                {platform}
              </Badge>
            ))}
          </div>

          <div className="absolute top-2 right-2">
            <Badge className="bg-black/70 text-white text-xs px-2 py-0.5 font-medium border-0 backdrop-blur-sm">
              v{(Math.random() * 2 + 0.1).toFixed(1)}
            </Badge>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-bold text-base line-clamp-1 text-foreground group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{hoursAgo}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span>{article.favoritesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>{randomViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span>{randomRating}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {article.tagList.slice(0, 5).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-5 bg-secondary/80 hover:bg-primary hover:text-primary-foreground transition-colors border-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}
