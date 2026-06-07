"use client"

import type React from "react"
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Hash, Tag, Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const GAME_CODE_PATTERN = /^[Hh][Jj]\d+$/

type Props = {
  tags: string[]
  categories: string[]
  platforms: string[]
  engines: string[]
}

interface HistoryItem {
  query: string
  isFavorite: boolean
  timestamp: number
}

interface SuggestionItem {
  type: "history" | "guide" | "tag" | "category" | "platform" | "engine" | "search-fallback"
  value: string
  label: string
  desc?: string
  field?: string
  isFavorite?: boolean
}

const getHelperGuides = (t: (key: string) => string) => [
  { prefix: "tag:", label: "tag:...", desc: t("filterByTag") },
  { prefix: "creator:", label: "creator:...", desc: t("filterByCreator") },
  { prefix: "category:", label: "category:...", desc: t("filterByCategory") },
  { prefix: "platform:", label: "platform:...", desc: t("filterByPlatform") },
  { prefix: "engine:", label: "engine:...", desc: t("filterByEngine") },
  { prefix: "author:", label: "author:...", desc: t("filterByAuthor") },
  { prefix: "ver:", label: "ver:...", desc: t("filterByVersion") },
  { prefix: "code:", label: "code:...", desc: t("filterByCode") },
]

function parseQueryString(query: string) {
  const params: Record<string, string | null> = {
    q: null,
    tag: null,
    category: null,
    platform: null,
    author: null,
    creator: null,
    engine: null,
    ver: null,
    sequentialCode: null,
  }

  const pattern = /(tag|category|platform|author|creator|artist|engine|ver|version|code|sequentialcode):(?:"([^"]+)"|(\S+))/gi

  let match
  let lastIndex = 0
  const queryParts: string[] = []

  pattern.lastIndex = 0

  while ((match = pattern.exec(query)) !== null) {
    const textBefore = query.slice(lastIndex, match.index).trim()
    if (textBefore) {
      queryParts.push(textBefore)
    }

    const key = match[1].toLowerCase()
    const value = match[2] || match[3]

    if (key === 'tag') params.tag = value
    else if (key === 'category') params.category = value
    else if (key === 'platform') params.platform = value
    else if (key === 'author') params.author = value
    else if (key === 'creator' || key === 'artist') params.creator = value
    else if (key === 'engine') params.engine = value
    else if (key === 'ver' || key === 'version') params.ver = value
    else if (key === 'code' || key === 'sequentialcode') params.sequentialCode = value

    lastIndex = pattern.lastIndex
  }

  const textAfter = query.slice(lastIndex).trim()
  if (textAfter) {
    queryParts.push(textAfter)
  }

  if (queryParts.length > 0) {
    params.q = queryParts.join(' ')
  }

  return params
}

export default function SearchControls({ tags, categories, platforms, engines }: Props) {
  const t = useTranslations("gameCodeDetection")
  const tSearch = useTranslations("searchControls")
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [searchText, setSearchText] = useState("")
  const [showCodeConfirm, setShowCodeConfirm] = useState(false)
  const [detectedCode, setDetectedCode] = useState("")

  // Search History
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load history from localStorage on client mount
  useEffect(() => {
    const stored = localStorage.getItem("chanomhub_search_history")
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Sync search text from URL parameters
  useEffect(() => {
    const q = sp.get("q") ?? ""
    const tag = sp.get("tag")
    const category = sp.get("category")
    const platform = sp.get("platform")
    const engine = sp.get("engine")
    const author = sp.get("author")
    const creator = sp.get("creator")
    const ver = sp.get("ver")
    const sequentialCode = sp.get("sequentialCode")

    const parts: string[] = []
    if (tag) parts.push(tag.includes(" ") ? `tag:"${tag}"` : `tag:${tag}`)
    if (category) parts.push(category.includes(" ") ? `category:"${category}"` : `category:${category}`)
    if (platform) parts.push(platform.includes(" ") ? `platform:"${platform}"` : `platform:${platform}`)
    if (engine) parts.push(engine.includes(" ") ? `engine:"${engine}"` : `engine:${engine}`)
    if (author) parts.push(author.includes(" ") ? `author:"${author}"` : `author:${author}`)
    if (creator) parts.push(creator.includes(" ") ? `creator:"${creator}"` : `creator:${creator}`)
    if (ver) parts.push(ver.includes(" ") ? `ver:"${ver}"` : `ver:${ver}`)
    if (sequentialCode) parts.push(sequentialCode.includes(" ") ? `code:"${sequentialCode}"` : `code:${sequentialCode}`)
    if (q) parts.push(q)

    setSearchText(parts.join(" "))
  }, [sp])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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

  const addToHistory = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return

    setHistory((prev) => {
      const existingIndex = prev.findIndex((item) => item.query.toLowerCase() === trimmed.toLowerCase())
      let newHistory = [...prev]

      if (existingIndex >= 0) {
        const existingItem = newHistory[existingIndex]
        newHistory.splice(existingIndex, 1)
        newHistory.unshift({
          ...existingItem,
          timestamp: Date.now(),
        })
      } else {
        newHistory.unshift({
          query: trimmed,
          isFavorite: false,
          timestamp: Date.now(),
        })
      }

      const favorites = newHistory.filter((item) => item.isFavorite)
      const nonFavorites = newHistory.filter((item) => !item.isFavorite)

      const maxItems = 8
      const allowedNonFavorites = Math.max(0, maxItems - favorites.length)
      const trimmedNonFavorites = nonFavorites.slice(0, allowedNonFavorites)

      let finalHistory = [...favorites, ...trimmedNonFavorites]
      finalHistory.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1
        if (!a.isFavorite && b.isFavorite) return 1
        return b.timestamp - a.timestamp
      })

      localStorage.setItem("chanomhub_search_history", JSON.stringify(finalHistory))
      return finalHistory
    })
  }, [])

  const toggleFavoriteHistory = useCallback((query: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setHistory((prev) => {
      const newHistory = prev.map((item) => {
        if (item.query === query) {
          return { ...item, isFavorite: !item.isFavorite }
        }
        return item
      })
      newHistory.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1
        if (!a.isFavorite && b.isFavorite) return 1
        return b.timestamp - a.timestamp
      })
      localStorage.setItem("chanomhub_search_history", JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const deleteFromHistory = useCallback((query: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.query !== query)
      localStorage.setItem("chanomhub_search_history", JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const clearAllHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem("chanomhub_search_history")
  }, [])

  const handleSearch = useCallback((overrideText?: string) => {
    const textToSearch = (overrideText ?? searchText).trim()
    if (!textToSearch) return

    addToHistory(textToSearch)

    // Check game code syntax (e.g. HJ003)
    if (GAME_CODE_PATTERN.test(textToSearch)) {
      setDetectedCode(textToSearch.toUpperCase())
      setShowCodeConfirm(true)
      setShowSuggestions(false)
      return
    }

    // Exact tag match case-insensitive
    const exactTag = tags.find((t) => t.toLowerCase() === textToSearch.toLowerCase())
    if (exactTag) {
      setShowSuggestions(false)
      pushParams({
        q: null,
        tag: exactTag,
        category: null,
        platform: null,
        author: null,
        creator: null,
        engine: null,
        ver: null,
        sequentialCode: null,
      })
      return
    }

    // Parse and submit query params
    setShowSuggestions(false)
    const hasFilterPrefixes = textToSearch.match(/(tag|category|platform|author|creator|artist|engine|ver|version|code|sequentialcode):/i)
    if (hasFilterPrefixes) {
      const parsed = parseQueryString(textToSearch)
      pushParams(parsed)
    } else {
      pushParams({ q: textToSearch })
    }
  }, [searchText, tags, pushParams, addToHistory])

  // Select a suggestion helper prefix
  const selectHelper = useCallback((prefix: string) => {
    const words = searchText.trim() === "" ? [] : searchText.split(/\s+/)
    if (words.length > 0) {
      words[words.length - 1] = prefix
    } else {
      words.push(prefix)
    }
    const newText = words.join(" ")
    setSearchText(newText)
    setActiveSuggestion(-1)

    if (inputRef.current) {
      inputRef.current.focus()
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newText.length, newText.length)
        }
      }, 0)
    }
  }, [searchText])

  // Select a contextual filter suggestion value
  const selectContextualSuggestion = useCallback((field: string, value: string) => {
    const words = searchText.split(/\s+/)
    const formattedValue = value.includes(" ") ? `"${value}"` : value
    words[words.length - 1] = `${field}:${formattedValue}`
    const newText = words.join(" ") + " "
    setSearchText(newText)
    setActiveSuggestion(-1)

    if (inputRef.current) {
      inputRef.current.focus()
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newText.length, newText.length)
        }
      }, 0)
    }
  }, [searchText])

  // Build list of suggestions/dropdown items
  const guides = getHelperGuides(tSearch)
  const words = searchText.split(/\s+/)
  const lastWord = words[words.length - 1] || ""

  let dropdownItems: SuggestionItem[] = []

  if (searchText.trim() === "") {
    // 1. History
    if (history.length > 0) {
      dropdownItems.push(
        ...history.map((h) => ({
          type: "history" as const,
          value: h.query,
          label: h.query,
          isFavorite: h.isFavorite,
        }))
      )
    }
    // 2. Guides
    dropdownItems.push(
      ...guides.map((g) => ({
        type: "guide" as const,
        value: g.prefix,
        label: g.label,
        desc: g.desc,
      }))
    )
  } else {
    // Check if typing a specific prefix value
    if (lastWord.includes(":")) {
      const [key, ...rest] = lastWord.split(":")
      const val = rest.join(":").toLowerCase()
      const filterKey = key.toLowerCase()

      if (filterKey === "tag") {
        const matched = tags.filter((t) => t.toLowerCase().includes(val)).slice(0, 8)
        dropdownItems.push(
          ...matched.map((t) => ({
            type: "tag" as const,
            field: "tag",
            value: t,
            label: t,
          }))
        )
      } else if (filterKey === "category") {
        const matched = categories.filter((c) => c.toLowerCase().includes(val)).slice(0, 8)
        dropdownItems.push(
          ...matched.map((c) => ({
            type: "category" as const,
            field: "category",
            value: c,
            label: c,
          }))
        )
      } else if (filterKey === "platform") {
        const matched = platforms.filter((p) => p.toLowerCase().includes(val)).slice(0, 8)
        dropdownItems.push(
          ...matched.map((p) => ({
            type: "platform" as const,
            field: "platform",
            value: p,
            label: p,
          }))
        )
      } else if (filterKey === "engine") {
        const matched = engines.filter((e) => e.toLowerCase().includes(val)).slice(0, 8)
        dropdownItems.push(
          ...matched.map((e) => ({
            type: "engine" as const,
            field: "engine",
            value: e,
            label: e,
          }))
        )
      }
    } else {
      // General typing: matching tag results and guide list
      const lower = lastWord.toLowerCase()
      const startsWith = tags.filter((t) => t.toLowerCase().startsWith(lower))
      const contains = tags.filter(
        (t) => !t.toLowerCase().startsWith(lower) && t.toLowerCase().includes(lower)
      )
      const matchedTags = [...startsWith, ...contains].slice(0, 6)
      if (matchedTags.length > 0) {
        dropdownItems.push(
          ...matchedTags.map((t) => ({
            type: "tag" as const,
            field: "tag",
            value: t,
            label: t,
          }))
        )
      }

      const matchedGuides = guides.filter((g) => g.prefix.toLowerCase().startsWith(lower))
      if (matchedGuides.length > 0) {
        dropdownItems.push(
          ...matchedGuides.map((g) => ({
            type: "guide" as const,
            value: g.prefix,
            label: g.label,
            desc: g.desc,
          }))
        )
      }
    }

    // Add free-text search fallback
    const trimmed = searchText.trim()
    if (trimmed.length > 0 && !tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      dropdownItems.push({
        type: "search-fallback" as const,
        value: trimmed,
        label: trimmed,
      })
    }
  }

  const handleSelectItem = useCallback((item: SuggestionItem) => {
    if (item.type === "history") {
      setSearchText(item.value)
      setShowSuggestions(false)
      handleSearch(item.value)
    } else if (item.type === "guide") {
      selectHelper(item.value)
    } else if (item.type === "search-fallback") {
      setShowSuggestions(false)
      handleSearch(item.value)
    } else {
      selectContextualSuggestion(item.field!, item.value)
    }
  }, [handleSearch, selectHelper, selectContextualSuggestion])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || dropdownItems.length === 0) {
      if (e.key === "Enter") handleSearch()
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestion((prev) => Math.min(prev + 1, dropdownItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestion((prev) => Math.max(prev - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeSuggestion >= 0 && dropdownItems[activeSuggestion]) {
        handleSelectItem(dropdownItems[activeSuggestion])
      } else {
        handleSearch()
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }
  }

  const clearSearch = () => {
    setSearchText("")
    setShowSuggestions(false)
    pushParams({
      q: null,
      tag: null,
      category: null,
      platform: null,
      author: null,
      creator: null,
      engine: null,
      ver: null,
      sequentialCode: null,
    })
  }

  // Visual Section Header State
  let currentSection = ""

  return (
    <div className="bg-card border border-border/50 rounded-lg p-3 space-y-3">
      {/* Search input + button */}
      <div className="flex gap-2">
        <div className="relative flex-1" ref={wrapRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value)
              setActiveSuggestion(-1)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={tSearch("searchPlaceholder")}
            className="pl-10 pr-9 bg-background border-border/50 focus:border-primary text-foreground"
            autoComplete="off"
          />
          {searchText && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Combined Suggestions Dropdown */}
          {showSuggestions && dropdownItems.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover/95 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl z-50 overflow-hidden max-h-[350px] overflow-y-auto">
              {dropdownItems.map((item, index) => {
                let header = null
                let sectionName = ""

                if (item.type === "history") {
                  sectionName = tSearch("searchHistory")
                } else if (item.type === "guide") {
                  sectionName = tSearch("searchGuidance")
                } else if (["tag", "category", "platform", "engine"].includes(item.type)) {
                  sectionName = tSearch("matchingTags")
                }

                if (sectionName && sectionName !== currentSection) {
                  currentSection = sectionName
                  header = (
                    <div className="px-3 py-1.5 bg-muted/40 border-b border-t border-border/30 first:border-t-0 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
                      <span>{sectionName}</span>
                      {item.type === "history" && (
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            clearAllHistory()
                          }}
                          className="text-[10px] text-destructive hover:underline font-semibold normal-case"
                        >
                          {tSearch("clearAll")}
                        </button>
                      )}
                    </div>
                  )
                }

                return (
                  <div key={`${item.type}-${item.value}-${index}`}>
                    {header}
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelectItem(item)
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors border-b border-border/10 last:border-b-0",
                        index === activeSuggestion
                          ? "bg-accent text-accent-foreground font-medium"
                          : "hover:bg-accent/50 text-foreground"
                      )}
                    >
                      {item.type === "history" && (
                        <>
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault()
                              toggleFavoriteHistory(item.value, e)
                            }}
                            className="p-1 hover:bg-muted/80 rounded text-muted-foreground shrink-0"
                            title="Favorite"
                          >
                            <Star
                              className={cn(
                                "w-3.5 h-3.5 transition-colors",
                                item.isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground hover:text-yellow-400"
                              )}
                            />
                          </button>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault()
                              deleteFromHistory(item.value, e)
                            }}
                            className="p-1 hover:bg-muted/80 rounded text-muted-foreground hover:text-destructive shrink-0"
                            title="Delete"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {item.type === "guide" && (
                        <>
                          <Hash className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="flex-1 font-mono font-medium text-foreground">{item.label}</span>
                          {item.desc && (
                            <span className="text-xs text-muted-foreground shrink-0">{item.desc}</span>
                          )}
                        </>
                      )}

                      {["tag", "category", "platform", "engine"].includes(item.type) && (
                        <>
                          <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider scale-90">
                            {item.type}
                          </span>
                        </>
                      )}

                      {item.type === "search-fallback" && (
                        <>
                          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>{tSearch('searchFor', { query: item.label })}</span>
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <Button onClick={() => handleSearch()} className="bg-primary hover:bg-primary/90 shrink-0">
          <Search className="w-4 h-4 mr-2" />
          {tSearch("search")}
        </Button>
      </div>

      {/* Game code detection confirm */}
      {showCodeConfirm && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-foreground">
            <Hash className="w-5 h-5" />
            <span className="font-medium">{t("title")}</span>
          </div>
          <p className="text-sm text-foreground">
            {t("description", { code: detectedCode })}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => {
                setShowCodeConfirm(false)
                setSearchText("")
                pushParams({ q: null, sequentialCode: detectedCode })
              }}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Hash className="w-4 h-4 mr-1" />
              {t("searchByCode")}
            </Button>
            <Button
              onClick={() => {
                setShowCodeConfirm(false)
                pushParams({ q: searchText.trim() })
              }}
              variant="outline"
              size="sm"
              className="text-foreground"
            >
              {t("searchByText")}
            </Button>
            <Button
              onClick={() => setShowCodeConfirm(false)}
              variant="ghost"
              size="sm"
              className="text-foreground"
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

