"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/types/article"
import { getImageUrl } from "@/lib/imageUrl"

const PLATFORM_COLORS: Record<string, string> = {
  Windows: "bg-blue-600",
  Mac: "bg-zinc-600",
  Linux: "bg-yellow-600",
  Android: "bg-green-600",
  HTML: "bg-orange-600",
  Unity: "bg-purple-600",
  "Unreal Engine": "bg-cyan-700",
  RenPy: "bg-pink-600",
}

export default function GameCardImage({ article }: { article: Article }) {
  const [hasError, setHasError] = useState(false)

  const primaryImage = getImageUrl(
    article.coverImage || article.mainImage || article.backgroundImage || null,
    "card"
  )

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted/40 to-background/60 shrink-0">
      {primaryImage && !hasError ? (
        <Image
          src={primaryImage}
          alt={article.title || "Game image"}
          width={600}
          height={375}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          unoptimized
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/5 via-muted/30 to-background/80 flex items-center justify-center">
          <span className="text-4xl font-bold text-muted-foreground/20">
            {article.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Dark gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Platform badges — top left */}
      {(article.platforms ?? []).length > 0 && (
        <div className="absolute top-2 left-2 flex gap-1">
          {(article.platforms ?? []).slice(0, 2).map((p) => (
            <span
              key={p.name}
              className={`${PLATFORM_COLORS[p.name] ?? "bg-zinc-600"} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded`}
            >
              {p.name}
            </span>
          ))}
        </div>
      )}

      {/* Version badge — top right */}
      {article.ver && (
        <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
          {article.ver}
        </span>
      )}

      {/* Category badges — bottom left */}
      {(article.categories ?? []).length > 0 && (
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-0.5rem)]">
          {(article.categories ?? []).slice(0, 2).map((cat, i) => (
            <span
              key={i}
              className="bg-black/55 backdrop-blur-sm text-white/90 text-[10px] px-1.5 py-0.5 rounded"
            >
              {cat.name}
            </span>
          ))}
          {(article.categories ?? []).length > 2 && (
            <span className="bg-black/55 backdrop-blur-sm text-white/90 text-[10px] px-1.5 py-0.5 rounded">
              +{(article.categories ?? []).length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
