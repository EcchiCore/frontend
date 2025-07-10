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
import Heading from '@tiptap/extension-heading';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import ArticleHeader from "./ArticleHeader";
import Alert from "./Alert";
import SidebarLeft from "./SidebarLeft";
import InteractionBar from "./InteractionBar";
import CommentsSection from "./CommentsSection";
import SidebarRight from "./SidebarRight";
import DownloadModal from "./DownloadModal";
import ArticleTitleMeta from "./ArticleTitleMeta"; // Import the new component
import { Article, DownloadFile, TranslationFile, Comment, TokenPayload, AlertState } from "./Interfaces";
import myImageLoader from "../../../lib/imageLoader";
import { useDebounce } from "./Debounce";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";
import { TextAlign } from "@tiptap/extension-text-align";
import { useTranslations } from 'next-intl'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ArticleContentProps {
  article: Article;
  slug: string;
  downloads: DownloadFile[];
  isTranslated: boolean;
  translationInfo: { sourceLanguage: string; targetLanguage: string; } | null;
  hasTranslationError: boolean; // Add this line
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
  downloads: initialDownloads = [],
  isTranslated = false,
  translationInfo = null,
}) => {
  const t = useTranslations('ArticleContent');
  // Essential state
  const [isFavorited, setIsFavorited] = useState(article.favorited);
  const [favoritesCount, setFavoritesCount] = useState(article.favoritesCount);
  const [isFollowing, setIsFollowing] = useState(article.author.following);
  const [isCurrentUserAuthor, setIsCurrentUserAuthor] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ open: false, message: "", severity: "success" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [downloads, setDownloads] = useState<DownloadFile[]>(initialDownloads);
  const [translationFiles, setTranslationFiles] = useState<TranslationFile[]>([]);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Tiptap editor for content display
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
      }),

      // Support for text alignment (style="text-align: center")
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),

      // Text styling support
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

      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: 'mb-4 font-bold',
        },
      }),
    ],

    content: article.body,
    editable: false,

    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none ${
          isDarkMode ? "prose-invert" : ""
        } prose-primary`,
        style: `font-size: ${fontSize}px`,
      },
    },

    // Enhanced parsing options
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });


  const { data: commentsData, error: commentsError, isLoading } = useSWR(
    `${API_BASE_URL}/api/articles/${slug}/comments`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const [comments, setComments] = useState<Comment[]>([]);
  const [topCommenters, setTopCommenters] = useState<
    { username: string; count: number }[]
  >([]);

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
        setIsCurrentUserAuthor(decoded.username === article.author.username);
      } catch {
        setIsAuthenticated(false);
      }
    }

    // Set dark mode from preferences
    const preferencesCookie = Cookies.get("userPreferences");
    try {
      const preferences =
        preferencesCookie && JSON.parse(decodeURIComponent(preferencesCookie));
      setIsDarkMode(preferences?.darkMode ?? true);
    } catch {
      setIsDarkMode(true);
    }

    // Fetch downloads and translation files
    const fetchData = async (url: string, setter: (data: any) => void, errorMsg: string) => {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setter(data.links || data.translationFiles || []);
      } catch {
        showAlert(errorMsg, "error");
      }
    };

    fetchData(`${API_BASE_URL}/api/downloads/article/${article.id}`, setDownloads, t('download_error'));
    fetchData(`${API_BASE_URL}/api/translation-files/article/${slug}`, setTranslationFiles, t('translation_error'));

    // Event listeners
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleScroll = () => {
      const articleElement = document.querySelector("main");
      if (articleElement) {
        const { top, height } = articleElement.getBoundingClientRect();
        setReadingProgress(Math.min(Math.max((window.scrollY - top) / (height - window.innerHeight), 0), 1) * 100);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [article.id, slug, showAlert, article.author.username]);

  // Update editor font size
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
      setComments(commentsArray);

      const commentCount: { [key: string]: number } = {};
      commentsArray.forEach((comment: Comment) => {
        if (comment?.author?.username) {
          commentCount[comment.author.username] =
            (commentCount[comment.author.username] || 0) + 1;
        }
      });

      setTopCommenters(
        Object.entries(commentCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([username, count]) => ({ username, count }))
      );
    }

    if (commentsError) {
      showAlert("ไม่สามารถโหลดความคิดเห็นได้", "error");
    }
  }, [commentsData, commentsError, showAlert]);

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
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
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
        `${API_BASE_URL}/api/profiles/${article.author.username}/follow`,
        {
          method: isFollowing ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
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
  }, [isFollowing, article.author.username, showAlert]);

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

  const encodeURLComponent = (value: string) =>
    encodeURIComponent(value.trim()).replace(/%20/g, "%20").replace(/\//g, "%2F");
  const wordCount = article.body.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  if (!isClient) return <Skeleton height={400} containerClassName="min-h-screen bg-base-100" />;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-base-200 text-base-content" : "bg-base-200 text-base-content"
      }`}
    >
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-base-200 z-50">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <ArticleHeader
          isTranslated={isTranslated}
          translationInfo={translationInfo}
          slug={slug}
        />
        <Alert alert={alert} />

        {/* Reading Controls */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-base-content/70">
            เวลาอ่าน: {readingTime} นาที
          </span>
          <div className="flex items-center space-x-4">
            <label className="flex items-center gap-2">
              ขนาดตัวอักษร:
              <input
                type="range"
                min="14"
                max="20"
                value={fontSize}
                onChange={(e) => debouncedSetFontSize(Number(e.target.value))}
                className="range range-primary range-xs w-24"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_280px] gap-6">
          {isMobile ? (
            <>
              <main className="min-w-0">
                {/* Mobile Author Card */}
                <div className="md:hidden mb-6 card bg-base-100 shadow-xl">
                  <div className="card-body flex-row items-center gap-4">
                    <Image
                      loader={myImageLoader}
                      src={article.author.image}
                      alt={article.author.username}
                      width={48}
                      height={48}
                      className="avatar rounded-full"
                    />
                    <div>
                      <Link
                        href={`/profiles/${encodeURLComponent(
                          article.author.username
                        )}`}
                        className="text-lg font-semibold link link-hover link-primary"
                      >
                        {article.author.username}
                      </Link>
                      <p className="text-sm text-base-content/70 line-clamp-2">
                        {article.author.bio || "ยังไม่มีประวัติ"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="card bg-base-100 shadow-xl"
                >
                  <div className="card-body">
                    <ArticleTitleMeta article={article} isDarkMode={isDarkMode} />

                    {/* Tiptap Content */}
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
                      <div className="alert alert-error">
                        ไม่สามารถโหลดความคิดเห็นได้{" "}
                        <button
                          onClick={() =>
                            mutate(`${API_BASE_URL}/api/articles/${slug}/comments`)
                          }
                          className="link link-hover"
                        >
                          ลองใหม่
                        </button>
                      </div>
                    )}

                    <CommentsSection
                      isAuthenticated={isAuthenticated}
                      isDarkBackground={isDarkMode}
                      comments={commentsData?.comments || commentsData || []}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      handleAddComment={handleAddComment}
                      isCurrentUserAuthor={isCurrentUserAuthor}
                      handleDeleteComment={handleDeleteComment}
                      formatDate={(date) =>
                        new Date(date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      }
                      commentInputRef={commentInputRef}
                      isLoading={isLoading}
                    />
                  </div>
                </motion.div>

                {/* Mobile Download Button */}
                {(downloads.length > 0 || translationFiles.length > 0) && (
                  <div className="md:hidden mt-4 card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h3 className="card-title">ดาวน์โหลดและแปล</h3>
                      <button
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                        onClick={() => setOpenDownloadDialog(true)}
                      >
                        <CloudArrowDownIcon className="w-5 h-5" /> ดูไฟล์ (
                        {downloads.length + translationFiles.length})
                      </button>
                    </div>
                  </div>
                )}
              </main>

              <SidebarLeft
                article={article}
                topCommenters={topCommenters}
                isDarkBackground={isDarkMode}
              />
              <SidebarRight
                article={article}
                isCurrentUserAuthor={isCurrentUserAuthor}
                isFollowing={isFollowing}
                handleFollow={handleFollow}
                isFavorited={isFavorited}
                handleFavorite={handleFavorite}
                formatDate={(date) =>
                  new Date(date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }
                downloads={downloads}
                translationFiles={translationFiles}
                setOpenDownloadDialog={setOpenDownloadDialog}
                isDarkBackground={isDarkMode}
              />
            </>
          ) : (
            <>
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
                  className="card bg-base-100 shadow-xl"
                >
                  <div className="card-body">
                    <ArticleTitleMeta article={article} isDarkMode={isDarkMode} />

                    {/* Tiptap Content */}
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
                      <div className="alert alert-error">
                        ไม่สามารถโหลดความคิดเห็นได้{" "}
                        <button
                          onClick={() =>
                            mutate(`${API_BASE_URL}/api/articles/${slug}/comments`)
                          }
                          className="link link-hover"
                        >
                          ลองใหม่
                        </button>
                      </div>
                    )}

                    <CommentsSection
                      isAuthenticated={isAuthenticated}
                      isDarkBackground={isDarkMode}
                      comments={commentsData?.comments || commentsData || []}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      handleAddComment={handleAddComment}
                      isCurrentUserAuthor={isCurrentUserAuthor}
                      handleDeleteComment={handleDeleteComment}
                      formatDate={(date) =>
                        new Date(date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      }
                      commentInputRef={commentInputRef}
                      isLoading={isLoading}
                    />
                  </div>
                </motion.div>
              </main>

              <SidebarRight
                article={article}
                isCurrentUserAuthor={isCurrentUserAuthor}
                isFollowing={isFollowing}
                handleFollow={handleFollow}
                isFavorited={isFavorited}
                handleFavorite={handleFavorite}
                formatDate={(date) =>
                  new Date(date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }
                downloads={downloads}
                translationFiles={translationFiles}
                setOpenDownloadDialog={setOpenDownloadDialog}
                isDarkBackground={isDarkMode}
              />
            </>
          )}
        </div>
      </div>

      <DownloadModal
        openDownloadDialog={openDownloadDialog}
        setOpenDownloadDialog={setOpenDownloadDialog}
        downloads={downloads}
        translationFiles={translationFiles}
        handleOpenDownload={(item) => {
          const url = "url" in item ? item.url : item.fileUrl;
          window.open(url, "_blank");
        }}
        handleCopyLink={(url) => {
          navigator.clipboard.writeText(url).then(() => {
            setTimeout(() => {}, 2000);
          });
        }}
        copiedLink={null}
        formatDate={(date) =>
          new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        }
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ArticleContent;