"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExternalLink, Download, Smartphone, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

import { Tool } from '@/types/tool';

export function ToolsClient({ tools, preferredOS }: { tools: Tool[]; preferredOS?: string }) {
  const iconMap = {
    Globe: <Globe className="h-10 w-10 text-blue-500" />,
    Download: <Download className="h-10 w-10 text-green-500" />,
    Smartphone: <Smartphone className="h-10 w-10 text-purple-500" />,
  };

  // Order of OS sections to display
  const osOrder = ["Windows", "macOS", "Linux", "Android", "iOS", "Web"];
  const grouped = osOrder
    .map((os) => ({ os, items: (tools || []).filter((t) => Array.isArray(t.os) && t.os.includes(os)) }))
    .filter((g) => g.items.length > 0);

  const recommendedOS = preferredOS;
  const recommendedItems = recommendedOS
    ? (tools || []).filter((t) => Array.isArray(t.os) && t.os.includes(recommendedOS))
    : [];
  const recommendedTop = recommendedItems.slice(0, 6);

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

      {/* แนะนำสำหรับเครื่องของคุณ */}
      {recommendedTop.length > 0 && (
        <section aria-labelledby="recommended">
          <div className="mb-6 flex items-center gap-3">
            <h2 id="recommended" className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              แนะนำสำหรับเครื่องของคุณ
            </h2>
            {recommendedOS && (
              <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                {recommendedOS}
              </Badge>
            )}
          </div>
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 dark:text-gray-300 text-base leading-relaxed mb-4">{tool.description}</p>

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
          <section key={group.os} aria-labelledby={`os-${group.os}`}>
            <h2 id={`os-${group.os}`} className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {group.os}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.items.map((tool, index) => (
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
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-800 dark:text-gray-300 text-base leading-relaxed mb-4">{tool.description}</p>

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