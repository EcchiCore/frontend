"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Link as TiptapLink } from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import {TextStyle} from '@tiptap/extension-text-style';

import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';

import CustomArticleAlert from "./Alert";
import { Alert } from "@/components/ui/alert";
import SidebarLeft from "./SidebarLeft";
import InteractionBar from "./InteractionBar";
import CommentsSection from "./CommentsSection";
import ArticleInfoSidebar from "./ArticleInfoSidebar"; // New import
import { getFileIcon, getFileSize } from "@/utils/fileUtils";
import ArticleTitleMeta from "./ArticleTitleMeta";
import { Article } from "@/types/article";
import { TranslationFile, Comment, TokenPayload, AlertState, DownloadFile } from "./Interfaces";
import myImageLoader from "@/lib/imageLoader";

const PLACEHOLDER_IMAGE = '/placeholder-image.png';

import { useDebounce } from "./Debounce";
import { Download, CalendarDays, Folder, User, Info, Check, Clipboard, Search, Clock, Tag, Cpu } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Dialog, DialogContent, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge } from "@/components/ui";
import cn from 'classnames';
import { useTranslations } from 'next-intl';
import { TextAlign } from "@tiptap/extension-text-align";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ArticleContentProps {
  article: Article;
  slug: string;
  articleId?: number;
  downloads: DownloadFile[];
}

const fetcher = (url: string) => {
  const token = Cookies.get("token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { headers }).then((res) => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  });
};

const ArticleContent: React.FC<ArticleContentProps> = ({
                                                         article,
                                                         slug,
                                                         downloads,
                                                       }) => {
  console.log("Downloads prop in ArticleContent:", downloads);
  const t = useTranslations('ArticleContent');
  // Essential state
  const [isFavorited, setIsFavorited] = useState(article.favorited);
  const [favoritesCount, setFavoritesCount] = useState(article.favoritesCount);
  const [isFollowing, setIsFollowing] = useState(article.author.following);
  const [isCurrentUserAuthor, setIsCurrentUserAuthor] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ open: false, message: "", severity: "success" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Keep isMobile for other potential uses
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const sortItems = useCallback(<T extends DownloadFile | TranslationFile>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name" || !("createdAt" in a && "createdAt" in b)) {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [sortBy, sortOrder]);

  const filteredDownloads = React.useMemo(() => {
    if (!downloads) return [];
    const filtered = downloads.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ("description" in item && typeof item.description === 'string' && item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return sortItems(filtered);
  }, [downloads, searchQuery, sortItems]);

  const handleCopyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(url);
      setAlert({ open: true, message: t("linkCopied"), severity: "success" });
      setTimeout(() => setAlert((prev) => ({ ...prev, open: false })), 2000);
    } catch {
      setAlert({ open: true, message: t("copyLinkError"), severity: "error" });
    }
  }, [t]);

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'mb-4 font-bold',
          },
        },
        link: false,
        underline: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      TextStyle,
      Color,
      Underline,
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
        allowBase64: true,
        inline: false,
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:text-primary-focus underline',
          target: '_blank',
          rel: 'nofollow noopener',
        },
        protocols: ['http', 'https', 'mailto'],
        validate: href => /^https?:\/\//.test(href),
      }),
      Typography,
    ],
    content: article.body,
    editable: false,
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none ${isDarkMode ? "prose-invert" : ""} prose-primary`,
        style: `font-size: ${fontSize}px`,
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    immediatelyRender: false,
  });

  const { data: commentsData, error: commentsError, isLoading } = useSWR(
    `${API_BASE_URL}/api/articles/${slug}/comments`,
    fetcher,
    {
      refreshInterval: 60000,
      fallbackData: { comments: [] },
      revalidateOnMount: true,
    }
  );

  const [comments, setComments] = useState<Comment[]>([]);
  const [topCommenters, setTopCommenters] = useState<
    { username: string; count: number }[]
  >([]);
  const hasShownCommentsErrorRef = useRef(false);

  const areCommentsEqual = useCallback((a: Comment[], b: Comment[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i]?.id !== b[i]?.id) return false;
    }
    return true;
  }, []);

  const buildTopCommenters = useCallback((commentsList: Comment[]) => {
    const commentCount: { [key: string]: number } = {};
    commentsList.forEach((comment: Comment) => {
      if (comment?.author?.username) {
        commentCount[comment.author.username] =
          (commentCount[comment.author.username] || 0) + 1;
      }
    });

    return Object.entries(commentCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([username, count]) => ({ username, count }));
  }, []);

  const showAlert = useCallback(
    (message: string, severity: "success" | "error") => {
      setAlert({ open: true, message, severity });
      setTimeout(() => setAlert((prev) => ({ ...prev, open: false })), 4000);
    },
    []
  );

  const debouncedSetFontSize = useDebounce(setFontSize, 300);

  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth <= 768);

    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setIsAuthenticated(true);
        setIsCurrentUserAuthor(decoded.username === article.author.name);
      } catch {
        setIsAuthenticated(false);
      }
    }

    const preferencesCookie = Cookies.get("userPreferences");
    try {
      const preferences =
        preferencesCookie && JSON.parse(decodeURIComponent(preferencesCookie));
      setIsDarkMode(preferences?.darkMode ?? true);
    } catch {
      setIsDarkMode(true);
    }

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleScroll = () => {
      const articleElement = document.querySelector("main");
      if (articleElement) {
        const { height } = articleElement.getBoundingClientRect();
        const progress = Math.min(
          Math.max((window.scrollY - articleElement.offsetTop) / (height - window.innerHeight), 0),
          1
        );
        setReadingProgress(progress * 100);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleResize();
    handleScroll();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [article.id, slug, article.author.name]);

  useEffect(() => {
    if (editor) {
      editor.view.dom.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize, editor]);

  useEffect(() => {
    if (commentsData) {
      const commentsArray = Array.isArray(commentsData)
        ? commentsData
        : commentsData.comments || [];
      setComments((prev) => {
        if (areCommentsEqual(prev, commentsArray)) return prev;
        return commentsArray;
      });

      const nextTopCommenters = buildTopCommenters(commentsArray);
      setTopCommenters((prev) => {
        if (prev.length === nextTopCommenters.length && prev.every((item, index) => item.username === nextTopCommenters[index]?.username && item.count === nextTopCommenters[index]?.count)) {
          return prev;
        }
        return nextTopCommenters;
      });
    }

    if (commentsError) {
      if (!hasShownCommentsErrorRef.current) {
        hasShownCommentsErrorRef.current = true;
        showAlert("ไม่สามารถโหลดความคิดเห็นได้", "error");
      }
    } else {
      hasShownCommentsErrorRef.current = false;
    }
  }, [commentsData, commentsError, showAlert, areCommentsEqual, buildTopCommenters]);

  const handleDownloadClick = useCallback(() => {
    const token = Cookies.get("token");
    if (!token) {
      showAlert("กรุณาเข้าสู่ระบบเพื่อดาวน์โหลด", "error");
      // Redirect to login page
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    setOpenDownloadDialog(true);
  }, [showAlert]);

  const handleFavorite = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return showAlert("กรุณาเข้าสู่ระบบเพื่อบันทึกบทความนี้", "error");

    const prevState = { isFavorited, favoritesCount };
    setIsFavorited(!isFavorited);
    setFavoritesCount(isFavorited ? favoritesCount - 1 : favoritesCount + 1);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/articles/${slug}/favorite`,
        {
          method: isFavorited ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({})
        }
      );
      if (!response.ok) throw new Error();
    } catch {
      setIsFavorited(prevState.isFavorited);
      setFavoritesCount(prevState.favoritesCount);
      showAlert("ไม่สามารถอัปเดตสถานะรายการโปรด", "error");
    }
  }, [isFavorited, favoritesCount, slug, showAlert]);

  const handleFollow = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return showAlert("กรุณาเข้าสู่ระบบเพื่อติดตามผู้เขียน", "error");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/profiles/${article.author.name}/follow`,
        {
          method: isFollowing ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({})
        }
      );
      if (response.ok) {
        setIsFollowing(!isFollowing);
        showAlert(
          isFollowing ? "เลิกติดตามผู้เขียน" : "ติดตามผู้เขียนแล้ว",
          "success"
        );
      } else {
        showAlert("ไม่สามารถอัปเดตสถานะการติดตาม", "error");
      }
    } catch {
      showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  }, [isFollowing, article.author.name, showAlert]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: article.title,
      text: article.description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      showAlert("คัดลอก URL บทความไปยังคลิปบอร์ดแล้ว", "success");
    } catch {
      showAlert("ไม่สามารถแชร์หรือคัดลอกลิงก์ได้", "error");
    }
  }, [article.title, article.description, showAlert]);

  const handleAddComment = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token || !newComment.trim())
      return showAlert("กรุณาเข้าสู่ระบบหรือกรอกความคิดเห็น", "error");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/articles/${slug}/comments`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ body: newComment }),
        }
      );
      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData.comment, ...comments]);
        setNewComment("");
        showAlert("เพิ่มความคิดเห็นสำเร็จ", "success");
        mutate(`${API_BASE_URL}/api/articles/${slug}/comments`);
      } else {
        showAlert("ไม่สามารถเพิ่มความคิดเห็น", "error");
      }
    } catch {
      showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  }, [newComment, comments, slug, showAlert]);

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      const token = Cookies.get("token");
      if (!token) return showAlert("กรุณาเข้าสู่ระบบเพื่อลบความคิดเห็น", "error");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/articles/${slug}/comments/${commentId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          setComments(comments.filter((comment) => comment.id !== commentId));
          showAlert("ลบความคิดเห็นสำเร็จ", "success");
          mutate(`${API_BASE_URL}/api/articles/${slug}/comments`);
        } else {
          showAlert("ไม่สามารถลบความคิดเห็น", "error");
        }
      } catch {
        showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
      }
    },
    [comments, slug, showAlert]
  );

  const handleOpenDownload = useCallback((item: DownloadFile | TranslationFile) => {
    const url = "url" in item ? item.url : item.fileUrl;
    window.open(url, "_blank");
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const encodeURLComponent = (value: string | undefined | null) => {
    if (typeof value !== 'string') {
      return '';
    }
    return encodeURIComponent(value.trim()).replace(/%20/g, "%20").replace(/\//g, "%2F");
  };

  const wordCount = article.body.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  if (!isClient) return <Skeleton height={400} containerClassName="min-h-screen bg-background" />;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-muted text-foreground" : "bg-muted text-foreground"
      }`}
    >
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        {alert.open && (
          <CustomArticleAlert
            title={alert.severity === "success" ? t("success") : t("error")}
            message={alert.message}
            variant={alert.severity === "success" ? "default" : "destructive"}
          />
        )}

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {t("readingTime", { time: readingTime })}
          </span>
          <div className="flex items-center space-x-4">
            <label className="flex items-center gap-2">
              {t("fontSize")}:
              <input
                type="range"
                min="14"
                max="20"
                value={fontSize}
                onChange={(e) => debouncedSetFontSize(Number(e.target.value))}
                className="w-24"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_280px] gap-6">
          <SidebarLeft
            article={article}
            topCommenters={topCommenters}
            isDarkBackground={isDarkMode}
          />

          <main className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent>
                  <ArticleTitleMeta article={article} isDarkMode={isDarkMode} />

                  <div className="mb-6">
                    <EditorContent editor={editor} />
                  </div>

                  <InteractionBar
                    isCurrentUserAuthor={isCurrentUserAuthor}
                    isFollowing={isFollowing}
                    handleFollow={handleFollow}
                    isFavorited={isFavorited}
                    favoritesCount={favoritesCount}
                    handleFavorite={handleFavorite}
                    handleShare={handleShare}
                    isDarkBackground={isDarkMode}
                  />

                  {commentsError && (
                    <Alert variant="destructive">
                      {t("commentsLoadError")}{" "}
                      <Button
                        onClick={() =>
                          mutate(`${API_BASE_URL}/api/articles/${slug}/comments`)
                        }
                        variant="link"
                      >
                        {t("tryAgain")}
                      </Button>
                    </Alert>
                  )}

                  <CommentsSection
                    isAuthenticated={isAuthenticated}
                    isDarkBackground={isDarkMode}
                    comments={comments}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    handleAddComment={handleAddComment}
                    isCurrentUserAuthor={isCurrentUserAuthor}
                    handleDeleteComment={handleDeleteComment}
                    formatDate={formatDate}
                    commentInputRef={commentInputRef}
                    isLoading={isLoading && comments.length === 0}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </main>

          <ArticleInfoSidebar
            article={article}
            isCurrentUserAuthor={isCurrentUserAuthor}
            isFollowing={isFollowing}
            handleFollow={handleFollow}
            isFavorited={isFavorited}
            handleFavorite={handleFavorite}
            formatDate={formatDate}
            translationFiles={[]}
            setOpenDownloadDialog={handleDownloadClick}
            isDarkBackground={isDarkMode}
            downloads={downloads}
            encodeURLComponent={encodeURLComponent}
          />
        </div>
      </div>

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
    </div>
  );
};

export default ArticleContent;