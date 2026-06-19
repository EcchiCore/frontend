"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Hash, Tag, Clock, Star, Loader2, ArrowLeft, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSdk } from "@/lib/sdk"

const GAME_CODE_PATTERN = /^[Hh][Jj]\d+$/

interface HistoryItem {
  query: string
  isFavorite: boolean
  timestamp: number
}

interface SuggestionItem {
  type: "history" | "guide" | "tag" | "category" | "platform" | "engine" | "search-fallback" | "code-code" | "code-text"
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

// Module-level cache to share search metadata between mounts/instances
let cachedMetadata: {
  tags: string[]
  categories: string[]
  platforms: string[]
  engines: string[]
} | null = null

interface NavbarSearchProps {
  isMobile?: boolean
  onSearchComplete?: () => void
}

export default function NavbarSearch({ isMobile = false, onSearchComplete }: NavbarSearchProps) {
  const tSearch = useTranslations("searchControls")
  const tDetect = useTranslations("gameCodeDetection")
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [searchText, setSearchText] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])
  
  // Metadata state
  const [metadata, setMetadata] = useState<{
    tags: string[];
    categories: string[];
    platforms: string[];
    engines: string[];
  } | null>(cachedMetadata)
  const [loadingMetadata, setLoadingMetadata] = useState(false)

  // Suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mobile overlay state
  const [isOpen, setIsOpen] = useState(false)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  // Prevent background scrolling when mobile search is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add("overflow-hidden")
      fetchMetadata() // Prefetch metadata on mobile overlay open
    } else {
      document.body.classList.remove("overflow-hidden")
    }
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isOpen, isMobile])

  // Focus mobile input on open
  useEffect(() => {
    if (isMobile && isOpen && mobileInputRef.current) {
      const timer = setTimeout(() => {
        mobileInputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isMobile])

  // Load history from localStorage on mount
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

  // Sync search text from URL parameters only if user is on search-enabled page
  useEffect(() => {
    const isSearchPage = pathname.startsWith("/games") || pathname.startsWith("/articles")
    if (!isSearchPage) {
      setSearchText("")
      return
    }

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
    const needsQuotes = (v: string) => /[\s+#!()&|]/.test(v)
    if (tag) parts.push(needsQuotes(tag) ? `tag:"${tag}"` : `tag:${tag}`)
    if (category) parts.push(needsQuotes(category) ? `category:"${category}"` : `category:${category}`)
    if (platform) parts.push(needsQuotes(platform) ? `platform:"${platform}"` : `platform:${platform}`)
    if (engine) parts.push(needsQuotes(engine) ? `engine:"${engine}"` : `engine:${engine}`)
    if (author) parts.push(needsQuotes(author) ? `author:"${author}"` : `author:${author}`)
    if (creator) parts.push(needsQuotes(creator) ? `creator:"${creator}"` : `creator:${creator}`)
    if (ver) parts.push(needsQuotes(ver) ? `ver:"${ver}"` : `ver:${ver}`)
    if (sequentialCode) parts.push(needsQuotes(sequentialCode) ? `code:"${sequentialCode}"` : `code:${sequentialCode}`)
    if (q) parts.push(q)

    setSearchText(parts.join(" "))
  }, [sp, pathname])

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

  // Fetch search tags/filters metadata from API client-side when focused
  const fetchMetadata = async () => {
    if (metadata || loadingMetadata) return
    setLoadingMetadata(true)
    try {
      const sdk = await getSdk()
      const [tags, categories, platforms, engines] = await Promise.all([
        sdk.articles.getTags(),
        sdk.articles.getCategories(),
        sdk.articles.getPlatforms(),
        sdk.articles.getEngines(),
      ])
      
      const loaded = {
        tags: tags || [],
        categories: categories || [],
        platforms: platforms || [],
        engines: (engines || []).map((e: any) => e.name),
      }
      cachedMetadata = loaded
      setMetadata(loaded)
    } catch (error) {
      console.error("Failed to load search metadata", error)
    } finally {
      setLoadingMetadata(false)
    }
  }

  const handleFocus = () => {
    setShowSuggestions(true)
    fetchMetadata()
  }

  const pushParams = useCallback(
    (overrides: Record<string, string | null>) => {
      // Determine targets
      const targetPath = pathname.startsWith("/articles") ? "/articles" : "/games"
      const params = new URLSearchParams()
      
      // Transfer overrides
      for (const [key, value] of Object.entries(overrides)) {
        if (value !== null && value !== "") {
          params.set(key, value)
        }
      }
      
      router.push(`${targetPath}?${params.toString()}`)
      if (onSearchComplete) onSearchComplete()
    },
    [router, pathname, onSearchComplete]
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

  const handleSearch = useCallback((overrideText?: string, forceType?: "code" | "text") => {
    const textToSearch = (overrideText ?? searchText).trim()
    if (!textToSearch) return

    addToHistory(textToSearch)
    setShowSuggestions(false)
    setIsOpen(false)

    // Game code routing detection
    if (GAME_CODE_PATTERN.test(textToSearch) && forceType !== "text") {
      pushParams({ sequentialCode: textToSearch.toUpperCase() })
      return
    }

    // Exact match tags case-insensitive
    const exactTag = (metadata?.tags || []).find((t) => t.toLowerCase() === textToSearch.toLowerCase())
    if (exactTag) {
      pushParams({ tag: exactTag })
      return
    }

    const hasFilterPrefixes = textToSearch.match(/(tag|category|platform|author|creator|artist|engine|ver|version|code|sequentialcode):/i)
    if (hasFilterPrefixes) {
      const parsed = parseQueryString(textToSearch)
      pushParams(parsed)
    } else {
      pushParams({ q: textToSearch })
    }
  }, [searchText, metadata, pushParams, addToHistory])

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

  const selectContextualSuggestion = useCallback((field: string, value: string) => {
    const words = searchText.split(/\s+/)
    const needsQuotes = /[\s+#!()&|]/.test(value)
    const formattedValue = needsQuotes ? `"${value}"` : value
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

  // Build list of suggestions
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
    // A. Check if typing a game code pattern to present option
    const queryTrimmed = searchText.trim()
    if (GAME_CODE_PATTERN.test(queryTrimmed)) {
      dropdownItems.push({
        type: "code-code",
        value: queryTrimmed.toUpperCase(),
        label: tDetect("searchByCode"),
        desc: tDetect("description", { code: queryTrimmed.toUpperCase() })
      })
      dropdownItems.push({
        type: "code-text",
        value: queryTrimmed,
        label: tDetect("searchByText")
      })
    }

    // B. Check if typing a specific prefix value (e.g. tag:)
    if (lastWord.includes(":") && metadata) {
      const [key, ...rest] = lastWord.split(":")
      const val = rest.join(":").toLowerCase()
      const filterKey = key.toLowerCase()

      if (filterKey === "tag") {
        const matched = metadata.tags.filter((t) => t.toLowerCase().includes(val)).slice(0, 8)
        dropdownItems.push(
          ...matched.map((t) => ({
            type: "tag" as const,
            field: "tag",
            value: t,
            label: t,
          }))
        )
      } else if (filterKey === "category") {
        const matched = metadata.categories.filter((c) => c.toLowerCase().includes(val)).slice(0, 8)
        dropdownItems.push(
          ...matched.map((c) => ({
            type: "category" as const,
            field: "category",
            value: c,
            label: c,
          }))
        )
      } else if (filterKey === "platform") {
        const matched = metadata.platforms.filter((p) => p.toLowerCase().includes(val)).slice(0, 8)
        dropdownItems.push(
          ...matched.map((p) => ({
            type: "platform" as const,
            field: "platform",
            value: p,
            label: p,
          }))
        )
      } else if (filterKey === "engine") {
        const matched = metadata.engines.filter((e) => e.toLowerCase().includes(val)).slice(0, 8)
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
      // C. General typing matches
      const lower = lastWord.toLowerCase()
      
      if (metadata) {
        const startsWith = metadata.tags.filter((t) => t.toLowerCase().startsWith(lower))
        const contains = metadata.tags.filter(
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

    // D. Add free-text fallback
    const trimmed = searchText.trim()
    const alreadyMatchedExact = metadata?.tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())
    if (trimmed.length > 0 && !alreadyMatchedExact) {
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
    } else if (item.type === "code-code") {
      setSearchText("")
      setShowSuggestions(false)
      handleSearch(item.value, "code")
    } else if (item.type === "code-text") {
      setShowSuggestions(false)
      handleSearch(item.value, "text")
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
    
    // Clear route search parameters
    const targetPath = pathname.startsWith("/articles") ? "/articles" : "/games"
    router.push(targetPath)
    if (onSearchComplete) onSearchComplete()
  }

  let currentSection = ""

  if (isMobile) {
    return (
      <div className="relative w-full">
        {/* Trigger Button styled as search input */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 bg-muted hover:bg-muted/80 border border-border text-muted-foreground text-sm rounded-full h-9 w-full transition-all duration-200 active:scale-[0.98]"
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate text-left text-muted-foreground/80">{tSearch("searchPlaceholder")}</span>
        </button>

        {/* Fullscreen Search Overlay */}
        {isOpen && typeof window !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] bg-background flex flex-col animate-in fade-in slide-in-from-top-2 duration-150 text-foreground">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0 hover:bg-muted h-9 w-9 p-0 flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </Button>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearch()
                }}
                className="relative flex-1"
              >
                <Input
                  ref={mobileInputRef}
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value)
                    setActiveSuggestion(-1)
                    setShowSuggestions(true)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={tSearch("searchPlaceholder")}
                  className={cn(
                    "pl-9 bg-muted hover:bg-muted/80 border border-border focus:border-primary text-foreground text-sm rounded-full h-10 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus-visible:ring-0 focus-visible:ring-offset-0",
                    searchText ? "pr-9" : "pr-3"
                  )}
                  autoComplete="off"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                {searchText && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/80 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Scrollable suggestions & guidance body */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 pb-12">
              {searchText.trim() === "" ? (
                // Empty search state: history, guidance
                <>
                  {/* Search History */}
                  {history.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {tSearch("searchHistory")}
                        </h4>
                        <button
                          type="button"
                          onClick={clearAllHistory}
                          className="text-xs text-destructive hover:underline font-semibold"
                        >
                          {tSearch("clearAll")}
                        </button>
                      </div>
                      <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-card">
                        {history.map((h) => (
                          <div
                            key={h.query}
                            className="flex items-center gap-3 py-1.5 px-3.5 hover:bg-muted active:bg-muted/80 transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSearchText(h.query)
                                handleSearch(h.query)
                              }}
                              className="flex-1 text-left text-sm text-foreground truncate py-2.5"
                            >
                              {h.query}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => toggleFavoriteHistory(h.query, e)}
                              className="p-2.5 hover:bg-muted rounded-full text-muted-foreground transition-colors"
                            >
                              <Star
                                className={cn(
                                  "w-4 h-4 transition-colors",
                                  h.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"
                                )}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => deleteFromHistory(h.query, e)}
                              className="p-2.5 hover:bg-muted rounded-full text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Guidance grid */}
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
                      <Compass className="w-3.5 h-3.5 text-primary" />
                      {tSearch("searchGuidance")}
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {guides.map((g) => (
                        <button
                          key={g.prefix}
                          type="button"
                          onClick={() => selectHelper(g.prefix)}
                          className="flex flex-col text-left p-3.5 rounded-2xl border border-border bg-card hover:bg-muted transition-all duration-200 active:scale-[0.98]"
                        >
                          <span className="font-mono text-xs font-semibold text-primary">{g.label}</span>
                          <span className="text-[10px] text-muted-foreground mt-1 leading-normal">{g.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Active typing suggestions list
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    {tSearch("search")}
                  </div>
                  <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border bg-card">
                    {dropdownItems.map((item, index) => (
                      <button
                        key={`${item.type}-${item.value}-${index}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3.5 text-sm text-left transition-colors border-b border-border last:border-b-0",
                          index === activeSuggestion ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-foreground"
                        )}
                      >
                        {item.type === "history" && (
                          <>
                            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 truncate">{item.label}</span>
                          </>
                        )}

                        {item.type === "guide" && (
                          <>
                            <Hash className="w-4 h-4 text-primary shrink-0" />
                            <span className="flex-1 font-mono font-medium text-foreground">{item.label}</span>
                            {item.desc && (
                              <span className="text-xs text-muted-foreground shrink-0">{item.desc}</span>
                            )}
                          </>
                        )}

                        {["tag", "category", "platform", "engine"].includes(item.type) && (
                          <>
                            <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 truncate">{item.label}</span>
                            <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded font-semibold uppercase tracking-wider scale-95 shrink-0">
                              {item.type}
                            </span>
                          </>
                        )}

                        {(item.type === "code-code" || item.type === "code-text") && (
                          <>
                            <Hash className={cn("w-4 h-4 shrink-0", item.type === "code-code" ? "text-primary" : "text-muted-foreground")} />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-xs leading-none">{item.label}</div>
                              {item.desc && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.desc}</div>}
                            </div>
                          </>
                        )}

                        {item.type === "search-fallback" && (
                          <>
                            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="truncate flex-1 font-medium">{tSearch('searchFor', { query: item.label })}</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full" ref={wrapRef}>
      <div className="flex items-center gap-1.5 w-full relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value)
            setActiveSuggestion(-1)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={tSearch("searchPlaceholder")}
          className={cn(
            "pl-9 bg-background/90 hover:bg-background border border-border hover:border-border/80 focus:border-primary/60 text-foreground text-sm rounded-full h-9 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20 shadow-sm",
            searchText ? "pr-8" : "pr-3"
          )}
          autoComplete="off"
        />
        {searchText && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted/80 transition-colors z-10"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Combined Suggestions Dropdown */}
      {showSuggestions && dropdownItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden">
          {dropdownItems.map((item, index) => {
            let header = null
            let sectionName = ""

            if (item.type === "history") {
              sectionName = tSearch("searchHistory")
            } else if (item.type === "guide") {
              sectionName = tSearch("searchGuidance")
            } else if (["tag", "category", "platform", "engine"].includes(item.type)) {
              sectionName = tSearch("matchingTags")
            } else if (item.type === "code-code" || item.type === "code-text") {
              sectionName = tDetect("title")
            }

            if (sectionName && sectionName !== currentSection) {
              currentSection = sectionName
              header = (
                <div className="px-3.5 py-2 bg-muted/30 border-b border-t border-border/20 first:border-t-0 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
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
                    "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors border-b border-border/5 last:border-b-0",
                    index === activeSuggestion
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-accent/40 text-foreground"
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
                      <span className="text-[9px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider scale-95">
                        {item.type}
                      </span>
                    </>
                  )}

                  {(item.type === "code-code" || item.type === "code-text") && (
                    <>
                      <Hash className={cn("w-3.5 h-3.5 shrink-0", item.type === "code-code" ? "text-primary" : "text-muted-foreground")} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs leading-none">{item.label}</div>
                        {item.desc && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.desc}</div>}
                      </div>
                    </>
                  )}

                  {item.type === "search-fallback" && (
                    <>
                      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{tSearch('searchFor', { query: item.label })}</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
