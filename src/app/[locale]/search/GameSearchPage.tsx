"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import { Search, Download, Globe, Calendar, Star, Tag, Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";

interface GameResult {
  title: string;
  version: string;
  url: string;
  description: string;
  site: string;
  tags: string[] | null;
  metadata: {
    platforms?: string;
    [key: string]: any;
  };
  score: number;
  extracted_at: string;
  image_urls: string[] | null;
}

interface SearchResponse {
  query: string;
  results: GameResult[];
  total: number;
}

interface Props {
  initialData: SearchResponse;
}

export default function GameSearchPage({ initialData }: Props) {
  const [query, setQuery] = useState("");
  const [site, setSite] = useState("lewdzone.com");
  const [results, setResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const memoizedInitialData = useMemo(() => initialData, [initialData]);

  // ใช้ ref เพื่อเก็บสถานะ initialization
  const initialized = useRef(false);

  // แยก handleSearch ออกมาไม่ให้อยู่ใน useEffect dependencies
  const performSearch = useCallback(async (searchQuery: string, searchSite: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setSearchPerformed(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        site: searchSite,
        limit: "10",
      });

      // อัพเดท URL แต่ไม่ trigger re-render
      if (typeof window !== 'undefined') {
        window.history.pushState({}, "", `?${params.toString()}`);
      }

      const response = await fetch(`https://ai.chanomhub.online/search?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      console.log("API response:", data);
      setResults(Array.isArray(data.results) ? data.results : []);
      setTotalResults(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching");
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSearchPerformed, setResults, setTotalResults]);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await performSearch(query, site);
  }, [query, site, performSearch]);

  // ใช้ useEffect เฉพาะสำหรับ initialization
  useEffect(() => {
    if (initialized.current) return;

    if (memoizedInitialData.query) {
      setQuery(memoizedInitialData.query);
      setResults(Array.isArray(memoizedInitialData.results) ? memoizedInitialData.results : []);
      setTotalResults(memoizedInitialData.total || 0);
      setSearchPerformed(true);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get("q");
      const siteParam = params.get("site");

      if (queryParam && queryParam !== memoizedInitialData.query) {
        setQuery(queryParam);
        if (siteParam) setSite(siteParam);
        performSearch(queryParam, siteParam || "lewdzone.com");
      } else if (queryParam) {
        setQuery(queryParam);
        if (siteParam) setSite(siteParam);
      } else if (siteParam) {
        setSite(siteParam);
      }
    }

    initialized.current = true;
  }, [memoizedInitialData, performSearch, setQuery, setResults, setTotalResults, setSearchPerformed, setSite]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const clearQuery = () => {
    setQuery("");
    setSite("lewdzone.com");
    if (typeof window !== 'undefined') {
      window.history.pushState({}, "", window.location.pathname);
    }
    setSearchPerformed(false);
    setResults([]);
    setTotalResults(0);
    setError("");
  };

  // แยก handler สำหรับ input change
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSite(e.target.value);
  };

  // แยก handler สำหรับ Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  if (!searchPerformed) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col">
        <div className="navbar bg-base-100 px-4">
          <div className="navbar-start">
            <div className="flex gap-4">
              <a className="text-sm hover:underline opacity-75">Gmail</a>
              <a className="text-sm hover:underline opacity-75">รูปภาพ</a>
            </div>
          </div>
          <div className="navbar-end">
            <div className="flex items-center gap-4">
              <button className="btn btn-ghost btn-sm btn-square">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span className="text-xs">U</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-4 -mt-20">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-light mb-8 text-base-content">
              🎮 <span className="text-blue-500">C</span><span className="text-red-500">h</span>
              <span className="text-yellow-500">a</span><span className="text-blue-500">n</span>
              <span className="text-green-500">o</span><span className="text-red-500">m</span>
            </h1>
          </div>

          <div className="w-full max-w-xl mb-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="flex items-center bg-base-100 border border-base-300 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-shadow focus-within:shadow-xl">
                  <Search className="w-5 h-5 text-base-content/50 mr-3" />
                  <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    onKeyDown={handleKeyDown}
                    placeholder="ค้นหาเกมที่คุณต้องการ..."
                    className="flex-1 bg-transparent outline-none text-base"
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={clearQuery}
                      className="p-1 hover:bg-base-200 rounded-full ml-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="btn btn-ghost bg-base-200 hover:bg-base-300 border-base-300"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              ค้นหาเกม
            </button>
            <button
              type="button"
              className="btn btn-ghost bg-base-200 hover:bg-base-300 border-base-300"
            >
              โชคดี
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm opacity-70">
            <span>ค้นหาใน:</span>
            <select
              value={site}
              onChange={handleSiteChange}
              className="select select-ghost select-xs"
            >
              <option value="lewdzone.com">LewdZone</option>
              <option value="">ทุกเว็บไซต์</option>
            </select>
          </div>
        </div>

        <footer className="bg-base-200 mt-auto">
          <div className="px-6 py-3 border-b border-base-300">
            <span className="text-sm opacity-75">ประเทศไทย</span>
          </div>
          <div className="px-6 py-3 flex flex-col sm:flex-row justify-between text-sm opacity-75">
            <div className="flex gap-6 mb-2 sm:mb-0">
              <Link href="/about" className="hover:underline">
                เกี่ยวกับเรา
              </Link>
              <Link href="/advertising" className="hover:underline">
                โฆษณา
              </Link>
              <Link href="/business" className="hover:underline">
                ธุรกิจ
              </Link>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:underline">
                ความเป็นส่วนตัว
              </Link>
              <Link href="/terms" className="hover:underline">
                เงื่อนไข
              </Link>
              <Link href="/settings" className="hover:underline">
                การตั้งค่า
              </Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            name: `ผลการค้นหา "${query}"`,
            description: `ผลการค้นหาเกม "${query}" จาก Chanom`,
            mainEntity: Array.isArray(results)
              ? results.map((result) => ({
                "@type": "VideoGame",
                name: result.title,
                description: result.description,
                url: result.url,
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: result.score * 100,
                  bestRating: 100,
                },
              }))
              : [],
          }),
        }}
      />

      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-light">
                🎮 <span className="text-blue-500">C</span><span className="text-red-500">h</span>
                <span className="text-yellow-500">a</span><span className="text-blue-500">n</span>
                <span className="text-green-500">o</span><span className="text-red-500">m</span>
              </h1>
            </div>

            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="flex items-center bg-base-100 border border-base-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md">
                    <input
                      type="text"
                      value={query}
                      onChange={handleQueryChange}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent outline-none"
                      autoComplete="off"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={clearQuery}
                        className="p-1 hover:bg-base-200 rounded-full mr-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      type="submit"
                      className="p-2 hover:bg-base-200 rounded-full"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <Search className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={site}
                onChange={handleSiteChange}
                className="select select-ghost select-sm"
              >
                <option value="lewdzone.com">LewdZone</option>
                <option value="">ทุกเว็บไซต์</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-6 max-w-7xl">
        {error && (
          <div className="mb-6">
            <div className="alert alert-error">
              <span>
                <strong>เกิดข้อผิดพลาด:</strong> {error}
                <p>
                  ลอง <Link href="/" className="text-blue-600 hover:underline">กลับไปหน้าหลัก</Link> หรือลองค้นหาใหม่
                </p>
              </span>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="alert alert-warning max-w-md w-full px-4 py-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
            <span>
              <strong>คำเตือน:</strong> ระบบค้นหาตอนนี้ยังไม่แม่นยำมากนัก
            </span>
          </div>
        </div>

        {!loading && totalResults > 0 && (
          <div className="mb-4 text-sm opacity-75">
            ประมาณ {totalResults.toLocaleString()} ผลลัพธ์ (0.{Math.floor(Math.random() * 50 + 10)} วินาที)
          </div>
        )}

        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="group">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-base-300 rounded-sm flex items-center justify-center">
                    <Globe className="w-3 h-3" />
                  </div>
                  <span className="text-base-content/60">{extractDomain(result.url)}</span>
                  {result.site && (
                    <>
                      <span className="text-base-content/40">›</span>
                      <span className="text-base-content/60">{result.site}</span>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-xl text-blue-600 hover:underline mb-1 group-hover:underline">
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  {result.title}
                </a>
              </h3>

              {result.image_urls && result.image_urls[0] && (
                <div className="mb-2">
                  <Image
                    src={result.image_urls[0]}
                    alt={result.title}
                    width={100}
                    height={100}
                    className="rounded"
                    loading="lazy"
                  />
                </div>
              )}

              <p className="text-sm text-base-content/80 leading-relaxed mb-2">
                {result.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60">
                {result.version && (
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    เวอร์ชัน {result.version}
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  คะแนน {(result.score * 100).toFixed(1)}%
                </span>

                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(result.extracted_at)}
                </span>

                {result.metadata.platforms && (
                  <span>แพลตฟอร์ม: {result.metadata.platforms}</span>
                )}
              </div>

              {result.tags && result.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.tags.slice(0, 5).map((tag, tagIndex) => (
                    <a
                      key={tagIndex}
                      href={`/?q=${encodeURIComponent(tag)}&site=${site}`}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-base-200 text-base-content/70 rounded hover:bg-base-300"
                    >
                      <Tag className="w-2 h-2" />
                      {tag}
                    </a>
                  ))}
                  {result.tags.length > 5 && (
                    <span className="text-xs text-base-content/60">
                      +{result.tags.length - 5} เพิ่มเติม
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!loading && results.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="mb-6">
              <Search className="w-20 h-20 mx-auto text-base-content/20 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                ไม่มีผลลัพธ์สำหรับ <em>&#34;{query}&#34;</em>
              </h3>
              <div className="text-base-content/60 space-y-1">
                <p>• ตรวจสอบการสะกดคำทั้งหมด</p>
                <p>• ลองใช้คำหลักอื่น</p>
                <p>• ลองใช้คำหลักที่กว้างขึ้น</p>
                <p>• ลองใช้คำหลักน้อยลง</p>
                <p>
                  หรือดู <Link href="/games/popular" className="text-blue-600 hover:underline">เกมยอดนิยม</Link> และ{" "}
                  <Link href="/games/new" className="text-blue-600 hover:underline">เกมใหม่</Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
              <span className="text-base-content/60">กำลังค้นหา...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}