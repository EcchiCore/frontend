"use client"

import type React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, X, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const tSearch = useTranslations("searchControls")
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [activeTag, setActiveTag] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const [activePlatform, setActivePlatform] = useState("")
  const [author, setAuthor] = useState("")
  const [engine, setEngine] = useState("")
  const [sequentialCode, setSequentialCode] = useState("")
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState("")

  useEffect(() => {
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

  const applyAll = useCallback(
    (overrides: Record<string, string | null> = {}) => {
      pushParams({
        tag: activeTag || null,
        category: activeCategory || null,
        platform: activePlatform || null,
        author: author || null,
        engine: engine || null,
        sequentialCode: sequentialCode || null,
        ...overrides,
      })
    },
    [activeTag, activeCategory, activePlatform, author, engine, sequentialCode, pushParams]
  )

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
    setActiveTag("")
    setActiveCategory("")
    setActivePlatform("")
    setAuthor("")
    setEngine("")
    setSequentialCode("")
    pushParams({
      tag: null, category: null, platform: null,
      author: null, engine: null, sequentialCode: null,
    })
  }

  const hasActiveFilters =
    activeTag || activeCategory || activePlatform || author || engine || sequentialCode

  const filteredModalTags = tagSearchQuery.trim() === ""
    ? tags
    : tags.filter((t) => t.toLowerCase().includes(tagSearchQuery.toLowerCase()))

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      <div className="p-3 space-y-3">
        {/* Tags */}
        {tags.length > 0 && (
          <FilterSection title={tSearch("tag")} defaultOpen>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(() => {
                let displayTags = tags
                if (tags.length > 15) {
                  displayTags = tags.slice(0, 15)
                  if (activeTag && tags.includes(activeTag) && !displayTags.includes(activeTag)) {
                    displayTags = [...tags.slice(0, 14), activeTag]
                  }
                }
                return displayTags.map((tag) => (
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
                ))
              })()}

              {tags.length > 15 && (
                <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
                  <DialogTrigger asChild>
                    <button className="rounded-md px-2 py-1 text-xs border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors font-medium flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      {tSearch("moreTags", { count: tags.length - 15 })}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 text-foreground">
                    <DialogHeader className="p-4 border-b border-border/40 pb-4">
                      <DialogTitle>{tSearch("selectGameTags", { count: tags.length })}</DialogTitle>
                    </DialogHeader>

                    <div className="p-4 border-b border-border/40">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={tagSearchQuery}
                          onChange={(e) => setTagSearchQuery(e.target.value)}
                          placeholder={tSearch("searchTagsPlaceholder")}
                          className="pl-9 bg-accent/50 border-transparent focus-visible:border-primary"
                          autoFocus
                        />
                        {tagSearchQuery && (
                          <button
                            onClick={() => setTagSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-y-auto p-4 flex-1 min-h-[300px]">
                      {filteredModalTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {activeTag && !filteredModalTags.includes(activeTag) && tagSearchQuery === "" && (
                            <button
                              onClick={() => toggleTag(activeTag)}
                              className="rounded-md px-2.5 py-1.5 text-sm bg-primary text-primary-foreground border border-primary transition-colors"
                            >
                              {activeTag}
                            </button>
                          )}
                          {filteredModalTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => {
                                toggleTag(tag)
                                setIsTagModalOpen(false)
                                setTagSearchQuery("")
                              }}
                              className={cn(
                                "rounded-md px-2.5 py-1.5 text-sm border transition-colors",
                                activeTag === tag
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border/50 text-foreground hover:border-primary/50 bg-card hover:bg-accent"
                              )}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          {tSearch("noTagsFound", { query: tagSearchQuery })}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </FilterSection>
        )}

        {/* Categories */}
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
              {tSearch("all")}
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

        {/* Advanced */}
        <FilterSection title={tSearch("advancedFilters")} defaultOpen={false}>
          <div className="space-y-2">
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyAll()}
              placeholder={tSearch("author")}
              className="h-8 text-xs bg-background border-border/50"
            />
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
