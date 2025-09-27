"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExternalLink, Download, Smartphone, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Tool } from '@/types/tool';

export function ToolsClient({ tools, preferredOS }: { tools: Tool[]; preferredOS?: string }) {
  const iconMap = {
    Globe: <Globe className="h-10 w-10 text-blue-500" />,
    Download: <Download className="h-10 w-10 text-green-500" />,
    Smartphone: <Smartphone className="h-10 w-10 text-purple-500" />,
  };

  // Filters and grouping for focus
  const [onlyOfficial, setOnlyOfficial] = useState(false);
  const [pricing, setPricing] = useState<'all' | 'free' | 'paid'>('all');

  const filteredTools = useMemo(() => {
    const list = tools || [];
    return list.filter((t) => {
      if (onlyOfficial && !t.isOfficial) return false;
      if (pricing === 'all') return true;
      const ps = Array.isArray(t.pricing) ? t.pricing : (t.pricing ? [t.pricing] : []);
      return ps.includes(pricing);
    });
  }, [tools, onlyOfficial, pricing]);

  // Order of OS sections to display
  const osOrder = ["Windows", "macOS", "Linux", "Android", "iOS", "Web"];

  const grouped = osOrder
    .map((os) => ({ os, items: filteredTools.filter((t) => Array.isArray(t.os) && t.os.includes(os)) }))
    .filter((g) => g.items.length > 0);

  const byOfficial = (a: Tool, b: Tool) => (a.isOfficial === b.isOfficial ? 0 : a.isOfficial ? -1 : 1);

  const recommendedOS = preferredOS;
  const recommendedItems = recommendedOS
    ? filteredTools.filter((t) => Array.isArray(t.os) && t.os.includes(recommendedOS))
    : [];
  const recommendedTop = [...recommendedItems].sort(byOfficial).slice(0, 6);

  // Build section items for Jump Nav
  const sectionItems = useMemo(() => {
    const items: { id: string; label: string }[] = [];
    if (recommendedTop.length > 0) items.push({ id: 'recommended', label: 'แนะนำ' });
    grouped.forEach((g) => items.push({ id: `os-${g.os}`, label: g.os }));
    return items;
  }, [recommendedTop, grouped]);

  const navRef = useRef<HTMLDivElement | null>(null);
  const [navHeight, setNavHeight] = useState(0);
  useEffect(() => {
    const measure = () => setNavHeight(navRef.current?.getBoundingClientRect().height || 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const [activeSection, setActiveSection] = useState<string | null>(sectionItems[0]?.id ?? null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: `-${navHeight + 24}px 0px -60% 0px` }
    );

    const elements = sectionItems
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionItems, navHeight]);

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - (navHeight + 12);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <main className="container mx-auto px-4 py-12 md:py-20">
      {/* ส่วนหัวของหน้า */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 md:mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">เครื่องมือสุดเจ๋งของเรา</h1>
        <p className="text-base md:text-lg leading-relaxed text-gray-800 dark:text-gray-300 max-w-3xl mx-auto">
          ค้นพบเครื่องมือที่ช่วยให้คุณจัดการเกม แปลภาษา และใช้งานได้ทุกแพลตฟอร์ม!
        </p>
      </motion.div>

      {tools?.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mb-8">
          ยังไม่มีเครื่องมือให้แสดงในขณะนี้
        </div>
      )}

      {/* แถบนำทางและตัวกรองแบบติดบน */}
      {sectionItems.length > 0 && (
        <div
          ref={navRef}
          className="sticky top-16 md:top-20 z-30 -mx-4 px-4 bg-white/80 dark:bg-gray-950/70 backdrop-blur border-y border-gray-200 dark:border-gray-800"
        >
          <div className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <nav aria-label="ไปยังส่วน" className="flex items-center gap-2 overflow-x-auto">
              {sectionItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={
                      (isActive
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800") +
                      " px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                    }
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOnlyOfficial((v) => !v)}
                className={
                  (onlyOfficial
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800") +
                  " px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                }
                aria-pressed={onlyOfficial}
              >
                ของเราเท่านั้น
              </button>

              {(["all", "free", "paid"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setPricing(key)}
                  className={
                    (pricing === key
                      ? key === "all"
                        ? "bg-slate-700 text-white border-slate-700"
                        : key === "free"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-orange-600 text-white border-orange-600"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800") +
                    " px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                  }
                  aria-pressed={pricing === key}
                >
                  {key === "all" ? "ทั้งหมด" : key === "free" ? "ฟรี" : "เสียเงิน"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredTools.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 my-10">
          ไม่มีเครื่องมือที่ตรงกับตัวกรอง
        </div>
      )}

      {/* แนะนำสำหรับเครื่องของคุณ */}
      {recommendedTop.length > 0 && (
        <section aria-labelledby="recommended">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="recommended" className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              แนะนำสำหรับเครื่องของคุณ
            </h2>
            {recommendedOS && (
              <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                {recommendedOS}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">คัดมาให้จากอุปกรณ์ของคุณ — ใช้แถบด้านบนเพื่อกรองหรือข้ามไปยังส่วนที่ต้องการ</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedTop.map((tool, index) => (
              <motion.div
                key={`rec-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="group border border-gray-200/60 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 rounded-2xl">
                  <CardHeader className="flex items-start gap-4 p-6">
                    <span className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {iconMap[tool.icon] || iconMap['Globe']}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {tool.name}
                      </CardTitle>
                      {(Array.isArray(tool.pricing) ? tool.pricing : (tool.pricing ? [tool.pricing] : [])).map((p: string, pi: number) => (
                        <Badge
                          key={`rec-pricing-${pi}`}
                          variant={p === 'free' ? 'success' : 'warning'}
                          aria-label={p === 'free' ? 'ฟรี' : 'เสียเงิน'}
                        >
                          {p === 'free' ? 'ฟรี' : 'เสียเงิน'}
                        </Badge>
                      ))}
                      {tool.isOfficial && (
                        <Badge variant="secondary" aria-label="ของเรา">ของเรา</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 dark:text-gray-300 text-base leading-relaxed mb-4">{tool.description}</p>

                    {(tool.author || tool.publisher) && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tool.author && (
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            ผู้สร้าง: {tool.author}
                          </Badge>
                        )}
                        {tool.publisher && tool.publisher !== tool.author && (
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            ผู้เผยแพร่: {tool.publisher}
                          </Badge>
                        )}
                      </div>
                    )}

                    {Array.isArray(tool.os) && tool.os.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {tool.os.map((os: string) => (
                          <Badge key={`rec-${index}-${os}`} variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            {os}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {tool.link !== '#' ? (
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`เปิดลิงก์ ${tool.name}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 active:bg-blue-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                      >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        ไปที่ {tool.name}
                      </a>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 italic text-sm">กำลังพัฒนา...</span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* จัดหมวดหมู่ตาม OS */}
      <div className="space-y-14">
        {grouped.map((group, gi) => (
          <section key={group.os} aria-labelledby={`os-${group.os}`} className="mt-14 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h2 id={`os-${group.os}`} className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {group.os}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...group.items].sort(byOfficial).map((tool, index) => (
                <motion.div
                  key={`${group.os}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (gi * 0.1) + index * 0.05 }}
                >
                  <Card className="group border border-gray-200/60 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 rounded-2xl">
                    <CardHeader className="flex items-start gap-4 p-6">
                      <span className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        {iconMap[tool.icon] || iconMap['Globe']}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {tool.name}
                        </CardTitle>
                        {(Array.isArray(tool.pricing) ? tool.pricing : (tool.pricing ? [tool.pricing] : [])).map((p: string, pi: number) => (
                          <Badge
                            key={`pricing-${pi}`}
                            variant={p === 'free' ? 'success' : 'warning'}
                            aria-label={p === 'free' ? 'ฟรี' : 'เสียเงิน'}
                          >
                            {p === 'free' ? 'ฟรี' : 'เสียเงิน'}
                          </Badge>
                        ))}
                        {tool.isOfficial && (
                          <Badge variant="secondary" aria-label="ของเรา">ของเรา</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-800 dark:text-gray-300 text-base leading-relaxed mb-4">{tool.description}</p>

                      {(tool.author || tool.publisher) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tool.author && (
                            <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                              ผู้สร้าง: {tool.author}
                            </Badge>
                          )}
                          {tool.publisher && tool.publisher !== tool.author && (
                            <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                              ผู้เผยแพร่: {tool.publisher}
                            </Badge>
                          )}
                        </div>
                      )}

                      {Array.isArray(tool.os) && tool.os.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {tool.os.map((os: string) => (
                            <Badge key={os} variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                              {os}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {tool.link !== '#' ? (
                        <a
                          href={tool.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`เปิดลิงก์ ${tool.name}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 active:bg-blue-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                        >
                          <ExternalLink className="h-5 w-5 mr-2" />
                          ไปที่ {tool.name}
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 italic text-sm">กำลังพัฒนา...</span>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}