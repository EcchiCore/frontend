// DownloadModal.tsx
"use client";
import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { DownloadFile, TranslationFile } from "./Interfaces";
import {
  DocumentTextIcon,
  CodeBracketIcon,
  CloudArrowDownIcon,
  DocumentIcon,
  CheckIcon,
  ClipboardIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  CalendarDaysIcon,
  UserIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // 修正路径为完整路径

interface DownloadModalProps {
  openDownloadDialog: boolean;
  setOpenDownloadDialog: (value: boolean) => void;
  downloads: DownloadFile[];
  translationFiles: TranslationFile[];
  handleOpenDownload: (item: DownloadFile | TranslationFile) => void;
  handleCopyLink: (url: string) => void;
  copiedLink: string | null;
  formatDate: (dateString: string) => string;
  isDarkMode?: boolean;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
                                                       openDownloadDialog,
                                                       setOpenDownloadDialog,
                                                       downloads,
                                                       translationFiles,
                                                       handleOpenDownload,
                                                       handleCopyLink,
                                                       copiedLink,
                                                       formatDate,
                                                       isDarkMode = false,
                                                     }) => {
  const t = useTranslations("DownloadModal");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"downloads" | "translations">("downloads");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getFileIcon = (name: string = "") => {
    const lowerCaseName = name.toLowerCase();
    const iconClass = "w-6 h-6";

    if (lowerCaseName.endsWith(".pdf"))
      return <DocumentTextIcon className={`${iconClass} text-red-500`} />;
    if (
      [".js", ".ts", ".py", ".java", ".cs", ".html", ".css"].some((ext) =>
        lowerCaseName.endsWith(ext)
      )
    )
      return <CodeBracketIcon className={`${iconClass} text-emerald-500`} />;
    if ([".zip", ".rar", ".7z"].some((ext) => lowerCaseName.endsWith(ext)))
      return <CloudArrowDownIcon className={`${iconClass} text-amber-500`} />;
    return <DocumentIcon className={`${iconClass} text-blue-500`} />;
  };

  const getFileSize = (size?: number) => {
    if (!size) return null;

    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let fileSize = size;

    while (fileSize >= 1024 && index < units.length - 1) {
      fileSize /= 1024;
      index++;
    }

    return `${fileSize.toFixed(1)} ${units[index]}`;
  };

  const sortItems = <T extends DownloadFile | TranslationFile>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  const filteredDownloads = useMemo(() => {
    const filtered = downloads.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ("description" in item && typeof item.description === 'string' && item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return sortItems(filtered);
  }, [downloads, searchQuery, sortBy, sortOrder]);

  const filteredTranslationFiles = useMemo(() => {
    const filtered = translationFiles.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ("translator" in item && item.translator?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return sortItems(filtered);
  }, [translationFiles, searchQuery, sortBy, sortOrder]);

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
      {/* Gradient overlay */}
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

            {/* File info */}
            <div className="space-y-2">
              <div className={cn(
                "flex items-center gap-2 text-sm",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>
                <CalendarDaysIcon className="size-4" />
                <span>{formatDate(item.createdAt)}</span>
              </div>

              {"size" in item && typeof item.size === 'number' && (
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <FolderIcon className="size-4" />
                  <span>{getFileSize(item.size)}</span>
                </div>
              )}

              {"translator" in item && item.translator && (
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <UserIcon className="size-4" />
                  <span>{t("translatedBy", { name: item.translator.name, language: item.language })}</span>
                </div>
              )}
            </div>

            {"description" in item && item.description && (
              <div className={cn(
                "flex items-start gap-2 text-sm mt-3 p-3 rounded-lg",
                isDarkMode ? "bg-gray-700/30 text-gray-300" : "bg-gray-50 text-gray-600"
              )}>
                <InformationCircleIcon className="size-4 mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{item.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => handleOpenDownload(item)}
          >
            <CloudArrowDownIcon className="size-5" />
            <span>{t("download")}</span>
          </button>

          <button
            className={cn(
              "px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg",
              copiedLink === ("url" in item ? item.url : item.fileUrl)
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white transform scale-105"
                : isDarkMode
                  ? "border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            )}
            onClick={() => handleCopyLink("url" in item ? item.url : item.fileUrl)}
            aria-label={t("copyLink")}
          >
            {copiedLink === ("url" in item ? item.url : item.fileUrl) ? (
              <>
                <CheckIcon className="size-5" />
                <span>{t("copied")}</span>
              </>
            ) : (
              <>
                <ClipboardIcon className="size-5" />
                <span>{t("copy")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderFileItems = (items: (DownloadFile | TranslationFile)[], title: string) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className={cn(
          "text-lg font-semibold flex items-center gap-2",
          isDarkMode ? "text-gray-100" : "text-gray-900"
        )}>
          <FolderIcon className="size-5" />
          {title} ({items.length})
        </h4>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "date")}
            className={cn(
              "select select-sm select-bordered",
              isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900"
            )}
          >
            <option value="date">{t("sortByDate")}</option>
            <option value="name">{t("sortByName")}</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            className={cn(
              "btn btn-sm btn-outline",
              isDarkMode ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-700"
            )}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
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
          <FolderIcon className={cn(
            "size-16 mx-auto mb-4",
            isDarkMode ? "text-gray-600" : "text-gray-400"
          )} />
          <p className={cn(
            "text-lg font-medium mb-2",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            {searchQuery ? t("noSearchResults") : t("noFiles")}
          </p>
          {searchQuery && (
            <p className={cn(
              "text-sm",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}>
              {t("tryDifferentSearch")}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {openDownloadDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpenDownloadDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={cn(
              "w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden",
              isDarkMode ? "bg-gray-900/95 border border-gray-700" : "bg-white/95 border border-gray-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn(
              "sticky top-0 z-10 backdrop-blur-sm border-b px-6 py-4",
              isDarkMode ? "bg-gray-900/80 border-gray-700" : "bg-white/80 border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn(
                  "text-2xl font-bold flex items-center gap-3",
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                )}>
                  <CloudArrowDownIcon className="w-8 h-8 text-blue-500" />
                  <span>{t("title")}</span>
                </h3>
                <button
                  className={cn(
                    "btn btn-sm btn-circle btn-ghost",
                    isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => setOpenDownloadDialog(false)}
                  aria-label={t("close")}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 size-5",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )} />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "input input-bordered w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 focus:scale-105",
                    isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600 focus:border-blue-500" : "bg-white text-gray-900 border-gray-300 focus:border-blue-500"
                  )}
                />
              </div>

              {/* Tabs */}
              <div className="tabs tabs-boxed bg-opacity-50">
                <button
                  className={cn(
                    "tab tab-lg transition-all duration-200",
                    activeTab === "downloads" ? "tab-active" : ""
                  )}
                  onClick={() => setActiveTab("downloads")}
                >
                  {t("downloadFiles")} ({filteredDownloads.length})
                </button>
                <button
                  className={cn(
                    "tab tab-lg transition-all duration-200",
                    activeTab === "translations" ? "tab-active" : ""
                  )}
                  onClick={() => setActiveTab("translations")}
                >
                  {t("translationFiles")} ({filteredTranslationFiles.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === "downloads" ? (
                  <motion.div
                    key="downloads"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderFileItems(filteredDownloads, t("downloadFiles"))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="translations"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderFileItems(filteredTranslationFiles, t("translationFiles"))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DownloadModal;