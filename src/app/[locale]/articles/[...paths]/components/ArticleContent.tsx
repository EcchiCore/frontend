"use client";
import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion } from "framer-motion";
import { mutate } from "swr";
import { useAppSelector } from "@/store/hooks";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Link as TiptapLink } from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

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
import { Button, Card, CardContent } from "@/components/ui";
import { useTranslations } from 'next-intl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ArticleContentProps {
  article: Article;
  slug: string;
  articleId?: number;
  downloads: DownloadFile[];
}

const ArticleContent: React.FC<ArticleContentProps> = ({
  article,
  slug,
  downloads,
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
  } = useArticleInteractions(article);
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
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border px-4 py-2 text-left font-bold bg-muted',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border px-4 py-2',
        },
      }),
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
  const wordCount = article.body.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

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
            <motion.div
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
            setOpenDownloadDialog={handleDownloadClick}
            isDarkBackground={isDarkMode}
            downloads={downloads}
            translationFiles={[]} // Temporarily pass an empty array to resolve type error
          />
        </div>
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