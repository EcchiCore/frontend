// src/app/[locale]/articles/[...paths]/components/ArticleDownloadDialog.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import cn from 'classnames';
import { Dialog, DialogContent, DialogTitle, Button } from '@/components/ui';
import { Download, ShieldCheck, LogIn } from 'lucide-react';
import { getFileIcon, getFileSize } from "@/utils/fileUtils";
import { DownloadFile, TranslationFile } from "./Interfaces";
import { useDownloadDialog } from './hooks/useDownloadDialog';
import { Article } from '@/types/article';
import { getSdk } from '@/lib/sdk';

interface ArticleDownloadDialogProps {
  article: Article;
  downloads: DownloadFile[];
  isMobile: boolean;
  isDarkMode: boolean;
  showAlert: (message: string, severity: 'success' | 'error') => void;
  openDownloadDialog: boolean;
  setOpenDownloadDialog: (open: boolean) => void;
}

const ArticleDownloadDialog: React.FC<ArticleDownloadDialogProps> = ({
  article,
  downloads,
  isMobile,
  isDarkMode,
  showAlert,
  openDownloadDialog,
  setOpenDownloadDialog,
}) => {
  const t = useTranslations('ArticleContent');
  const {
    filteredDownloads,
  } = useDownloadDialog(downloads, showAlert);

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

    window.open(url, "_blank");
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
        "p-0 overflow-hidden",
        isMobile ? "max-w-[95vw]" : "max-w-2xl"
      )}>
        <DialogTitle className="sr-only">{t("downloadsAndTranslations")}</DialogTitle>

        {/* Header */}
        <div className={cn(
          "px-6 pt-6 pb-4",
          isDarkMode ? "bg-gray-900" : "bg-white"
        )}>
          <h3 className={cn(
            "text-xl font-bold flex items-center gap-2",
            isDarkMode ? "text-cyan-400" : "text-cyan-600"
          )}>
            <Download className="size-6" />
            Download
          </h3>
        </div>

        {/* Download List */}
        <div className={cn(
          "px-6 pb-4 space-y-2 max-h-[60vh] overflow-y-auto",
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
