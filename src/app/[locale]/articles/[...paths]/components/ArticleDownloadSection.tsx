"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Download, ShieldCheck, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileIcon, getFileSize } from "@/utils/fileUtils";
import { DownloadFile } from "./Interfaces";
import { Article } from '@/types/article';
import { getSdk } from '@/lib/sdk';

interface ArticleDownloadSectionProps {
  article: Article;
  downloads: DownloadFile[];
  isDarkMode: boolean;
  handlePurchase?: () => void;
  isPurchasing?: boolean;
  showAlert?: (message: string, severity: 'success' | 'error') => void;
}

// OS Custom SVG Icons
const WindowsIcon = () => (
  <span className="inline-flex items-center justify-center p-1 rounded-md bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors" title="Windows">
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M0 3.449L9.75 2.1v9.451H0V3.449zM0 12.549h9.75v9.451L0 20.551v-8.002zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.549H24V24l-13.2-1.95v-9.501z" />
    </svg>
  </span>
);

const MacIcon = () => (
  <span className="inline-flex items-center justify-center p-1 rounded-md bg-zinc-500/10 text-zinc-400 dark:text-zinc-300 hover:bg-zinc-500/20 transition-colors" title="macOS">
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.029-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.51 12.06 1.005 1.45 2.187 3.068 3.761 3.008 1.514-.06 2.09-.974 3.916-.974 1.815 0 2.34.974 3.923.94 1.62-.029 2.665-1.464 3.654-2.903 1.144-1.668 1.613-3.278 1.637-3.364-.035-.015-3.136-1.203-3.167-4.78-.027-2.985 2.45-4.417 2.56-4.484-1.397-2.05-3.55-2.28-4.307-2.33-1.986-.164-3.879 1.204-4.883 1.204-.997 0-2.52-1.188-4.146-1.188zM15.86 3.518c.828-1.01 1.385-2.415 1.233-3.818-1.2.049-2.656.8-3.518 1.812-.733.849-1.373 2.274-1.203 3.658 1.341.104 2.716-.69 3.488-1.652z" />
    </svg>
  </span>
);

const LinuxIcon = () => (
  <span className="inline-flex items-center justify-center p-1 rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors" title="Linux">
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2a5 5 0 0 0-5 5c0 1 .4 2 1 3a9 9 0 0 0-3 6.5c0 1 .8 1.5 1.5 1.5h11c.7 0 1.5-.5 1.5-1.5A9 9 0 0 0 17 10c.6-1 1-2 1-3a5 5 0 0 0-5-5zm0 13c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
    </svg>
  </span>
);

const AndroidIcon = () => (
  <span className="inline-flex items-center justify-center p-1 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors" title="Android">
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M17.523 15.3c-.149 0-.272-.122-.272-.27 0-.15.123-.27.272-.27.148 0 .27.12.27.27 0 .148-.122.27-.27.27m-11.046 0c-.149 0-.27-.122-.27-.27 0-.15.121-.27.27-.27.148 0 .27.12.27.27 0 .148-.122.27-.27.27m11.253-3.839l1.796-3.111a.256.256 0 0 0-.093-.349.25.25 0 0 0-.345.093l-1.822 3.158c-1.579-.72-3.332-1.12-5.263-1.12-1.93 0-3.684.4-5.263 1.12L4.966 8.122a.253.253 0 0 0-.345-.093.256.256 0 0 0-.093.349l1.796 3.111C2.868 13.911.43 17.61.1 22h23.8c-.33-4.39-2.768-8.089-6.224-10.539" />
    </svg>
  </span>
);

const detectPlatforms = (name: string) => {
  const lower = name.toLowerCase();
  const platforms: React.ReactNode[] = [];
  
  if (lower.includes('win') || lower.includes('pc') || lower.endsWith('.exe') || lower.includes('windows')) {
    platforms.push(<WindowsIcon key="win" />);
  }
  if (lower.includes('mac') || lower.includes('osx') || lower.endsWith('.dmg') || lower.includes('apple')) {
    platforms.push(<MacIcon key="mac" />);
  }
  if (lower.includes('linux') || lower.includes('tux') || lower.endsWith('.sh') || lower.includes('ubuntu')) {
    platforms.push(<LinuxIcon key="linux" />);
  }
  if (lower.includes('apk') || lower.includes('android')) {
    platforms.push(<AndroidIcon key="android" />);
  }
  
  return platforms;
};

const ArticleDownloadSection: React.FC<ArticleDownloadSectionProps> = ({
  article,
  downloads,
  isDarkMode,
  handlePurchase,
  isPurchasing = false,
  showAlert,
}) => {
  const t = useTranslations('ArticleContent');
  const activeDownloads = downloads?.filter((d) => d.isActive) || [];
  const isUnlocked = article.isUnlocked || article.price === 0;
  
  const [showSteamModal, setShowSteamModal] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<DownloadFile | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile device layout and capabilities to skip Steam-style modal on mobile
  React.useEffect(() => {
    const checkMobile = () => {
      const mobileWidth = window.innerWidth < 768;
      const hasTouch = window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobileWidth || hasTouch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (activeDownloads.length === 0) return null;

  const handleOpenDownload = async (dl: DownloadFile) => {
    let url = dl.url;

    // Detect pseudo-download URLs that point back to the article (e.g. ?purchase=true)
    if (url.includes('purchase=true') || (url.includes('/articles/') && !url.startsWith('http'))) {
      if (showAlert) {
        showAlert(t('needPurchaseToDownload') || 'Please purchase the article first to access the download files', 'error');
      }
      return;
    }

    // If it's a relative path from our own R2 storage
    if (url.startsWith('premium/') || url.startsWith('public/')) {
      try {
        const sdk = await getSdk();
        url = sdk.storage.getProtectedUrl(url, article.id);
      } catch (error) {
        console.error('Failed to get protected URL:', error);
      }
    }

    window.open(url, "_blank");
  };

  const handleDownloadClick = (dl: DownloadFile) => {
    if (isMobile) {
      // Mobile device: direct browser download immediately!
      handleOpenDownload(dl);
    } else {
      // PC desktop: show the beautiful Steam-style Got ChanoX2 modal!
      setSelectedFile(dl);
      setShowSteamModal(true);
    }
  };

  return (
    <div className="space-y-6 mt-12 mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-4">
        <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <Download className="w-7 h-7 text-primary" />
          {t('downloads.title') || 'Download'}
        </h2>
        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3.5 py-1.5 rounded-full border border-green-500/20 shadow-sm w-fit self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider">Scanned with VirusTotal</span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
        {t('downloads.clickToGetAccess') || 'Click download now to get access to the following files:'}
      </p>

      {/* Files List */}
      <div id="download-files-list" className="divide-y divide-border/30 border border-border/40 rounded-2xl bg-card/40 backdrop-blur-md shadow-lg overflow-hidden">
        {activeDownloads.map((dl, i) => {
          const platformIcons = detectPlatforms(dl.name);
          const sizeStr = "size" in dl && typeof dl.size === 'number' ? getFileSize(dl.size) : null;
          
          return (
            <motion.div 
              key={dl.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 hover:bg-muted/10 transition-colors duration-200"
            >
              {/* Left Column: Icon + File Details */}
              <div className="flex items-start gap-4 min-w-0">
                {/* Outlined Custom document icon inside a rounded dark grey box */}
                <div className="p-3 rounded-xl bg-slate-900/60 text-blue-500 shadow-inner border border-border/10 shrink-0">
                  <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                
                <div className="space-y-1.5 min-w-0">
                  {isUnlocked ? (
                    <button 
                      onClick={() => handleDownloadClick(dl)}
                      className="text-left font-extrabold text-foreground hover:text-primary transition-colors text-base md:text-lg block truncate cursor-pointer focus:outline-none"
                    >
                      {dl.name}
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      className="text-left font-extrabold text-muted-foreground/80 hover:text-primary transition-colors text-base md:text-lg block truncate cursor-pointer focus:outline-none"
                    >
                      {dl.name}
                    </button>
                  )}
                  
                  {/* Badges and Metadata row (visible on mobile under the title) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {dl.forVersion && (
                      <span className="inline-block text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-md uppercase tracking-wider">
                        v{dl.forVersion}
                      </span>
                    )}
                    {sizeStr && (
                      <span className="inline-block text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {sizeStr}
                      </span>
                    )}
                    {/* Render platform icons inline on mobile */}
                    <div className="flex md:hidden items-center gap-1.5 ml-1">
                      {platformIcons}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Platform icons (Desktop only) and Download/Unlock button */}
              <div className="flex flex-col sm:flex-row md:items-center gap-4 shrink-0 md:justify-end border-t border-border/20 pt-4 md:pt-0 md:border-0 mt-2 md:mt-0">
                {/* Platform Icons & Size (Desktop only) */}
                <div className="hidden md:flex items-center gap-3">
                  {platformIcons.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {platformIcons}
                    </div>
                  )}
                </div>
                
                {/* Download Button */}
                {isUnlocked ? (
                  <Button 
                    size="lg"
                    onClick={() => handleDownloadClick(dl)}
                    className="w-full md:w-auto h-11 md:h-9 px-6 md:px-4 rounded-xl md:rounded-lg bg-white hover:bg-slate-100 text-slate-900 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-black shadow-sm hover:scale-105 active:scale-95 transition-all text-sm md:text-xs cursor-pointer border border-border/10 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 md:w-3.5 md:h-3.5 text-slate-800" />
                    Download
                  </Button>
                ) : (
                  <Button 
                    size="lg"
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="w-full md:w-auto h-11 md:h-9 px-6 md:px-4 rounded-xl md:rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md hover:scale-105 active:scale-95 transition-all text-sm md:text-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isPurchasing ? (
                      <div className="animate-spin rounded-full h-4 w-4 md:h-3 md:w-3 border-2 border-white/30 border-t-white" />
                    ) : (
                      <Lock className="w-4 h-4 md:w-3 md:h-3" />
                    )}
                    Unlock
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Steam-Style Modal Dialog (PC only) */}
      <AnimatePresence>
        {!isMobile && showSteamModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSteamModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-md border-2 border-[#2a475e] bg-[#172030] text-[#acb2b8] shadow-2xl z-10"
              style={{ fontFamily: 'Motiva Sans, Arial, sans-serif' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2a475e]/40 px-6 py-4">
                <h3 className="text-2xl font-black text-white tracking-wide">
                  {t('downloads.gotChanoX2') || 'Got ChanoX2?'}
                </h3>
                <button 
                  onClick={() => setShowSteamModal(false)}
                  className="text-[#acb2b8] hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-8 space-y-6">
                <p className="text-sm md:text-base leading-relaxed text-[#acb2b8]">
                  {t('downloads.modalDesc', { game: article.title }) || 
                    `You need to have the ChanoX2 desktop application installed before you can install and launch ${article.title}. Do you have ChanoX2 installed on this computer?`
                  }
                </p>

                {/* Steam-style double action columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: Yes */}
                  <button 
                    onClick={() => {
                      window.location.href = `chanox2://article/${article.slug}`;
                      setShowSteamModal(false);
                    }}
                    className="flex flex-col text-left p-5 rounded bg-gradient-to-r from-[#214b6b] to-[#12293a] hover:from-[#306e9c] hover:to-[#1a384f] border border-[#3884b8]/30 hover:border-[#67c1f5]/50 group transition-all duration-200 cursor-pointer shadow-md shadow-black/35 hover:scale-[1.02]"
                  >
                    <span className="text-white font-extrabold text-lg md:text-xl group-hover:text-white transition-colors">
                      {t('downloads.yesInstalled') || 'Yes, ChanoX2 is installed'}
                    </span>
                    <span className="text-[#67c1f5] group-hover:text-[#88d1f8] font-bold text-xs md:text-sm mt-1 uppercase tracking-wide">
                      {t('downloads.playNow') || 'Play this game now'}
                    </span>
                  </button>

                  {/* Option 2: No */}
                  <button 
                    onClick={() => {
                      window.open('/chanox2', '_blank');
                      setShowSteamModal(false);
                    }}
                    className="flex flex-col text-left p-5 rounded bg-[#202936] hover:bg-[#2d3a4d] border border-border/10 hover:border-[#acb2b8]/30 group transition-all duration-200 cursor-pointer shadow-md shadow-black/35 hover:scale-[1.02]"
                  >
                    <span className="text-white font-extrabold text-lg md:text-xl transition-colors">
                      {t('downloads.noNeed') || 'No, I need ChanoX2'}
                    </span>
                    <span className="text-[#acb2b8] group-hover:text-white font-bold text-xs md:text-sm mt-1 uppercase tracking-wide transition-colors text-left">
                      {t('downloads.downloadClient') || 'Read about and download ChanoX2'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Footer Bar */}
              <div className="flex items-center gap-4 bg-[#121824] px-6 py-5 border-t border-[#2a475e]/30">
                {/* 3D Box Logo */}
                <div className="shrink-0 text-sky-400 bg-sky-500/10 p-2.5 rounded-lg border border-sky-500/20 shadow-inner">
                  <svg className="w-8 h-8 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                
                <div className="text-[11px] md:text-xs leading-relaxed text-[#8f98a0] flex-1">
                  <p>
                    {t('downloads.footerDesc') || "ChanoX2 is the premiere desktop gaming platform. It's free to join and easy to use. "}
                    <button 
                      onClick={() => {
                        window.open('/chanox2', '_blank');
                        setShowSteamModal(false);
                      }}
                      className="text-white underline hover:text-[#67c1f5] font-semibold ml-1 cursor-pointer focus:outline-none"
                    >
                      {t('downloads.learnMore') || 'Learn more about ChanoX2.'}
                    </button>
                  </p>
                  
                  {selectedFile && (
                    <div className="mt-2 border-t border-[#2a475e]/20 pt-2 text-[#67c1f5]">
                      <button 
                        onClick={() => {
                          handleOpenDownload(selectedFile);
                          setShowSteamModal(false);
                        }}
                        className="text-left underline hover:text-[#88d1f8] font-bold cursor-pointer focus:outline-none flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        {t('downloads.directDownload', { file: selectedFile.name }) || `Or download ${selectedFile.name} directly in your browser`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArticleDownloadSection;
