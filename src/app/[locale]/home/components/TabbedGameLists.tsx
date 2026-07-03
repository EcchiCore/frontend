"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { getImageUrl } from "@/lib/imageUrl"

type MixProps = {
  mixRpgFantasy: any[]
  mixRpgAdventure: any[]
  mixRpgStoryRich: any[]
}

export default function TabbedGameLists({ mixRpgFantasy, mixRpgAdventure, mixRpgStoryRich }: MixProps) {
  const t = useTranslations("homePage")
  const [activeTab, setActiveTab] = useState<"fantasy" | "adventure" | "storyRich">("fantasy")

  const tabs = [
    { id: "fantasy" as const, label: t("mixRpgFantasy"), games: mixRpgFantasy },
    { id: "adventure" as const, label: t("mixRpgAdventure"), games: mixRpgAdventure },
    { id: "storyRich" as const, label: t("mixRpgStoryRich"), games: mixRpgStoryRich },
  ]

  const activeGames = tabs.find((tab) => tab.id === activeTab)?.games || []

  return (
    <div className="space-y-5 my-8">
      {/* Header section with heading and tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-3">
        <h2 className="text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2 shrink-0">
          <span className="w-1 h-3.5 bg-primary rounded-full"></span>
          {t("tagMixes")}
        </h2>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 md:gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {activeGames.map((article) => {
          const coverUrl = getImageUrl(
            article.coverImage || article.mainImage || article.backgroundImage || null,
            "card"
          )

          // Stable mock discount based on article ID
          const hasPrice = article.isPaid && article.price && article.price > 0
          let discountPct = 0
          let originalPrice = 0

          if (hasPrice) {
            discountPct = 20 + (Number(article.id) % 6) * 10 // 20%, 30%, 40%, 50%, 60%, 70%
            originalPrice = Math.round(article.price / (1 - discountPct / 100))
          }

          // Badge text (GOG replica style)
          const isAndroid = article.platforms?.some((p: any) => p.name.toLowerCase() === "android")
          const badgeText = isAndroid ? "GOOD MOBILE GAME" : "GOOD OLD GAME"

          return (
            <Link
              key={String(article.id)}
              href={`/articles/${article.slug}`}
              className="group flex flex-col h-full bg-card/30 hover:bg-card/75 border border-border/30 hover:border-primary/45 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {/* Cover Image Wrapper */}
              <div className="relative aspect-[16/10] bg-black/40 overflow-hidden shrink-0">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={article.title}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/5 via-muted/30 to-background/80 flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground/35">
                      {article.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* GOG style brand badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-[2px] border border-white/10 rounded px-1.5 py-0.5">
                  <span className="text-[8px] font-black tracking-widest text-white/90">
                    {badgeText}
                  </span>
                </div>

                {/* Dark gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                {/* Title */}
                <h3 className="font-bold text-xs leading-snug text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {article.title}
                </h3>

                {/* Pricing / Discount section */}
                <div className="flex items-center justify-end mt-auto pt-2 border-t border-border/10">
                  {hasPrice ? (
                    <div className="flex items-center gap-2">
                      {/* Discount percentage badge */}
                      <div className="bg-purple-600/90 text-white font-black text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                        -{discountPct}%
                      </div>

                      {/* Prices layout */}
                      <div className="flex flex-col items-end leading-none">
                        <span className="text-[9px] text-muted-foreground line-through decoration-muted-foreground/60 mb-0.5">
                          {originalPrice} CC
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {article.price} CC
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-primary/10 border border-primary/20 text-primary font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                      FREE
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
