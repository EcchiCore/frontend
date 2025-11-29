// src/app/[locale]/articles/[...paths]/components/ArticleDownloadDialog.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import cn from 'classnames';
import { Dialog, DialogContent, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button, Input } from '@/components/ui';
import { Download, CalendarDays, Folder, User, Info, Check, Clipboard, Search } from 'lucide-react';
import { getFileIcon, getFileSize } from "@/utils/fileUtils";
import { DownloadFile, TranslationFile } from "./Interfaces";
import { useDownloadDialog } from './hooks/useDownloadDialog';
import { Article } from '@/types/article'; // Assuming you need article data for formatDate

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
  article: _article,
  downloads,
  isMobile,
  isDarkMode,
  showAlert,
  openDownloadDialog,
  setOpenDownloadDialog,
}) => {
  console.log("Downloads received in ArticleDownloadDialog:", downloads);
  const t = useTranslations('ArticleContent');
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredDownloads,
    handleCopyLink,
    copiedLink,
  } = useDownloadDialog(downloads, showAlert);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleOpenDownload = (item: DownloadFile | TranslationFile) => {
    const url = "url" in item ? item.url : item.fileUrl;
    window.open(url, "_blank");
  };

  const FileCard = ({ item, index }: { item: DownloadFile | TranslationFile; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300",
        "hover:scale-[1.02] hover:-translate-y-1",
        isDarkMode
          ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600"
          : "bg-white/70 border-gray-200 hover:bg-white hover:border-gray-300"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "flex size-14 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
            isDarkMode ? "bg-gray-700/50 group-hover:bg-gray-600" : "bg-gray-50 group-hover:bg-gray-100"
          )}>
            {getFileIcon(item.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h5 className={cn(
              "font-semibold break-words mb-2 line-clamp-2",
              isDarkMode ? "text-gray-100" : "text-gray-900"
            )}>
              {item.name}
            </h5>

            <div className="space-y-2">
              {"createdAt" in item && (
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <CalendarDays className="size-4" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              )}

              {"size" in item && typeof item.size === 'number' && (
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <Folder className="size-4" />
                  <span>{getFileSize(item.size)}</span>
                </div>
              )}

              {"translator" in item && item.translator && (
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <User className="size-4" />
                  <span>{t("translatedBy", { name: item.translator.name, language: item.language })}</span>
                </div>
              )}
            </div>

            {"description" in item && item.description && (
              <div className={cn(
                "flex items-start gap-2 text-sm mt-3 p-3 rounded-lg",
                isDarkMode ? "bg-gray-700/30 text-gray-300" : "bg-gray-50 text-gray-600"
              )}>
                <Info className="size-4 mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{item.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            className="flex-1"
            onClick={() => handleOpenDownload(item)}
          >
            <Download className="size-5 mr-2" />
            <span>{t("downloadFiles")}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleCopyLink("url" in item ? item.url : item.fileUrl)}
            aria-label={t("copyLink")}
          >
            {copiedLink === ("url" in item ? item.url : item.fileUrl) ? (
              <>
                <Check className="size-5 mr-2" />
                <span>{t("copied")}</span>
              </>
            ) : (
              <>
                <Clipboard className="size-5 mr-2" />
                <span>{t("copy")}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderFileItems = (items: (DownloadFile | TranslationFile)[], title: string) => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h4 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Folder className="size-5" />
          {title} ({items.length})
        </h4>

        <div className="flex items-center gap-2 text-foreground w-full sm:w-auto">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "date")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{t("sortByDate")}</SelectItem>
              <SelectItem value="name">{t("sortByName")}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <FileCard key={item.id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Folder className="size-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2 text-gray-500">
            {searchQuery ? t("noSearchResults") : t("noFiles")}
          </p>
          {searchQuery && (
            <p className="text-sm text-gray-400">
              {t("tryDifferentSearch")}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );

  return (
    <Dialog open={openDownloadDialog} onOpenChange={setOpenDownloadDialog}>
      <DialogContent className={isMobile ? "max-w-[95vw] h-[80vh] overflow-y-auto" : "max-w-6xl"}>
        <DialogTitle className="sr-only">{t("downloadsAndTranslations")}</DialogTitle>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-500" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl"
          />
        </div>
        <Tabs defaultValue="downloads" className="w-full">
          <TabsList className={isMobile ? "flex-col h-auto" : ""}>
            <TabsTrigger value="downloads">{t("downloadFiles")} ({filteredDownloads.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="downloads">
            {renderFileItems(filteredDownloads, t("downloadFiles"))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleDownloadDialog;
