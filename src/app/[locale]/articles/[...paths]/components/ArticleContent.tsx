"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { mutate } from "swr";
import { useAppSelector } from "@/store/hooks";
// DOMPurify is lazy-loaded below to reduce initial bundle size (~60KB)

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
import { useViewHistory } from "./hooks/useViewHistory";
import ArticleDownloadDialog from "./ArticleDownloadDialog";
import RelatedArticles from "./RelatedArticles";
import { Button, Card, CardContent } from "@/components/ui";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
// import ArticleModsSection from "./ArticleModsSection"; // Removed
import ArticleCommunityTabs from "./ArticleCommunityTabs";
import { useTranslations } from 'next-intl';
import type { ArticleListItem } from '@chanomhub/sdk';



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
  // Lazy-load DOMPurify to reduce initial bundle size
  const [sanitizedBody, setSanitizedBody] = React.useState(article.body);
  useEffect(() => {
    import('dompurify').then(({ default: DOMPurify }) => {
      setSanitizedBody(DOMPurify.sanitize(article.body, {
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
      }));
    });
  }, [article.body]);
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

  // Track viewed tags for personalized recommendations
  const { recordView, getPreferredTags } = useViewHistory();

  useEffect(() => {
    // Record this article's tags to user's view history
    const tagNames = article.tags?.map(t => t.name) || [];
    if (tagNames.length > 0) {
      recordView(tagNames);
    }
  }, [article.id, article.tags, recordView]);

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

      <div className="container mx-auto px-4 py-6 md:py-8">

        {/* Utility Bar: Tabs + Reading Time & Font Size */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 text-sm text-muted-foreground bg-card/50 p-2 rounded-lg border sticky top-[60px] z-40 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <ArticleCommunityTabs
            slug={slug}
            commentCount={comments?.length}
            variant="inline"
            className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0"
          />

          <div className="flex items-center gap-4 bg-muted/50 p-1.5 rounded-md self-end md:self-auto">
            <span className="text-xs whitespace-nowrap px-2">{t("readingTime", { time: readingTime })}</span>
            <div className="w-px h-4 bg-border"></div>
            <label className="flex items-center gap-2 text-xs pr-2">
              <span className="hidden sm:inline">{t("fontSize")}:</span>
              <span className="sm:hidden">AA:</span>
              <input
                type="range"
                min="14"
                max="20"
                value={fontSize}
                onChange={(e) => debouncedSetFontSize(Number(e.target.value))}
                className="w-20 accent-primary"
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
            <Card>
              <CardContent>
                <ArticleTitleMeta
                  article={article}
                  isDarkMode={isDarkMode}
                />

                {/* Original Sources Section */}
                {article.officialDownloadSources && article.officialDownloadSources.length > 0 && (
                  <div className="mb-8 mt-2 space-y-3">
                    {/* Only show the heading if there's more than 1 source, or just keep it simple. Let's keep it clean without a big heading, just the buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {article.officialDownloadSources.map((source, index) => (
                        <Link key={index} href={source.url} target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto flex-1">
                          <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-12 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <ExternalLink className="w-4 h-4 text-primary" />
                            <span className="font-medium">โหลดต้นฉบับ {source.name ? `(${source.name})` : ""}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lightweight HTML renderer */}
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

                {/* Mods Section Removed (Moved to Workshop Page) */}

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
            translationFiles={[]}
          />
        </div>

        {/* Related Articles */}
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
      {alert.open && (
        <CustomArticleAlert
          title={alert.severity === "success" ? t("success") : t("error")}
          message={alert.message}
          variant={alert.severity === "success" ? "default" : "destructive"}
        />
      )}
    </div>
  );
};

export default ArticleContent;