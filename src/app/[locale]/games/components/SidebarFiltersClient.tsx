"use client"

import type React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, ChevronDown, ChevronUp, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

const GAME_CODE_PATTERN = /^[Hh][Jj]\d+$/

type Props = {
  tags: string[]
  categories: string[]
  platforms: string[]
  engines: string[]
}

type FilterSectionProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {title}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && <div className="mt-2 space-y-0.5">{children}</div>}
    </div>
  )
}

export default function SidebarFiltersClient({ tags, categories, platforms, engines }: Props) {
  const t = useTranslations("gameCodeDetection")
  const tSearch = useTranslations("searchControls")
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [searchText, setSearchText] = useState("")
  const [activeTag, setActiveTag] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const [activePlatform, setActivePlatform] = useState("")
  const [author, setAuthor] = useState("")
  const [engine, setEngine] = useState("")
  const [sequentialCode, setSequentialCode] = useState("")
  const [showCodeConfirm, setShowCodeConfirm] = useState(false)
  const [detectedCode, setDetectedCode] = useState("")

  // Sync state from URL params on load/navigation
  useEffect(() => {
    setSearchText(sp.get("q") ?? "")
    setActiveTag(sp.get("tag") ?? "")
    setActiveCategory(sp.get("category") ?? "")
    setActivePlatform(sp.get("platform") ?? "")
    setAuthor(sp.get("author") ?? "")
    setEngine(sp.get("engine") ?? "")
    setSequentialCode(sp.get("sequentialCode") ?? "")
  }, [sp])

  const pushParams = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString())
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "") params.delete(key)
        else params.set(key, value)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, sp]
  )

  // Full search apply — from current state + optional overrides
  const applyAll = useCallback(
    (overrides: Record<string, string | null> = {}) => {
      pushParams({
        q: searchText || null,
        tag: activeTag || null,
        category: activeCategory || null,
        platform: activePlatform || null,
        author: author || null,
        engine: engine || null,
        sequentialCode: sequentialCode || null,
        ...overrides,
      })
    },
    [searchText, activeTag, activeCategory, activePlatform, author, engine, sequentialCode, pushParams]
  )

  const handleSearch = useCallback(() => {
    const trimmed = searchText.trim()
    if (GAME_CODE_PATTERN.test(trimmed)) {
      setDetectedCode(trimmed.toUpperCase())
      setShowCodeConfirm(true)
      return
    }
    applyAll()
  }, [searchText, applyAll])

  const toggleTag = (val: string) => {
    const next = activeTag === val ? "" : val
    setActiveTag(next)
    applyAll({ tag: next || null })
  }

  const toggleCategory = (val: string) => {
    const next = activeCategory === val ? "" : val
    setActiveCategory(next)
    applyAll({ category: next || null })
  }

  const togglePlatform = (val: string) => {
    const next = activePlatform === val ? "" : val
    setActivePlatform(next)
    applyAll({ platform: next || null })
  }

  const clearFilters = () => {
    setSearchText("")
    setActiveTag("")
    setActiveCategory("")
    setActivePlatform("")
    setAuthor("")
    setEngine("")
    setSequentialCode("")
    pushParams({
      q: null, tag: null, category: null, platform: null,
      author: null, engine: null, sequentialCode: null,
    })
  }

  const hasActiveFilters =
    searchText || activeTag || activeCategory || activePlatform || author || engine || sequentialCode

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={tSearch("searchPlaceholder")}
            className="pl-8 pr-8 h-8 text-sm bg-background border-border/50"
          />
          {searchText && (
            <button
              onClick={() => { setSearchText(""); applyAll({ q: null }) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Game code detection banner */}
        {showCodeConfirm && (
          <div className="mt-2 bg-primary/10 border border-primary/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Hash className="w-3.5 h-3.5" />
              {t("title")}
            </div>
            <p className="text-xs text-foreground">{t("description", { code: detectedCode })}</p>
            <div className="flex gap-1.5 flex-wrap">
              <Button
                onClick={() => {
                  setSequentialCode(detectedCode)
                  setSearchText("")
                  setShowCodeConfirm(false)
                  applyAll({ q: null, sequentialCode: detectedCode })
                }}
                size="sm"
                className="h-6 text-xs px-2"
              >
                <Hash className="w-3 h-3 mr-1" />{t("searchByCode")}
              </Button>
              <Button
                onClick={() => { setShowCodeConfirm(false); applyAll() }}
                variant="outline" size="sm"
                className="h-6 text-xs px-2 text-foreground"
              >
                {t("searchByText")}
              </Button>
              <Button
                onClick={() => setShowCodeConfirm(false)}
                variant="ghost" size="sm"
                className="h-6 text-xs px-2 text-foreground"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Tags — primary filter (itch.io style pill cloud) */}
        {tags.length > 0 && (
          <FilterSection title={tSearch("tag")} defaultOpen>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs border transition-colors",
                    activeTag === tag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Categories — secondary list */}
        {categories.length > 0 && (
          <FilterSection title={tSearch("category")} defaultOpen={false}>
            <button
              onClick={() => toggleCategory("")}
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors text-left",
                activeCategory === ""
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              ทั้งหมด
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors text-left",
                  activeCategory === cat
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </FilterSection>
        )}

        {/* Platforms */}
        {platforms.length > 0 && (
          <FilterSection title={tSearch("platform")} defaultOpen>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs border transition-colors",
                    activePlatform === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Advanced: author, engine, game code */}
        <FilterSection title={tSearch("advancedFilters")} defaultOpen={false}>
          <div className="space-y-2">
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyAll()}
              placeholder={tSearch("author")}
              className="h-8 text-xs bg-background border-border/50"
            />
            {/* Engine as pills if available */}
            {engines.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {engines.map((eng) => (
                  <button
                    key={eng}
                    onClick={() => {
                      const next = engine === eng ? "" : eng
                      setEngine(next)
                      applyAll({ engine: next || null })
                    }}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs border transition-colors",
                      engine === eng
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {eng}
                  </button>
                ))}
              </div>
            ) : (
              <Input
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyAll()}
                placeholder={tSearch("engine")}
                className="h-8 text-xs bg-background border-border/50"
              />
            )}
            <Input
              value={sequentialCode}
              onChange={(e) => setSequentialCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyAll()}
              placeholder={tSearch("gameCode")}
              className="h-8 text-xs bg-background border-border/50"
            />
            <Button onClick={() => applyAll()} size="sm" className="w-full h-8 text-xs">
              <Search className="w-3 h-3 mr-1" />
              {tSearch("search")}
            </Button>
          </div>
        </FilterSection>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <div className="px-3 pb-3">
          <button
            onClick={clearFilters}
            className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors border border-border/40 hover:border-destructive/40"
          >
            <X className="w-3 h-3" />
            {tSearch("clearFilters")}
          </button>
        </div>
      )}
    </div>
  )
}
