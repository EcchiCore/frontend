"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/types/article"
import { getImageUrl } from "@/lib/imageUrl"

export default function GameCardImage({ article }: { article: Article }) {
    const [hasError, setHasError] = useState(false)

    // Get primary image only — no gallery cycling to save memory
    const primaryImage = getImageUrl(
        article.coverImage || article.mainImage || article.backgroundImage || null,
        'card'
    )

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

    return (
        <div
            className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted/50 to-background/50"
        >
            {primaryImage && !hasError ? (
                <Image
                    src={primaryImage}
                    alt={article.title || "Game image"}
                    width={600}
                    height={375}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/5 via-muted/50 to-background/80 flex items-center justify-center">
                    <div className="text-muted-foreground/30 text-6xl font-bold">
                        {article.title.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}

            {/* Gradient Overlay - Desktop only */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top Badges */}
            <div className="absolute top-2 left-2 flex gap-1.5">
                {(article.platforms ?? []).slice(0, 2).map((platform) => (
                    <Badge
                        key={platform.name}
                        className={`${getPlatformColor(
                            platform.name
                        )} text-white text-xs px-2 py-0.5 font-semibold border-0`}
                    >
                        {platform.name}
                    </Badge>
                ))}
            </div>

            <div className="absolute top-2 right-2">
                <Badge className="bg-black/70 text-white text-xs px-2 py-0.5 font-medium border-0 md:backdrop-blur-sm">
                    {article.ver}
                </Badge>
            </div>

            {/* Categories */}
            {(article.categories ?? []).length > 0 && (
                <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap max-w-[calc(100%-1rem)]">
                    {(article.categories ?? []).slice(0, 2).map((cat, idx) => (
                        <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 bg-black/50 md:backdrop-blur-sm border-0 text-white/90 md:hover:bg-black/70 transition-colors"
                        >
                            {cat.name}
                        </Badge>
                    ))}
                    {(article.categories ?? []).length > 2 && (
                        <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5 bg-black/50 md:backdrop-blur-sm border-0 text-white/90"
                        >
                            +{(article.categories ?? []).length - 2}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}
