"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/types/article"

export default function GameCardImage({ article }: { article: Article }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const primaryImage =
        article.coverImage || article.mainImage || article.backgroundImage || null

    // Collect all valid images: Primary + Gallery
    const images = [
        primaryImage,
        ...(article.images || []).map((img) => img.url),
    ].filter((img): img is string => !!img)

    // Cycler effect
    useEffect(() => {
        if (!isHovered || images.length <= 1) {
            setCurrentImageIndex(0)
            return
        }

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }, 1500)

        return () => clearInterval(interval)
    }, [isHovered, images.length])

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

    const currentImageSrc = images[currentImageIndex] || null

    return (
        <div
            className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted/50 to-background/50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {currentImageSrc ? (
                <Image
                    key={currentImageSrc}
                    src={currentImageSrc}
                    alt={article.title || "Game image"}
                    width={600}
                    height={375}
                    className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isHovered ? "scale-110" : "scale-100"
                        } ${isHovered && currentImageIndex > 0 ? "opacity-90" : "opacity-100"
                        }`}
                    unoptimized
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
                {/* Mobile: ไม่มี blur, Desktop: มี blur */}
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

            {/* Image Indicator Dots */}
            {isHovered && images.length > 1 && (
                <div className="absolute bottom-2 right-2 flex gap-1 justify-end">
                    {images.slice(0, 5).map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-4 bg-primary" : "w-1.5 bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
