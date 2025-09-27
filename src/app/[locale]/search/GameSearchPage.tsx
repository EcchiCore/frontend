"use client";

import Image from "next/image";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Download, Globe, Calendar, Star, Tag, User, Languages, Crown, Menu, Settings, Bell, Gamepad2, X } from "lucide-react";

interface GameResult {
  title: string;
  version: string;
  url: string;
  description: string;
  site: string;
  tags: string[] | null;
  metadata: { platforms?: string; [key: string]: any };
  score: number;
  extracted_at: string;
  image_urls: string[] | null;
}

const dummyResults: GameResult[] = [
  {
    title: "Cyberpunk 2077 Thai Edition",
    version: "2.1.1",
    url: "https://chanomhub.com/games/cyberpunk-2077-thai",
    description: "เกม RPG สุดมันส์ในโลกอนาคต พร้อมการแปลภาษาไทยแบบเต็มรูปแบบ ดำดิ่งสู่โลกของไนท์ซิตี้และสัมผัสประสบการณ์ที่ไม่เหมือนใคร",
    site: "chanomhub.com",
    tags: ["RPG", "Action", "ไทย", "แปลเต็ม"],
    metadata: { platforms: "PC, PlayStation, Xbox" },
    score: 0.95,
    extracted_at: "2025-09-27T10:00:00Z",
    image_urls: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop"],
  },
  {
    title: "The Witcher 3: Wild Hunt - Complete Thai",
    version: "4.04",
    url: "https://chanomhub.com/games/witcher-3-thai-complete",
    description: "การผจญภัยของ Geralt of Rivia ในเวอร์ชันภาษาไทยสมบูรณ์ พร้อมทุก DLC และการแปลเสียงไทย ดื่มด่ำกับเรื่องราวที่ยิ่งใหญ่",
    site: "chanomhub.com",
    tags: ["RPG", "Fantasy", "ไทย", "เสียงไทย"],
    metadata: { platforms: "PC, Nintendo Switch" },
    score: 0.98,
    extracted_at: "2025-09-26T15:30:00Z",
    image_urls: ["https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop"],
  },
  {
    title: "Stardew Valley Thai Translation Pack",
    version: "1.8.2",
    url: "https://chanomhub.com/translations/stardew-valley-thai",
    description: "แพคแปลไทยสำหรับ Stardew Valley ทำการเกษตร ผจญภัย และสร้างความสัมพันธ์ในหุบเขา Stardew ด้วยภาษาไทยที่อ่านง่าย",
    site: "chanomhub.com",
    tags: ["Simulation", "แปลไทย", "เกษตร", "น่ารัก"],
    metadata: { platforms: "PC, Mobile, Nintendo Switch" },
    score: 0.92,
    extracted_at: "2025-09-25T08:15:00Z",
    image_urls: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=225&fit=crop"],
  },
  {
    title: "Hollow Knight - Thai Subtitle Mod",
    version: "1.5.78",
    url: "https://chanomhub.com/mods/hollow-knight-thai-sub",
    description: "บินไปกับเหล่าแมลงในโลกใต้ดิน Hallownest พร้อมซับไทยที่แปลอย่างประณีต เพื่อประสบการณ์การเล่นที่ลึกซึ้ง",
    site: "chanomhub.com",
    tags: ["Platformer", "Indie", "ซับไทย", "ผจญภัย"],
    metadata: { platforms: "PC, PlayStation, Xbox, Nintendo Switch" },
    score: 0.89,
    extracted_at: "2025-09-24T19:45:00Z",
    image_urls: ["https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=225&fit=crop"],
  }
];

// Placeholder Image
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/160x90?text=No+Image";

export default function ChanomhubSearch() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const resultsPerPage = 4;

  const handleSearch = () => {
    if (query.trim()) {
      setShowResults(true);
      setCurrentPage(1);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "ไม่ระบุวันที่";
    }
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // กรองผลลัพธ์ตาม query
  const filteredResults = useMemo(() =>
      dummyResults.filter((result) =>
        [result.title, result.description, ...(result.tags || [])].some((field) =>
          field.toLowerCase().includes(query.toLowerCase())
        )
      ),
    [query]
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-semibold text-white">Chanomhub</h1>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex space-x-6">
              <Link href="/games" className="flex items-center space-x-2 px-4 py-2 text-sm rounded-full transition-colors text-gray-300 hover:bg-blue-600 hover:text-white">
                <Gamepad2 className="w-4 h-4" />
                <span>เกม</span>
              </Link>
              <Link href="/member" className="flex items-center space-x-2 px-4 py-2 text-sm rounded-full transition-colors text-gray-300 hover:bg-blue-600 hover:text-white">
                <Languages className="w-4 h-4" />
                <span>นักแปล</span>
              </Link>
              <Link href="/member" className="flex items-center space-x-2 px-4 py-2 text-sm rounded-full transition-colors text-gray-300 hover:bg-blue-600 hover:text-white">
                <Crown className="w-4 h-4" />
                <span>เจ้าของเกม</span>
              </Link>
            </nav>
          </div>

          {/* Search Bar in Navbar */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="flex items-center bg-gray-700 border border-gray-600 rounded-full hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder="ค้นหาเกม, นักแปล, หรือเจ้าของเกม..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-4 py-2.5 text-white bg-transparent outline-none placeholder-gray-400"
                aria-label="ค้นหา"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="p-2 mr-2 hover:bg-gray-600 rounded-full"
                  aria-label="ล้างการค้นหา"
                  title="ล้างการค้นหา"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="p-2 mr-2 bg-blue-600 hover:bg-blue-500 rounded-full"
                aria-label="ค้นหา"
                title="ค้นหา"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-700" aria-label="การตั้งค่า" title="การตั้งค่า">
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700" aria-label="การแจ้งเตือน" title="การแจ้งเตือน">
              <Bell className="w-5 h-5 text-gray-300" />
            </button>
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="เมนู"
              title="เมนู"
            >
              <Menu className="w-5 h-5 text-gray-300" />
            </button>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" aria-label="โปรไฟล์ผู้ใช้" />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700 px-6 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/games" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>
                <Gamepad2 className="w-4 h-4" />
                <span>เกม</span>
              </Link>
              <Link href="/member" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>
                <Languages className="w-4 h-4" />
                <span>นักแปล</span>
              </Link>
              <Link href="/member" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>
                <Crown className="w-4 h-4" />
                <span>เจ้าของเกม</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content - Welcome when no search */}
      {!showResults ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Gamepad2 className="w-24 h-24 text-blue-400 animate-pulse" />
            </div>
            <h2 className="text-6xl font-light text-white mb-4">Chanomhub</h2>
            <p className="text-xl text-gray-300 mb-8">ศูนย์รวมเกมไทย สำหรับทุกคน</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900">
          {/* Results Header */}
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-gray-300">
                ผลลัพธ์การค้นหา: <span className="text-blue-400">&#34;{query}&#34;</span> ({filteredResults.length} รายการ)
              </h2>
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
              >
                ล้างการค้นหา
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="max-w-6xl mx-auto px-4 pb-8">
            <div className="grid gap-6">
              {paginatedResults.length > 0 ? (
                paginatedResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-all p-6 transform hover:scale-[1.02]"
                  >
                    <div className="flex">
                      {/* Game Image */}
                      <div className="flex-shrink-0 mr-6">
                        <Image
                          src={result.image_urls?.[0] || PLACEHOLDER_IMAGE}
                          alt={result.title}
                          width={160}
                          height={90}
                          className="w-40 h-24 object-cover rounded-lg border border-gray-600"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* URL */}
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <Globe className="w-4 h-4 mr-2" />
                          <span className="truncate">{extractDomain(result.url)}</span>
                        </div>

                        {/* Title */}
                        <Link href={result.url} target="_blank" rel="noopener noreferrer">
                          <h3 className="text-xl text-blue-400 hover:text-blue-300 cursor-pointer mb-2 line-clamp-1">
                            {result.title}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
                          {result.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-3">
                          {result.version && (
                            <span className="flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              เวอร์ชัน {result.version}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            {(result.score * 100).toFixed(0)}% ตรงกับคำค้นหา
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(result.extracted_at)}
                          </span>
                          {result.metadata.platforms && (
                            <span className="flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {result.metadata.platforms}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {result.tags && (
                          <div className="flex flex-wrap gap-2">
                            {result.tags.slice(0, 4).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full hover:bg-blue-800 transition-colors cursor-pointer"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 4 && (
                              <span className="text-xs text-gray-400">+{result.tags.length - 4} เพิ่มเติม</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>ไม่พบผลลัพธ์สำหรับ &#34;<span className="text-blue-400">{query}</span>&#34;</p>
                  <p className="text-sm mt-2">ลองค้นหาด้วยคำอื่นดูสิ!</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {filteredResults.length > 0 && totalPages > 1 && (
            <div className="max-w-6xl mx-auto px-4 pb-8">
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-gray-400 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ก่อนหน้า
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  if (totalPages > 5 && page > 3 && page < totalPages - 1) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-full transition-colors ${
                        currentPage === page
                          ? "text-blue-400 bg-blue-900"
                          : "text-gray-400 hover:text-blue-400 hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }).filter(Boolean)}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-4 py-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-full"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-gray-400 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-medium text-white mb-4 flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2 text-blue-400" />
                สำหรับนักเล่นเกม
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/games" className="hover:text-blue-400 transition-colors">ดาวน์โหลดเกม</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">แพทช์ภาษาไทย</Link></li>
                <li><Link href="https://www.youtube.com/@CryptlcDay" className="hover:text-blue-400 transition-colors">รีวิวเกม</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">คู่มือการเล่น</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-4 flex items-center">
                <Languages className="w-5 h-5 mr-2 text-blue-400" />
                สำหรับนักแปล
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="#" className="hover:text-blue-400 transition-colors">สมัครเป็นนักแปล</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">โปรเจกต์แปล</Link></li>
                <li><Link href="/tools" className="hover:text-blue-400 transition-colors">เครื่องมือแปล</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">ชุมชนนักแปล</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-4 flex items-center">
                <Crown className="w-5 h-5 mr-2 text-blue-400" />
                สำหรับเจ้าของเกม
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="#" className="hover:text-blue-400 transition-colors">อัปโหลดเกม</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">จัดการเกม</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">สถิติดาวน์โหลด</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">การตลาดเกม</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; 2025 Chanomhub. สร้างสรรค์ด้วยใจสำหรับชุมชนเกมไทย</p>
            <div className="flex justify-center space-x-6 mt-4 text-sm">
              <Link href="/about" className="hover:text-blue-400 transition-colors">เกี่ยวกับเรา</Link>
              <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">นโยบายความเป็นส่วนตัว</Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">เงื่อนไขการใช้งาน</Link>
              <Link href="/contact" className="hover:text-blue-400 transition-colors">ติดต่อเรา</Link>
              <a href="https://forms.gle/rJmCAUHCst2HRJiq8" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">ลงทะเบียนระบบค้นหา</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}