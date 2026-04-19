"use client"

import type React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Hash, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

const GAME_CODE_PATTERN = /^[Hh][Jj]\d+$/

type Props = {
  tags: string[]
}

export default function SearchControls({ tags }: Props) {
  const t = useTranslations("gameCodeDetection")
  const tSearch = useTranslations("searchControls")
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [searchText, setSearchText] = useState("")
  const [showCodeConfirm, setShowCodeConfirm] = useState(false)
  const [detectedCode, setDetectedCode] = useState("")

  // Suggestion dropdown
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Sync search text from URL
  useEffect(() => {
    setSearchText(sp.get("q") ?? "")
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

  // Update suggestions while typing
  const handleChange = (val: string) => {
    setSearchText(val)
    setActiveSuggestion(-1)
    const q = val.trim()
    if (q.length >= 1) {
      const lower = q.toLowerCase()
      const startsWith = tags.filter((t) => t.toLowerCase().startsWith(lower))
      const contains = tags.filter(
        (t) => !t.toLowerCase().startsWith(lower) && t.toLowerCase().includes(lower)
      )
      const matched = [...startsWith, ...contains].slice(0, 8)
      setSuggestions(matched)
      setShowSuggestions(matched.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Select a tag suggestion directly
  const selectTag = useCallback(
    (tag: string) => {
      setSearchText("")
      setSuggestions([])
      setShowSuggestions(false)
      setActiveSuggestion(-1)
      pushParams({ q: null, tag })
    },
    [pushParams]
  )

  const handleSearch = useCallback(() => {
    const trimmed = searchText.trim()
    if (!trimmed) return

    // 1. Game code
    if (GAME_CODE_PATTERN.test(trimmed)) {
      setDetectedCode(trimmed.toUpperCase())
      setShowCodeConfirm(true)
      setShowSuggestions(false)
      return
    }

    // 2. Exact tag match (case-insensitive)
    const exactTag = tags.find((t) => t.toLowerCase() === trimmed.toLowerCase())
    if (exactTag) {
      selectTag(exactTag)
      return
    }

    // 3. Free-text search
    setShowSuggestions(false)
    pushParams({ q: trimmed })
  }, [searchText, tags, selectTag, pushParams])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === "Enter") handleSearch()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestion((prev) => Math.max(prev - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        selectTag(suggestions[activeSuggestion])
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
    setSuggestions([])
    setShowSuggestions(false)
    pushParams({ q: null })
  }

  return (
    <div className="bg-card border border-border/50 rounded-lg p-3 space-y-3">
      {/* Search input + button */}
      <div className="flex gap-2">
        <div className="relative flex-1" ref={wrapRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchText}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
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

          {/* Suggestion dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border/50 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border/30">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {tSearch('matchingTags')}
                </span>
              </div>
              {suggestions.map((tag, i) => (
                <button
                  key={tag}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectTag(tag)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                    i === activeSuggestion
                      ? "bg-accent text-foreground"
                      : "hover:bg-accent/60 text-foreground"
                  )}
                >
                  <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1">{tag}</span>
                  <span className="text-[10px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded">
                    tag
                  </span>
                </button>
              ))}
              {/* Free-text fallback */}
              {!tags.find((t) => t.toLowerCase() === searchText.trim().toLowerCase()) && (
                <button
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setShowSuggestions(false)
                    pushParams({ q: searchText.trim() })
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm text-left border-t border-border/30 transition-colors",
                    activeSuggestion === suggestions.length
                      ? "bg-accent text-foreground"
                      : "hover:bg-accent/60 text-muted-foreground"
                  )}
                >
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>{tSearch('searchFor', { query: searchText.trim() })}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 shrink-0">
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
