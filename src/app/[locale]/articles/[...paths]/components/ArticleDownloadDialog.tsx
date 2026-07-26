// src/app/[locale]/articles/[...paths]/components/ArticleDownloadDialog.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { encodeDownloadUrl } from '@/utils/downloadUrl';
import cn from 'classnames';
import { Dialog, DialogContent, DialogTitle, Button } from '@/components/ui';
import { Download, ShieldCheck, LogIn, Star } from 'lucide-react';
import { getFileIcon, getFileSize } from "@/utils/fileUtils";
import { DownloadFile, TranslationFile } from "./Interfaces";
import { useDownloadDialog } from './hooks/useDownloadDialog';
import { Article } from '@/types/article';
import { getSdk } from '@/lib/sdk';

import { Link } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/imageUrl";
import type { ArticleListItem } from '@chanomhub/sdk';

interface ArticleDownloadDialogProps {
  article: Article;
  downloads: DownloadFile[];
  isMobile: boolean;
  isDarkMode: boolean;
  showAlert: (message: string, severity: 'success' | 'error') => void;
  openDownloadDialog: boolean;
  setOpenDownloadDialog: (open: boolean) => void;
  relatedArticles?: ArticleListItem[];
}

const ArticleDownloadDialog: React.FC<ArticleDownloadDialogProps> = ({
  article,
  downloads,
  isMobile,
  isDarkMode,
  showAlert,
  openDownloadDialog,
  setOpenDownloadDialog,
  relatedArticles = [],
}) => {
  const t = useTranslations('ArticleContent');
  const locale = useLocale();
  const {
    filteredDownloads,
  } = useDownloadDialog(downloads, showAlert);

  const [failedImageIds, setFailedImageIds] = React.useState<Set<string | number>>(new Set());

  const handleImageError = (id: string | number) => {
    setFailedImageIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const validRelatedArticles = React.useMemo(() => {
    if (!relatedArticles || relatedArticles.length === 0) return [];
    return relatedArticles.filter((rel) => {
      if (failedImageIds.has(rel.id) || (rel.slug && failedImageIds.has(rel.slug))) {
        return false;
      }
      const rawImage = rel.coverImage || rel.mainImage || (rel as any).backgroundImage;
      if (!rawImage || typeof rawImage !== 'string' || rawImage.trim() === '') {
        return false;
      }
      return true;
    });
  }, [relatedArticles, failedImageIds]);

  const handleOpenDownload = async (item: DownloadFile | TranslationFile) => {
    let url = "url" in item ? item.url : item.fileUrl;

    // Detect pseudo-download URLs that point back to the article (e.g. ?purchase=true)
    if (url.includes('purchase=true') || (url.includes('/articles/') && !url.startsWith('http'))) {
      showAlert(t('needPurchaseToDownload'), 'error');
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

    const encodedUrl = encodeDownloadUrl(url);
    const encodedName = encodeURIComponent(item.name);
    const size = "size" in item && typeof item.size === 'number' ? item.size : '';
    const encodedSize = size ? encodeURIComponent(size.toString()) : '';
    const redirectUrl = `/${locale}/download/redirect?url=${encodedUrl}&name=${encodedName}&size=${encodedSize}`;
    window.open(redirectUrl, "_blank");
  };

  const isPseudoLink = (item: DownloadFile | TranslationFile) => {
    const url = "url" in item ? item.url : item.fileUrl;
    return url.includes('purchase=true') || (url.includes('/articles/') && !url.startsWith('http'));
  };

  const FileRow = ({ item, index }: { item: DownloadFile | TranslationFile; index: number }) => {
    const pseudo = isPseudoLink(item);
    const size = "size" in item && typeof item.size === 'number' ? getFileSize(item.size) : null;
    
    // If the article is already unlocked (free or purchased), we should show the Download button
    // even if it looks like a pseudo link (though backend shouldn't send pseudo links if unlocked)
    const showDownloadButton = article.isUnlocked || !pseudo;

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200",
          isDarkMode
            ? "bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700/50"
            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
        )}
      >
        {/* Download / Login Button */}
        {showDownloadButton ? (
          <Button
            size="sm"
            className="shrink-0 bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-4"
            onClick={() => handleOpenDownload(item)}
          >
            <Download className="size-4 mr-1.5" />
            Download
          </Button>
        ) : (
          <Button
            size="sm"
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4"
            onClick={() => window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`}
          >
            <LogIn className="size-4 mr-1.5" />
            Login
          </Button>
        )}

        {/* File Name */}
        <span className={cn(
          "flex-1 font-semibold text-sm truncate",
          isDarkMode ? "text-gray-100" : "text-gray-900"
        )}>
          {item.name}
        </span>

        {/* File Size */}
        {size && (
          <span className={cn(
            "text-xs font-medium shrink-0",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            {size}
          </span>
        )}

        {/* File Type Icon */}
        <div className="shrink-0">
          {getFileIcon(item.name)}
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={openDownloadDialog} onOpenChange={setOpenDownloadDialog}>
      <DialogContent className={cn(
        "p-0 overflow-hidden border border-gray-700/60 shadow-2xl transition-all",
        isMobile ? "max-w-[95vw]" : "max-w-4xl"
      )}>
        <DialogTitle className="sr-only">{t("downloadsAndTranslations")}</DialogTitle>

        {/* Header */}
        <div className={cn(
          "px-6 pt-6 pb-4 flex items-center justify-between",
          isDarkMode ? "bg-gray-900" : "bg-white"
        )}>
          <h3 className={cn(
            "text-xl font-bold flex items-center gap-2",
            isDarkMode ? "text-cyan-400" : "text-cyan-600"
          )}>
            <Download className="size-6" />
            Download
          </h3>
          <a href={`chanox2://article/${article.slug}`}>
            <Button
              size="sm"
              variant="outline"
              className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 font-bold"
            >
              <Download className="size-4 mr-1.5" />
              {t("openInChanoX2")}
            </Button>
          </a>
        </div>

        {/* Download List */}
        <div className={cn(
          "px-6 pb-4 space-y-2 max-h-[50vh] overflow-y-auto",
          isDarkMode ? "bg-gray-900" : "bg-white"
        )}>
          {filteredDownloads.length > 0 ? (
            filteredDownloads.map((item, index) => (
              <FileRow key={item.id} item={item} index={index} />
            ))
          ) : (
            <div className="text-center py-8">
              <Download className={cn("size-12 mx-auto mb-3", isDarkMode ? "text-gray-600" : "text-gray-300")} />
              <p className={cn("text-sm", isDarkMode ? "text-gray-500" : "text-gray-400")}>
                {t("noFiles")}
              </p>
            </div>
          )}
        </div>

        {/* More you might be interested in (itch.io style cards) */}
        {validRelatedArticles && validRelatedArticles.length > 0 && (
          <div className={cn(
            "px-6 py-5 border-t",
            isDarkMode ? "bg-gray-900/95 border-gray-800 text-[#acb2b8]" : "bg-gray-50 border-gray-200 text-gray-700"
          )}>
            <h4 className={cn(
              "text-xs font-bold uppercase tracking-wider mb-3.5 flex items-center gap-2",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>
              <span className="w-1.5 h-3.5 bg-cyan-500 rounded-full inline-block" />
              {t("relatedArticles")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
              {validRelatedArticles.slice(0, 8).map((rel) => {
                const rawImg = rel.coverImage || rel.mainImage || (rel as any).backgroundImage;
                const cover = getImageUrl(rawImg, "card") || rawImg;
                const priceText = rel.isPaid && !rel.isUnlocked ? `${rel.price || 0} CC` : 'Free';
                const ratingVal = (rel as any).ratingsAverage || (rel as any).rating || 5;
                const votesVal = (rel as any).ratingsCount || (rel as any).favoritesCount || (rel as any).viewsCount || 0;

                return (
                  <Link
                    key={rel.id}
                    href={`/articles/${rel.slug}`}
                    onClick={() => setOpenDownloadDialog(false)}
                    className={cn(
                      "group flex flex-col rounded-lg border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
                      isDarkMode 
                        ? "bg-gray-800/50 hover:bg-gray-800 border-gray-700/60 hover:border-cyan-500/50" 
                        : "bg-white hover:bg-gray-50 border-gray-200 hover:border-cyan-500/50"
                    )}
                  >
                    {/* Cover Image Container */}
                    <div className="relative aspect-[16/9] w-full bg-black/50 overflow-hidden">
                      <img 
                        src={cover} 
                        alt={rel.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        onError={() => handleImageError(rel.id)}
                      />
                      {/* Price / Access Badge */}
                      <div className={cn(
                        "absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md shadow-md border",
                        rel.isPaid && !rel.isUnlocked
                          ? "bg-amber-500/90 text-white border-amber-400/30"
                          : "bg-emerald-600/90 text-white border-emerald-400/30"
                      )}>
                        {priceText}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        {/* Title */}
                        <h5 className={cn(
                          "text-xs font-bold truncate group-hover:text-cyan-400 transition-colors leading-snug",
                          isDarkMode ? "text-gray-100" : "text-gray-900"
                        )}>
                          {rel.title}
                        </h5>

                        {/* Author */}
                        <p className={cn(
                          "text-[10px] truncate mt-0.5 font-medium",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          By {rel.author?.name || "Admin"}
                        </p>
                      </div>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                        <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                        <span>{typeof ratingVal === 'number' ? ratingVal.toFixed(1) : '5.0'}</span>
                        {votesVal > 0 && (
                          <span className={cn(
                            "text-[9px] font-normal ml-0.5",
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          )}>
                            ({votesVal})
                          </span>
                        )}
                      </div>

                      {/* Short Description */}
                      {rel.description && (
                        <p className={cn(
                          "text-[10px] line-clamp-2 leading-relaxed font-sans mt-0.5",
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          {rel.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={cn(
          "px-6 py-3 border-t flex justify-center",
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
        )}>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <ShieldCheck className="size-4" />
            <span className="text-xs font-medium">Scanned with VirusTotal</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleDownloadDialog;
