import type { Article } from "@/types/article"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, Clock, Star } from "lucide-react"
import Image from "next/image"

export default function GameCard({ article }: { article: Article }) {
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const created = new Date(dateString)
    const hours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))

    if (hours < 1) return "ใหม่"
    if (hours < 24) return `${hours} ชม.`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} วัน`
    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks} สัปดาห์`
    const months = Math.floor(days / 30)
    return `${months} เดือน`
  }

  const getPlatformBadge = (engine: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      RENPY: { label: "RenPy", color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
      RPGM: { label: "RPG Maker", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      UNITY: { label: "Unity", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      UNREAL: { label: "Unreal", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
      GODOT: { label: "Godot", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
      TyranoBuilder: { label: "Tyrano", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
      WOLFRPG: { label: "Wolf RPG", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      KIRIKIRI: { label: "Kirikiri", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      FLASH: { label: "Flash", color: "bg-red-500/10 text-red-500 border-red-500/20" },
      BakinPlayer: { label: "Bakin", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
    }
    return badges[engine] || { label: engine, color: "bg-gray-500/10 text-gray-500 border-gray-500/20" }
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

  const imageSrc = article.coverImage || article.mainImage || article.backgroundImage || null

  return (
    <Link href={`/articles/${article.slug}?id=${article.id}`} className="group block h-full">
      <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted/50 to-background/50">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={article.title || "Game image"}
              width={600}
              height={375}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/5 via-muted/50 to-background/80 flex items-center justify-center">
              <div className="text-muted-foreground/30 text-6xl font-bold">
                {article.title.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {article.platforms.slice(0, 2).map((platform) => (
              <Badge
                key={platform.name}
                className={`${getPlatformColor(platform.name)} text-white text-xs px-2 py-0.5 font-semibold border-0`}
              >
                {platform.name}
              </Badge>
            ))}
          </div>

          <div className="absolute top-2 right-2">
            <Badge className="bg-black/70 text-white text-xs px-2 py-0.5 font-medium border-0 backdrop-blur-sm">
              v{(Math.random() * 2 + 0.1).toFixed(1)}
            </Badge>
          </div>

          {/* Categories */}
          {article.categories.length > 0 && (
            <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap max-w-[calc(100%-1rem)]">
              {article.categories.slice(0, 2).map((cat, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-black/50 backdrop-blur-sm border-0 text-white/90 hover:bg-black/70 transition-colors"
                >
                  {cat.name}
                </Badge>
              ))}
              {article.categories.length > 2 && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-black/50 backdrop-blur-sm border-0 text-white/90"
                >
                  +{article.categories.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-tight min-h-[2.5rem]">
            {article.title}
          </h3>

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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 hover:text-primary transition-colors">
                <Heart className="w-3.5 h-3.5" />
                <span className="font-medium">{article.favoritesCount}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-primary transition-colors">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-medium">{Math.floor(Math.random() * 50000) + 1000}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span className="font-medium">{(Math.random() * 2 + 3).toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{getTimeAgo(article.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 5).map((tag) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-5 bg-secondary/80 hover:bg-primary hover:text-primary-foreground transition-colors border-0"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}
