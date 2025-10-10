"use client"

import type React from "react"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, ChevronDown, ChevronUp } from "lucide-react"

export default function SearchControls() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [searchText, setSearchText] = useState("")
  const [category, setCategory] = useState("")
  const [platform, setPlatform] = useState("")
  const [author, setAuthor] = useState("")
  const [tag, setTag] = useState("")
  const [engine, setEngine] = useState("")
  const [sequentialCode, setSequentialCode] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // อ่านค่าจาก URL params
  useEffect(() => {
    const q = sp.get("q") ?? ""
    const c = sp.get("category") ?? ""
    const p = sp.get("platform") ?? ""
    const a = sp.get("author") ?? ""
    const t = sp.get("tag") ?? ""
    const e = sp.get("engine") ?? ""
    const sc = sp.get("sequentialCode") ?? ""

    setSearchText(q)
    setCategory(c)
    setPlatform(p)
    setAuthor(a)
    setTag(t)
    setEngine(e)
    setSequentialCode(sc)

    // แสดง advanced filters ถ้ามีการใช้งาน
    if (c || p || a || t || e || sc) {
      setShowAdvanced(true)
    }
  }, [sp])

  const updateParams = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(sp.toString())

      // Update หรือลบ parameters
      for (const [key, value] of Object.entries(newParams)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      // Reset pagination เมื่อมีการเปลี่ยน filter
      params.delete("offset")

      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, sp]
  )

  const handleSearch = useCallback(() => {
    updateParams({
      q: searchText || null,
      category: category || null,
      platform: platform || null,
      author: author || null,
      tag: tag || null,
      engine: engine || null,
      sequentialCode: sequentialCode || null,
    })
  }, [searchText, category, platform, author, tag, engine, sequentialCode, updateParams])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const clearFilters = () => {
    setSearchText("")
    setCategory("")
    setPlatform("")
    setAuthor("")
    setTag("")
    setEngine("")
    setSequentialCode("")
    updateParams({
      q: null,
      category: null,
      platform: null,
      author: null,
      tag: null,
      engine: null,
      sequentialCode: null,
    })
  }

  const hasActiveFilters = searchText || category || platform || author || tag || engine || sequentialCode

  return (
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
      {/* ช่องค้นหาหลัก */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="ค้นหาชื่อเกม, คำอธิบาย..."
            className="pl-10 bg-background border-border/50 focus:border-primary text-foreground"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
          <Search className="w-4 h-4 mr-2" />
          ค้นหา
        </Button>
      </div>

      {/* ปุ่มแสดง/ซ่อน Advanced Filters */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        ตัวกรองขั้นสูง
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-border/30">
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="หมวดหมู่"
            className="bg-background border-border/50 text-sm text-foreground"
          />
          <Input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="แพลตฟอร์ม"
            className="bg-background border-border/50 text-sm text-foreground"
          />
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="ผู้เขียน (username)"
            className="bg-background border-border/50 text-sm text-foreground"
          />
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="แท็ก"
            className="bg-background border-border/50 text-sm text-foreground"
          />
          <Input
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="เอนจิ้น"
            className="bg-background border-border/50 text-sm text-foreground"
          />
          <Input
            value={sequentialCode}
            onChange={(e) => setSequentialCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="รหัสเกม"
            className="bg-background border-border/50 text-sm text-foreground"
          />
        </div>
      )}

      {/* ปุ่มล้างตัวกรอง */}
      {hasActiveFilters && (
        <Button
          onClick={clearFilters}
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground w-full"
        >
          <X className="w-3 h-3 mr-1" />
          ล้างตัวกรองทั้งหมด
        </Button>
      )}
    </div>
  )
}