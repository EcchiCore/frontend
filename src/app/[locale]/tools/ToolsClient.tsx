'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Download,
  Smartphone,
  Globe,
  Video,
  XCircle,
  Star,
  Calendar,
  Gamepad2,
  Languages,
  Wrench,
  Package,
  Code,
  Cpu,
  Shield,
  Zap,
  FileText,
  Image as LucideImage,
  Music,
  Film,
  MessageSquare,
  Settings,
  Box
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { JSX, useMemo, useState } from 'react';
import { Tool } from '@/types/tool';
import { Button } from '@/components/ui/button';

// Helper function to get YouTube embed URL
const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
  } catch (error) {
    console.error('Invalid URL for YouTube embed', error);
    return null;
  }

  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
};

// Expanded icon mapping with more options and colors
const iconMap: { [key: string]: { icon: JSX.Element; color: string } } = {
  Globe: { icon: <Globe className="h-8 w-8" />, color: 'text-blue-500' },
  Download: { icon: <Download className="h-8 w-8" />, color: 'text-green-500' },
  Smartphone: { icon: <Smartphone className="h-8 w-8" />, color: 'text-purple-500' },
  Gamepad2: { icon: <Gamepad2 className="h-8 w-8" />, color: 'text-pink-500' },
  Languages: { icon: <Languages className="h-8 w-8" />, color: 'text-indigo-500' },
  Wrench: { icon: <Wrench className="h-8 w-8" />, color: 'text-orange-500' },
  Package: { icon: <Package className="h-8 w-8" />, color: 'text-amber-500' },
  Code: { icon: <Code className="h-8 w-8" />, color: 'text-cyan-500' },
  Cpu: { icon: <Cpu className="h-8 w-8" />, color: 'text-red-500' },
  Shield: { icon: <Shield className="h-8 w-8" />, color: 'text-emerald-500' },
  Zap: { icon: <Zap className="h-8 w-8" />, color: 'text-yellow-500' },
  FileText: { icon: <FileText className="h-8 w-8" />, color: 'text-slate-500' },
  Image: { icon: <LucideImage className="h-8 w-8" />, color: 'text-violet-500' },
  Music: { icon: <Music className="h-8 w-8" />, color: 'text-fuchsia-500' },
  Film: { icon: <Film className="h-8 w-8" />, color: 'text-rose-500' },
  MessageSquare: { icon: <MessageSquare className="h-8 w-8" />, color: 'text-sky-500' },
  Settings: { icon: <Settings className="h-8 w-8" />, color: 'text-gray-500' },
  Box: { icon: <Box className="h-8 w-8" />, color: 'text-teal-500' },
};

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const iconData = iconMap[iconName] || iconMap['Box'];
  return (
    <span className={iconData.color}>
      {iconData.icon}
    </span>
  );
};

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const [showVideo, setShowVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);

  const selectedVersion = tool.versions?.[selectedVersionIndex];
  const youtubeEmbedUrl = selectedVersion?.exampleClip ? getYoutubeEmbedUrl(selectedVersion.exampleClip) : null;

  if (!selectedVersion) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        type: "spring",
        stiffness: 100
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group relative border border-gray-200/60 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900 rounded-3xl flex flex-col overflow-hidden">
        {/* Gradient overlay effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

        <CardHeader className="relative flex items-start gap-4 p-6 z-10">
          <motion.span
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {getIconComponent(tool.icon)}
          </motion.span>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              {tool.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-sm">
                {selectedVersion.versionNumber}
              </Badge>
              {selectedVersionIndex === 0 && (
                <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
                  ใหม่ล่าสุด
                </Badge>
              )}
              {tool.isOfficial && (
                <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  ของเรา
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative flex-1 flex flex-col z-10">
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-1">
            {tool.description}
          </p>

          {/* Version Selector - แสดงเฉพาะเมื่อมีหลายเวอร์ชัน */}
          {tool.versions && tool.versions.length > 1 && (
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                เลือกเวอร์ชัน:
              </label>
              <select
                value={selectedVersionIndex}
                onChange={(e) => {
                  setSelectedVersionIndex(Number(e.target.value));
                  setShowVideo(false); // ปิดวิดีโอเมื่อเปลี่ยนเวอร์ชัน
                }}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer hover:border-blue-400"
              >
                {tool.versions.map((version, idx) => (
                  <option key={version._key || idx} value={idx}>
                    {version.versionNumber}
                    {idx === 0 && ' (ใหม่ล่าสุด)'}
                    {version.releaseDate && ` - ${new Date(version.releaseDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Changelog - แสดงเฉพาะเมื่อมี */}
          {selectedVersion.changelog && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br  dark:from-gray-800 dark:to-gray-850 border border-blue-200 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                รายละเอียดการอัปเดต
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-line">
                {selectedVersion.changelog}
              </p>
            </div>
          )}

          {showVideo && youtubeEmbedUrl && (
            <div className="mb-4 relative">
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                <iframe
                  src={youtubeEmbedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Example for ${tool.name}`}
                  className="w-full h-full"
                ></iframe>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-3 -right-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform border border-gray-200 dark:border-gray-700"
                onClick={() => setShowVideo(false)}
              >
                <XCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </div>
          )}

          {/* OS Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tool.os?.map((os: string) => (
              <Badge
                key={os}
                variant="outline"
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium px-3 py-1"
              >
                {os}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <motion.a
              href={selectedVersion.downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-lg hover:shadow-xl font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="h-5 w-5" />
              ดาวน์โหลด
            </motion.a>
            {youtubeEmbedUrl && (
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-full border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold transition-all duration-300"
                  onClick={() => setShowVideo(!showVideo)}
                >
                  <Video className="h-5 w-5 mr-2" />
                  {showVideo ? 'ซ่อนคลิป' : 'ดูคลิปตัวอย่าง'}
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ToolsClient({ tools }: { tools: Tool[] }) {
  const computerPlatforms = ['Windows', 'macOS', 'Linux'];
  const mobilePlatforms = ['Android', 'iOS'];

  const computerTools = useMemo(() =>
      tools.filter(tool => tool.os?.some(os => computerPlatforms.includes(os)))
    , [tools]);

  const mobileTools = useMemo(() =>
      tools.filter(tool => tool.os?.some(os => mobilePlatforms.includes(os)))
    , [tools]);

  return (
    <main className="container mx-auto px-4 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
        className="text-center mb-12 md:mb-20"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            เครื่องมือสุดเจ๋งของเรา
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
        >
          ค้นพบเครื่องมือที่ช่วยให้คุณจัดการเกม แปลภาษา และใช้งานได้ทุกแพลตฟอร์ม!
        </motion.p>
      </motion.div>

      {tools.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 dark:text-gray-400 mb-8 py-20"
        >
          <div className="text-6xl mb-4">🔧</div>
          <p className="text-xl">ยังไม่มีเครื่องมือให้แสดงในขณะนี้</p>
        </motion.div>
      )}

      {computerTools.length > 0 && (
        <motion.section
          className="mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              เครื่องมือสำหรับคอมพิวเตอร์
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {computerTools.map((tool, index) => (
              <ToolCard key={tool._id || index} tool={tool} index={index} />
            ))}
          </div>
        </motion.section>
      )}

      {mobileTools.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              เครื่องมือสำหรับมือถือ
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mobileTools.map((tool, index) => (
              <ToolCard key={tool._id || index} tool={tool} index={index} />
            ))}
          </div>
        </motion.section>
      )}
    </main>
  );
}