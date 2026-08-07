'use client';

import React, { useState, useMemo } from 'react';
import { Link } from "@/i18n/navigation";
import {
  Download,
  Smartphone,
  Globe,
  Video,
  X,
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
  Box,
  Search,
  LayoutGrid,
  ListFilter,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Github,
  Terminal,
  Layers,
  ArrowUpRight,
  Feather,
  Gauge
} from 'lucide-react';
import { Tool } from '@/types/tool';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Custom Clean Monochromatic OS SVGs
const WindowsIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.95 1.95L24 0v11.55H10.95V1.95zM10.95 12.45H24v11.55l-13.05-1.95v-9.6z"/>
  </svg>
);

const AppleIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z"/>
  </svg>
);

const LinuxIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.1-.19.161-.403.161-.624V17.5c-3.14-.645-3.83-1.88-3.83-1.88-.514-1.3-1.255-1.65-1.255-1.65-1.025-.7.078-.686.078-.686 1.134.08 1.73 1.16 1.73 1.16.826 1.414 2.167 1.005 2.695.77.084-.6.324-1.005.589-1.235-2.507-.285-5.14-1.255-5.14-5.58 0-1.23.44-2.24 1.16-3.03-.117-.285-.503-1.43.11-2.985 0 0 .947-.305 3.1 1.155.9-.25 1.86-.375 2.81-.38.95.005 1.91.13 2.81.38 2.153-1.46 3.1-1.155 3.1-1.155.615 1.555.228 2.7.111 2.985.723.79 1.16 1.799 1.16 3.03 0 4.335-2.637 5.29-5.15 5.57.405.35.765 1.04.765 2.1v3.12c0 .223.061.436.163.626C19.138 20.167 22 16.42 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const renderOsBadge = (osName: string) => {
  const lower = osName.toLowerCase();
  let icon = <Terminal className="w-3 h-3 text-zinc-400" />;
  if (lower.includes('win')) icon = <WindowsIcon className="w-3 h-3 text-zinc-400" />;
  else if (lower.includes('mac')) icon = <AppleIcon className="w-3 h-3 text-zinc-400" />;
  else if (lower.includes('linux')) icon = <LinuxIcon className="w-3 h-3 text-zinc-400" />;
  else if (lower.includes('android') || lower.includes('ios')) icon = <Smartphone className="w-3 h-3 text-zinc-400" />;

  return (
    <span key={osName} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
      {icon}
      <span>{osName}</span>
    </span>
  );
};

// Helper to resolve YouTube embed URL
const getYoutubeEmbedUrl = (url?: string) => {
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
    return null;
  }

  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
};

// Known Tool Descriptions & Dedicated Routes (ChanoX is v1 Legacy, ChanoX2 is current)
const TOOL_ENRICHMENTS: Record<string, Partial<Tool>> = {
  'chanox': {
    name: 'ChanoX (v1 Legacy)',
    icon: 'Gamepad2',
    os: ['Windows'],
    isOfficial: true,
    author: 'ChanomHub Team',
  },
  'chanox2': {
    name: 'ChanoX2',
    icon: 'Gamepad2',
    os: ['Windows', 'macOS', 'Linux'],
    isOfficial: true,
    githubUrl: 'https://github.com/Chanomhub/ChanoX2/releases',
    detailUrl: '/chanox2',
    author: 'ChanomHub Team',
  },
  'chanolite': {
    name: 'ChanoLite',
    icon: 'Zap',
    os: ['Windows'],
    isOfficial: true,
    githubUrl: 'https://github.com/Chanomhub/ChanoLite/releases',
    detailUrl: '/chanolite',
    author: 'ChanomHub Team',
  },
  'nstghost': {
    name: 'NST-Ghost Engine',
    icon: 'Languages',
    os: ['Windows', 'Linux'],
    isOfficial: true,
    githubUrl: 'https://github.com/NST-Ghost/NST-Ghost',
    detailUrl: '/nst',
    author: 'NST-Ghost Team',
  },
  'nst': {
    name: 'NST-Ghost Engine',
    icon: 'Languages',
    os: ['Windows', 'Linux'],
    isOfficial: true,
    githubUrl: 'https://github.com/NST-Ghost/NST-Ghost',
    detailUrl: '/nst',
    author: 'NST-Ghost Team',
  },
  'editor': {
    name: 'ChanomHub Editor',
    icon: 'Code',
    os: ['Web'],
    isOfficial: true,
    detailUrl: '/editor',
  }
};

// Default Fallback Tools
const DEFAULT_FALLBACK_TOOLS: Tool[] = [
  {
    _id: 'chanox2',
    name: 'ChanoX2',
    description: '',
    icon: 'Gamepad2',
    os: ['Windows', 'macOS', 'Linux'],
    isOfficial: true,
    githubUrl: 'https://github.com/Chanomhub/ChanoX2/releases',
    detailUrl: '/chanox2',
    author: 'ChanomHub Team',
    tags: ['Launcher', 'Desktop', 'Library', 'Manager'],
    versions: [
      {
        _key: 'v2-latest',
        versionNumber: 'v2.4.0',
        releaseDate: '2026-07-15',
        downloadLink: 'https://github.com/Chanomhub/ChanoX2/releases/latest',
      }
    ]
  },
  {
    _id: 'nst-ghost',
    name: 'NST-Ghost Engine',
    description: '',
    icon: 'Languages',
    os: ['Windows', 'Linux'],
    isOfficial: true,
    githubUrl: 'https://github.com/NST-Ghost/NST-Ghost',
    detailUrl: '/nst',
    author: 'NST-Ghost Team',
    tags: ['Translation', 'Engine', 'Modding', 'Tools'],
    versions: [
      {
        _key: 'v3-latest',
        versionNumber: 'v3.1.0',
        releaseDate: '2026-07-01',
        downloadLink: 'https://github.com/NST-Ghost/NST-Ghost/releases',
      }
    ]
  },
  {
    _id: 'chanolite',
    name: 'ChanoLite',
    description: '',
    icon: 'Zap',
    os: ['Windows'],
    isOfficial: true,
    githubUrl: 'https://github.com/Chanomhub/ChanoLite/releases',
    detailUrl: '/chanolite',
    author: 'ChanomHub Team',
    tags: ['Lightweight', 'Launcher', 'Fast'],
    versions: [
      {
        _key: 'v1-latest',
        versionNumber: 'v1.8.2',
        releaseDate: '2026-06-20',
        downloadLink: 'https://github.com/Chanomhub/ChanoLite/releases/latest',
      }
    ]
  }
];

// Clean Monochromatic Icon Switcher
const getIconElement = (iconName?: string) => {
  const props = { className: "w-4 h-4 text-zinc-300" };
  switch (iconName) {
    case 'Globe': return <Globe {...props} />;
    case 'Download': return <Download {...props} />;
    case 'Smartphone': return <Smartphone {...props} />;
    case 'Gamepad2': return <Gamepad2 {...props} />;
    case 'Languages': return <Languages {...props} />;
    case 'Wrench': return <Wrench {...props} />;
    case 'Package': return <Package {...props} />;
    case 'Code': return <Code {...props} />;
    case 'Cpu': return <Cpu {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'FileText': return <FileText {...props} />;
    case 'Image': return <LucideImage {...props} />;
    case 'Music': return <Music {...props} />;
    case 'Film': return <Film {...props} />;
    case 'MessageSquare': return <MessageSquare {...props} />;
    case 'Settings': return <Settings {...props} />;
    default: return <Box {...props} />;
  }
};

// Safe translation hook with robust fallback
function useSafeToolsTranslation() {
  let rawT: any = null;
  try {
    rawT = useTranslations('Tools');
  } catch (e) {
    // Fallback if useTranslations throws
  }

  return (key: string, values?: Record<string, any>) => {
    if (rawT) {
      try {
        const result = rawT(key, values);
        if (result && !result.startsWith('Tools.')) return result;
      } catch (e) {
        // Ignore fallback
      }
    }
    return key;
  };
}

// Integrated Featured Showcase Component
function FeaturedShowcase() {
  const t = useSafeToolsTranslation();
  const [activeTab, setActiveTab] = useState<'chanox2' | 'chanolite' | 'nst'>('chanox2');
  const [chanox2Screenshot, setChanox2Screenshot] = useState<'library' | 'settings'>('library');
  const [chanoliteScreenshot, setChanoliteScreenshot] = useState<'streamlined' | 'efficiency'>('streamlined');

  return (
    <section className="mb-16 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8 backdrop-blur-sm shadow-md">
      {/* Showcase Top Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 text-[11px] font-mono mb-2">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            Official Software Showcase
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-50 tracking-tight">
            {t('showcaseTitle')}
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs font-medium font-sans">
          <button
            onClick={() => setActiveTab('chanox2')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'chanox2' ? 'bg-zinc-800 text-zinc-50 font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>ChanoX2</span>
          </button>
          <button
            onClick={() => setActiveTab('chanolite')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'chanolite' ? 'bg-zinc-800 text-zinc-50 font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-zinc-400" />
            <span>ChanoLite</span>
          </button>
          <button
            onClick={() => setActiveTab('nst')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'nst' ? 'bg-zinc-800 text-zinc-50 font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-zinc-400" />
            <span>NST-Ghost</span>
          </button>
        </div>
      </div>

      {/* Tab 1: ChanoX2 Showcase */}
      {activeTab === 'chanox2' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center">
                <img src="/chanox2/icon.ico" alt="ChanoX2 Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-50 font-mono">ChanoX2</h3>
                <span className="text-xs text-zinc-400 font-sans">Desktop Gaming Launcher</span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-sans">
              {t('chanox2Desc')}
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                Auto-detect Game Technologies (Unity/Unreal/Ren'Py)
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                Integrated Translation & Mod Engine
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/Chanomhub/ChanoX2/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{t('downloadApp', { name: 'ChanoX2' })}</span>
              </a>
              <Link
                href="/chanox2"
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <span>{t('openFullPage', { name: 'ChanoX2' })}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Interface Preview</span>
              <div className="inline-flex rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 text-[10px] font-medium font-sans">
                <button
                  onClick={() => setChanox2Screenshot('library')}
                  className={`px-2.5 py-1 rounded ${chanox2Screenshot === 'library' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Library View
                </button>
                <button
                  onClick={() => setChanox2Screenshot('settings')}
                  className={`px-2.5 py-1 rounded ${chanox2Screenshot === 'settings' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Settings Dashboard
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-md">
              <div className="h-8 bg-zinc-900/60 border-b border-zinc-800 px-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-800" />
                  <span className="h-2 w-2 rounded-full bg-zinc-800" />
                  <span className="h-2 w-2 rounded-full bg-zinc-800" />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {chanox2Screenshot === 'library' ? 'chanox2://library_view' : 'chanox2://settings_dashboard'}
                </span>
                <div className="w-8" />
              </div>
              <div className="aspect-[16/9] bg-zinc-950 overflow-hidden">
                <img
                  src={chanox2Screenshot === 'library' ? '/chanox2/20251220_100948.png' : '/chanox2/20251220_100959.png'}
                  alt="ChanoX2 Screenshot"
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ChanoLite Showcase */}
      {activeTab === 'chanolite' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-200 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-50 font-mono">ChanoLite</h3>
                <span className="text-xs text-zinc-400 font-sans">Lightweight Fast Launcher</span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-sans">
              {t('chanoliteDesc')}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                <div className="flex items-center gap-2 text-zinc-300 font-semibold text-xs mb-1">
                  <Feather className="w-4 h-4 text-emerald-400" />
                  Streamlined UI
                </div>
                <p className="text-[11px] text-zinc-500 font-sans">{t('chanoliteFeature1')}</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                <div className="flex items-center gap-2 text-zinc-300 font-semibold text-xs mb-1">
                  <Gauge className="w-4 h-4 text-teal-400" />
                  -40% RAM Memory
                </div>
                <p className="text-[11px] text-zinc-500 font-sans">{t('chanoliteFeature2')}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/Chanomhub/ChanoLite/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{t('downloadApp', { name: 'ChanoLite' })}</span>
              </a>
              <Link
                href="/chanolite"
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <span>{t('openFullPage', { name: 'ChanoLite' })}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Lite Screenshot</span>
              <div className="inline-flex rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 text-[10px] font-medium font-sans">
                <button
                  onClick={() => setChanoliteScreenshot('streamlined')}
                  className={`px-2.5 py-1 rounded ${chanoliteScreenshot === 'streamlined' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Streamlined Layout
                </button>
                <button
                  onClick={() => setChanoliteScreenshot('efficiency')}
                  className={`px-2.5 py-1 rounded ${chanoliteScreenshot === 'efficiency' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  High Efficiency
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-md aspect-[16/10]">
              <img
                src={chanoliteScreenshot === 'streamlined' ? '/ChanoLite/20251220_103641.png' : '/ChanoLite/20251220_103644.png'}
                alt="ChanoLite Screenshot"
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: NST-Ghost Showcase */}
      {activeTab === 'nst' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 flex items-center justify-center">
                <Languages className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-50 font-mono">NST-Ghost Engine</h3>
                <span className="text-xs text-zinc-400 font-sans">Linux & Windows Game Translator</span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-sans">
              {t('nstDesc')}
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                Real-Time Game Hook Translation
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                Native Linux & Windows Support
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/NST-Ghost/NST-Ghost/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{t('downloadApp', { name: 'NST-Ghost' })}</span>
              </a>
              <Link
                href="/nst"
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <span>{t('openFullPage', { name: 'NST-Ghost' })}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">NST Engine Screenshot</span>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-md aspect-[16/9]">
              <img
                src="https://cdn.chanomhub.com/Screenshot_08-%E0%B8%81.%E0%B8%A2._15-15-36_10718.png"
                alt="NST Screenshot"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

interface ToolCardProps {
  tool: Tool;
  index: number;
  viewMode: 'grid' | 'list';
  onOpenVideo: (url: string, title: string) => void;
}

function ToolCard({ tool, index, viewMode, onOpenVideo }: ToolCardProps) {
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [showChangelog, setShowChangelog] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = useSafeToolsTranslation();

  const selectedVersion = tool.versions?.[selectedVersionIndex] || tool.versions?.[0];
  const youtubeEmbedUrl = selectedVersion?.exampleClip ? getYoutubeEmbedUrl(selectedVersion.exampleClip) : null;

  const handleCopyLink = async () => {
    if (!selectedVersion?.downloadLink) return;
    try {
      await navigator.clipboard.writeText(selectedVersion.downloadLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const getToolDescription = () => {
    if (tool.description) return tool.description;
    const lower = tool.name.toLowerCase();
    if (lower.includes('chanox2') || lower.includes('chanox')) return t('chanox2Desc');
    if (lower.includes('chanolite')) return t('chanoliteDesc');
    if (lower.includes('nst')) return t('nstDesc');
    return t('defaultToolDesc');
  };

  if (viewMode === 'list') {
    return (
      <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/80 hover:bg-zinc-900/40 hover:border-zinc-700/80 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
            {getIconElement(tool.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {tool.detailUrl ? (
                <Link href={tool.detailUrl} className="font-bold text-sm text-zinc-100 tracking-tight hover:text-white flex items-center gap-1 group">
                  <span>{tool.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </Link>
              ) : (
                <h3 className="font-bold text-sm text-zinc-100 tracking-tight">
                  {tool.name}
                </h3>
              )}
              {selectedVersion && (
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-mono">
                  {selectedVersion.versionNumber}
                </span>
              )}
              {tool.isOfficial && (
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-mono flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-zinc-400 text-zinc-400" />
                  {t('ours')}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 line-clamp-1 font-sans">
              {getToolDescription()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-900 flex-wrap">
          {tool.os?.map(osName => renderOsBadge(osName))}

          {tool.detailUrl && (
            <Link
              href={tool.detailUrl}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <span>{t('viewDetailsPage')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          )}

          {tool.githubUrl && (
            <a
              href={tool.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title={t('githubReleases')}
            >
              <Github className="w-4 h-4" />
            </a>
          )}

          {youtubeEmbedUrl && (
            <button
              type="button"
              onClick={() => onOpenVideo(youtubeEmbedUrl, tool.name)}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-zinc-400" />
              {t('watchPreview')}
            </button>
          )}

          {selectedVersion?.downloadLink && (
            <a
              href={selectedVersion.downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              {t('download')}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-zinc-900/20 border border-zinc-800/80 hover:bg-zinc-900/40 hover:border-zinc-700/80 transition-all duration-200 flex flex-col justify-between h-full shadow-sm group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
              {getIconElement(tool.icon)}
            </div>
            <div>
              {tool.detailUrl ? (
                <Link href={tool.detailUrl} className="font-bold text-base text-zinc-100 tracking-tight hover:text-white flex items-center gap-1 group/title">
                  <span>{tool.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover/title:text-zinc-300 transition-colors" />
                </Link>
              ) : (
                <h3 className="font-bold text-base text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                  {tool.name}
                </h3>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                {selectedVersion && (
                  <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-mono">
                    {selectedVersion.versionNumber}
                  </span>
                )}
                {tool.isOfficial && (
                  <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-mono flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-zinc-400 text-zinc-400" />
                    {t('ours')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* OS Platform Badges */}
        {tool.os && tool.os.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tool.os.map(osName => renderOsBadge(osName))}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-zinc-400 leading-relaxed font-sans font-normal mb-5 min-h-[44px]">
          {getToolDescription()}
        </p>

        {/* Dedicated Page Link Badge */}
        {tool.detailUrl && (
          <div className="mb-4">
            <Link
              href={tool.detailUrl}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center justify-between group/page"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                {t('viewDetailsPage')}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover/page:text-zinc-300 transition-colors" />
            </Link>
          </div>
        )}

        {/* Multiple Versions Dropdown */}
        {tool.versions && tool.versions.length > 1 && (
          <div className="mb-4">
            <select
              value={selectedVersionIndex}
              onChange={(e) => setSelectedVersionIndex(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 font-mono focus:outline-none focus:border-zinc-700 cursor-pointer"
            >
              {tool.versions.map((version, idx) => (
                <option key={version._key || idx} value={idx}>
                  {version.versionNumber}
                  {idx === 0 && t('newestSuffix')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Changelog Drawer Toggle */}
        {selectedVersion?.changelog && (
          <div className="mb-5 rounded-lg border border-zinc-900 bg-zinc-950/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowChangelog(!showChangelog)}
              className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-zinc-500" />
                {t('updateDetails')}
              </span>
              {showChangelog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showChangelog && (
              <div className="px-3 pb-2.5 pt-1 border-t border-zinc-900 text-[11px] text-zinc-400 font-sans whitespace-pre-line leading-relaxed">
                {selectedVersion.changelog}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-zinc-900 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5">
          {tool.githubUrl && (
            <a
              href={tool.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title={t('githubReleases')}
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {selectedVersion?.downloadLink && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title={t('copyLink')}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
          {youtubeEmbedUrl && (
            <button
              type="button"
              onClick={() => onOpenVideo(youtubeEmbedUrl, tool.name)}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title={t('watchPreview')}
            >
              <Video className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {selectedVersion?.downloadLink ? (
          <a
            href={selectedVersion.downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {t('download')}
          </a>
        ) : (
          <span className="text-xs text-zinc-500 font-mono">No link</span>
        )}
      </div>
    </div>
  );
}

const computerPlatforms = ['Windows', 'macOS', 'Linux'];
const mobilePlatforms = ['Android', 'iOS'];

export function ToolsClient({ tools }: { tools: Tool[] }) {
  const t = useSafeToolsTranslation();

  // Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'computer' | 'mobile' | 'official'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'name' | 'official'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  // Clean, Deduplicated & Enriched Tools List
  const normalizedTools = useMemo(() => {
    const map = new Map<string, Tool>();

    // 1. Process Sanity API tools first
    (tools || []).forEach(apiTool => {
      const key = apiTool.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const enrichment = TOOL_ENRICHMENTS[key] || {};
      
      const mergedTool: Tool = {
        ...apiTool,
        name: enrichment.name || apiTool.name,
        description: apiTool.description || enrichment.description || '',
        icon: apiTool.icon || enrichment.icon || 'Box',
        os: (apiTool.os && apiTool.os.length > 0) ? apiTool.os : (enrichment.os || ['Windows']),
        isOfficial: apiTool.isOfficial ?? enrichment.isOfficial ?? true,
        githubUrl: apiTool.githubUrl || enrichment.githubUrl,
        detailUrl: apiTool.detailUrl || enrichment.detailUrl,
        author: apiTool.author || enrichment.author,
      };
      map.set(key, mergedTool);
    });

    // 2. Add fallback defaults ONLY IF not present in API data
    DEFAULT_FALLBACK_TOOLS.forEach(fbTool => {
      const key = fbTool.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!map.has(key)) {
        map.set(key, fbTool);
      }
    });

    return Array.from(map.values());
  }, [tools]);

  // Filtered & Sorted Tools
  const processedTools = useMemo(() => {
    return normalizedTools.filter(tool => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        tool.name.toLowerCase().includes(q) ||
        tool.description?.toLowerCase().includes(q) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        tool.os?.some(os => os.toLowerCase().includes(q))
      );
      if (!matchesSearch) return false;

      if (selectedCategory === 'computer') {
        return tool.os?.some(os => computerPlatforms.includes(os));
      }
      if (selectedCategory === 'mobile') {
        return tool.os?.some(os => mobilePlatforms.includes(os));
      }
      if (selectedCategory === 'official') {
        return tool.isOfficial === true;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'official') {
        if (a.isOfficial && !b.isOfficial) return -1;
        if (!a.isOfficial && b.isOfficial) return 1;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      const dateA = a.versions?.[0]?.releaseDate ? new Date(a.versions[0].releaseDate).getTime() : 0;
      const dateB = b.versions?.[0]?.releaseDate ? new Date(b.versions[0].releaseDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [normalizedTools, searchQuery, selectedCategory, sortBy]);

  const handleOpenVideo = (url: string, title: string) => {
    setVideoModal({ isOpen: true, url, title });
  };

  return (
    <div className="container mx-auto px-6 max-w-6xl pt-28 md:pt-36 pb-20 font-sans">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
          ChanomHub Utilities Suite
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-zinc-50 tracking-tight">
          {t('title')}
        </h1>

        <p className="text-xs md:text-sm text-zinc-400 max-w-xl leading-relaxed font-sans">
          {t('description')}
        </p>

        {/* Monospace Stats Bar */}
        <div className="pt-2 flex items-center justify-center gap-4 text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            {normalizedTools.length} Tools Available
          </span>
          <span>•</span>
          <span>Open Source & Free</span>
          <span>•</span>
          <span>Cross Platform</span>
        </div>
      </div>

      {/* Embedded Featured Showcase Component */}
      <FeaturedShowcase />

      {/* Control Bar (Search, Category Filter, Sort, View Mode) */}
      <div className="mb-8 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs font-sans focus:outline-none focus:border-zinc-700 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { key: 'all', label: t('filterAll') },
            { key: 'computer', label: t('filterComputer') },
            { key: 'mobile', label: t('filterMobile') },
            { key: 'official', label: t('filterOfficial') },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.key
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & Layout View Switch */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs font-mono focus:outline-none cursor-pointer"
          >
            <option value="latest">{t('sortLatest')}</option>
            <option value="name">{t('sortName')}</option>
            <option value="official">{t('sortOfficial')}</option>
          </select>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              title={t('viewGrid')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              title={t('viewList')}
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tools Content Grid / List */}
      {processedTools.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10">
          <Search className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-300 mb-1">
            {t('noSearchResults')}
          </h3>
          <p className="text-xs text-zinc-500 mb-4 font-sans">
            {t('noSearchResultsDesc')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-mono"
          >
            {t('resetFilters')}
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch' : 'flex flex-col gap-3'}>
          {processedTools.map((tool, index) => (
            <ToolCard
              key={tool._id || tool.name}
              tool={tool}
              index={index}
              viewMode={viewMode}
              onOpenVideo={handleOpenVideo}
            />
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      <Dialog open={videoModal.isOpen} onOpenChange={(open) => setVideoModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-2xl rounded-xl p-5 bg-zinc-950 border border-zinc-800 text-zinc-50 shadow-2xl">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Video className="w-4 h-4 text-zinc-400" />
              {videoModal.title} - {t('previewVideoTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-black">
            {videoModal.url && (
              <iframe
                src={videoModal.url}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={videoModal.title}
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}