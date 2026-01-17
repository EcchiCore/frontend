"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { mutate } from "swr";
import { useAppSelector } from "@/store/hooks";
import DOMPurify from "dompurify";

import CustomArticleAlert from "./Alert";
import { Alert } from "@/components/ui/alert";
import SidebarLeft from "./SidebarLeft";
import InteractionBar from "./InteractionBar";
import CommentsSection from "./CommentsSection";
import ArticleInfoSidebar from "./ArticleInfoSidebar";
import ArticleTitleMeta from "./ArticleTitleMeta";
import { Article } from "@/types/article";
import { DownloadFile } from "./Interfaces";
import { useArticleInteractions } from "./hooks/useArticleInteractions";
import { useArticleComments } from "./hooks/useArticleComments";
import { useArticleSettings } from "./hooks/useArticleSettings";
import { useDownloadDialog } from "./hooks/useDownloadDialog";
import ArticleDownloadDialog from "./ArticleDownloadDialog";
import RelatedArticles from "./RelatedArticles";
import { Button, Card, CardContent } from "@/components/ui";
import { useTranslations } from 'next-intl';
import type { ArticleListItem } from '@chanomhub/sdk';

// Lazy load Framer Motion for animations (optional enhancement)
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false, loading: () => <div /> }
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ArticleContentProps {
  article: Article;
  slug: string;
  articleId?: number;
  downloads: DownloadFile[];
  relatedArticles?: ArticleListItem[];
}

const ArticleContent: React.FC<ArticleContentProps> = ({
  article,
  slug,
  downloads,
  relatedArticles = [],
}) => {
  const t = useTranslations('ArticleContent');
  const {
    isFavorited,
    favoritesCount,
    isFollowing,
    alert,
    handleFavorite,
    handleFollow,
    handleShare,
    showAlert,
  } = useArticleInteractions(article, slug);
  const {
    comments,
    newComment,
    setNewComment,
    topCommenters,
    commentsError,
    isLoading,
    handleAddComment,
    handleDeleteComment,
  } = useArticleComments(slug, showAlert);
  const {
    isClient,
    isMobile,
    isDarkMode,
    readingProgress,
    fontSize,
    debouncedSetFontSize,
  } = useArticleSettings(article.id);
  const {
    openDownloadDialog,
    setOpenDownloadDialog,
  } = useDownloadDialog(downloads, showAlert);
  // Essential state
  // Auth state from Redux
  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = isClient && !!user;
  const isCurrentUserAuthor = isClient && !!user && user?.username === article.author?.name;
  const handleDownloadClick = () => {
    setOpenDownloadDialog(true);
  };
  // Sanitize HTML content for security (DOMPurify is already a project dependency)
  const sanitizedBody = typeof window !== 'undefined'
    ? DOMPurify.sanitize(article.body, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 's', 'del',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
        'a', 'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'hr'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style',
        'width', 'height', 'colspan', 'rowspan'
      ],
      ALLOW_DATA_ATTR: false,
    })
    : article.body; // SSR: render as-is, client will sanitize on hydration
  const wordCount = article.body.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Hide SSR content when client is ready to prevent CLS
  useEffect(() => {
    // Set data attribute to hide SSR content via CSS
    document.documentElement.setAttribute('data-ssr-hidden', 'true');
    return () => {
      document.documentElement.removeAttribute('data-ssr-hidden');
    };
  }, []);

  // No longer returning skeleton - SSR content is rendered by ArticleBodyServer
  // This component hydrates on client side

  return (
    <div
      className={`client-article-loaded min-h-screen ${isDarkMode ? "bg-muted text-foreground" : "bg-muted text-foreground"
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
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent>
                  <ArticleTitleMeta
                    article={article}
                    isDarkMode={isDarkMode}
                  />

                  {/* Lightweight HTML renderer - replaces heavy Tiptap editor */}
                  <div
                    className={`prose prose-lg max-w-none mb-6 ${isDarkMode ? "prose-invert" : ""} prose-primary
                      prose-headings:mb-4 prose-headings:font-bold
                      prose-p:mb-4
                      prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                      prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:my-4
                      prose-table:border-collapse prose-table:w-full prose-table:my-4
                      prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-bold prose-th:bg-muted
                      prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2`}
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                  />

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
                    isLoading={isLoading && comments.length === 0}
                  />
                </CardContent>
              </Card>
            </MotionDiv>
          </main>

          <ArticleInfoSidebar
            article={article}
            isCurrentUserAuthor={isCurrentUserAuthor}
            isFollowing={isFollowing}
            handleFollow={handleFollow}
            isFavorited={isFavorited}
            handleFavorite={handleFavorite}
            setOpenDownloadDialog={handleDownloadClick}
            isDarkBackground={isDarkMode}
            downloads={downloads}
            translationFiles={[]} // Temporarily pass an empty array to resolve type error
          />
        </div>

        {/* Related Articles - Outside main content grid */}
        <RelatedArticles
          articles={relatedArticles}
          currentArticleId={article.id}
        />
      </div>

      <ArticleDownloadDialog
        article={article}
        downloads={downloads}
        showAlert={showAlert}
        openDownloadDialog={openDownloadDialog}
        setOpenDownloadDialog={setOpenDownloadDialog}
        isMobile={isMobile}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ArticleContent;