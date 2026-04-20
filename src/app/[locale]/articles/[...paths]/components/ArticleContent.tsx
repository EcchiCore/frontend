"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { mutate } from "swr";
import { useAppSelector } from "@/store/hooks";
// DOMPurify is lazy-loaded below to reduce initial bundle size (~60KB)

import CustomArticleAlert from "./Alert";
import { Alert } from "@/components/ui/alert";
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
import { Button, Card, CardContent, Separator, Badge, Avatar, AvatarFallback } from "@/components/ui";
import { ExternalLink, Lock, Unlock, ShoppingCart, MessageCircle, Trophy, Medal, Award, Clock, ChevronRight } from "lucide-react";

import { getSdk } from "@/lib/sdk";
import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import Cookies from "js-cookie";
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
  } = useArticleSettings(article.id);
  const {
    openDownloadDialog,
    setOpenDownloadDialog,
  } = useDownloadDialog(downloads, showAlert);
  
  // Essential state
  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = isClient && !!user;
  const isCurrentUserAuthor = isClient && !!user && user?.username === article.author?.name;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  const handlePurchase = React.useCallback(async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/articles/${slug}`);
      return;
    }

    if (!article.id) return;

    try {
      setIsPurchasing(true);
      const sdk = await getSdk();
      const data = await sdk.checkout.purchaseArticle(Number(article.id), {
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      });

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      if (data.status === 'pending' || data.invoiceId) {
        showAlert(t("purchasePending") || "Invoice created. Please complete payment.", "success");
        return;
      }

      showAlert(t("purchaseSuccess") || "Purchase successful!", "success");
      mutate(`${API_BASE_URL}/api/graphql:ArticleWithDownloads:${slug}`);
      mutate(`${API_BASE_URL}/api/graphql:ArticleBySlug:${slug}`);

      setTimeout(() => {
        window.location.href = window.location.pathname;
      }, 1500);
    } catch (error: any) {
      showAlert(error.message || t("purchaseError"), "error");
    } finally {
      setIsPurchasing(false);
    }
  }, [isAuthenticated, article.id, slug, router, showAlert, t]);

  useEffect(() => {
    if (searchParams.get('purchase') === 'true' && article.isPaid && !article.isUnlocked) {
      handlePurchase();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (searchParams.get('purchase') === 'true' && article.isUnlocked) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, article.isPaid, article.isUnlocked, handlePurchase]);

  const handleDownloadClick = () => {
    setOpenDownloadDialog(true);
  };

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

  useEffect(() => {
    document.documentElement.setAttribute('data-ssr-hidden', 'true');
    return () => {
      document.documentElement.removeAttribute('data-ssr-hidden');
    };
  }, []);

  const { recordView } = useViewHistory();
  useEffect(() => {
    const tagNames = article.tags?.map(t => t.name) || [];
    if (tagNames.length > 0) {
      recordView(tagNames);
    }
  }, [article.id, article.tags, recordView]);

  const getRankingIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-3 h-3 text-yellow-500" />;
      case 1: return <Medal className="w-3 h-3 text-gray-500" />;
      case 2: return <Award className="w-3 h-3 text-amber-600" />;
      default: return <span className="text-xs font-bold">{index + 1}</span>;
    }
  };

  const getRankingColors = (index: number) => {
    switch (index) {
      case 0: return "from-yellow-400 to-orange-500";
      case 1: return "from-gray-300 to-gray-500";
      case 2: return "from-amber-600 to-amber-800";
      default: return "from-primary to-secondary";
    }
  };

  return (
    <div
      className={`client-article-loaded min-h-screen overflow-x-hidden ${isDarkMode ? "bg-muted text-foreground" : "bg-muted text-foreground"
        }`}
    >
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        
        {/* 1. Primary Navigation Tabs - Highest priority */}
        <div className="mb-4 border-b border-border/50">
          <ArticleCommunityTabs
            slug={slug}
            commentCount={comments?.length}
            variant="inline"
            className="w-full overflow-x-auto"
          />
        </div>

        {/* 2. Secondary Breadcrumbs - Sub-navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <Link href="/games" className="hover:text-primary transition-colors">
            All Games
          </Link>
          
          {article.categories?.[0] && (
            <>
              <ChevronRight className="w-3.5 h-3.5 opacity-30" />
              <Link 
                href={`/games?category=${encodeURIComponent(article.categories[0].name)}`}
                className="hover:text-primary transition-colors"
              >
                {article.categories[0].name}
              </Link>
            </>
          )}

          <ChevronRight className="w-3.5 h-3.5 opacity-30" />
          <Link href={`/articles/${article.slug}`} className="hover:text-primary transition-colors">
            {article.title}
          </Link>

          <div className="ml-auto flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity bg-muted px-2 py-0.5 rounded text-[9px] sm:text-[10px]">
            <Clock className="w-3 h-3" />
            <span>{t("readingTime", { time: readingTime })}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <main className="min-w-0 space-y-8">
            <Card className="overflow-hidden border-none shadow-xl">
              <CardContent className="p-0 sm:p-6 md:p-8">
                
                <ArticleTitleMeta
                  article={article}
                  isDarkMode={isDarkMode}
                />

                <div className="px-6 pb-8">
                  {/* Article Description */}
                  {article.description && (
                    <div className="mb-8 p-6 rounded-2xl bg-primary/5 border-l-4 border-primary italic text-muted-foreground text-lg leading-relaxed">
                      {article.description}
                    </div>
                  )}

                  {/* Video Preview */}
                  <div className="mb-10 rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl group relative border border-border/10">
                    <video
                      controls
                      className="w-full h-full"
                      preload="metadata"
                      poster={article.coverImage || article.mainImage || undefined}
                    >
                      <source
                        src="https://vidoes.chanomhub.com/file/Chanomhub-Vidoes/20-1-26_2.webm?Authorization=4_0051e50adc6bddd0000000001_01c1e6d3_f3aa13_acct_M803cRTXDpM8g_fqY8ZYrBjl__c="
                        type="video/webm"
                      />
                    </video>
                  </div>

                  {/* Original Sources Section */}
                  {article.officialDownloadSources && article.officialDownloadSources.length > 0 && (!article.isPaid || article.isUnlocked) && (
                    <div className="mb-10 space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {article.officialDownloadSources.map((source, index) => (
                          <a key={index} href={source.url} target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto flex-1">
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-12 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all rounded-xl">
                              <ExternalLink className="w-4 h-4 text-primary" />
                              <span className="font-semibold">{t('loadOriginal', { source: source.name ? `(${source.name})` : "" })}</span>
                            </Button>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lightweight HTML renderer */}
                  <div
                    className={`prose prose-lg max-w-none mb-12 overflow-hidden break-words ${isDarkMode ? "prose-invert" : ""} prose-primary
                              prose-headings:mb-6 prose-headings:font-bold prose-headings:tracking-tight
                              prose-p:mb-6 prose-p:leading-relaxed prose-p:text-foreground/90
                              prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                              prose-img:max-w-full prose-img:h-auto prose-img:rounded-2xl prose-img:my-10 prose-img:shadow-2xl
                              prose-table:border-collapse prose-table:w-full prose-table:my-6
                              prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-bold prose-th:bg-muted/50
                              prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3`}
                    dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                  />

                  {/* Paid Article Section */}
                  {article.isPaid && !article.isUnlocked && (
                    <div className={`mt-8 p-10 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-6 text-center transition-all ${isDarkMode ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50/50 border-amber-200"
                      }`}>
                      <div className={`p-5 rounded-full ${isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"
                        }`}>
                        <Lock className="w-10 h-10" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">{t('premiumContentTitle')}</h3>
                        <p className="text-muted-foreground max-w-md text-lg">
                          {Number(article.price || 0) > 0
                            ? t('unlockToReadWithPrice', { price: article.price || 0 })
                            : t('unlockToRead')}
                        </p>
                      </div>

                      <Button
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                        size="lg"
                        className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold h-16 px-10 rounded-2xl shadow-xl shadow-amber-500/20 text-lg"
                      >
                        {isPurchasing ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white" />
                        ) : (
                          <ShoppingCart className="w-6 h-6" />
                        )}
                        {Number(article.price || 0) > 0 ? `Unlock for ${article.price} CC` : 'Unlock Content'}
                      </Button>
                    </div>
                  )}

                  {article.isPaid && article.isUnlocked && (
                    <div className="flex items-center gap-3 mb-12 p-5 rounded-2xl bg-green-500/10 text-green-600 border border-green-500/20 shadow-sm">
                      <Unlock className="w-6 h-6" />
                      <span className="font-bold text-lg">{t('accessGranted')}</span>
                    </div>
                  )}

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
                </div>
              </CardContent>
            </Card>

            {/* Top Commenters Section */}
            {topCommenters.length > 0 && (
              <Card className="border-none shadow-lg bg-card/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-xl">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{t('topCommenters')}</h3>
                      <p className="text-sm text-muted-foreground">{t('topCommentersDesc')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topCommenters.map((commenter, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all group border border-border/50 hover:shadow-md"
                      >
                        <div className="relative">
                          <Avatar className={`h-14 w-14 bg-gradient-to-br ${getRankingColors(index)} shadow-lg`}>
                            <AvatarFallback className="font-bold text-white bg-transparent text-xl">
                              {commenter.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 w-7 h-7 bg-background rounded-full flex items-center justify-center shadow-md border border-border">
                            {getRankingIcon(index)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                            {commenter.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t('commentsCount', { count: commenter.count })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
          </main>

          <aside className="space-y-6">
            <ArticleInfoSidebar
              article={article}
              isCurrentUserAuthor={isCurrentUserAuthor}
              isFollowing={isFollowing}
              handleFollow={handleFollow}
              isFavorited={isFavorited}
              handleFavorite={handleFavorite}
              setOpenDownloadDialog={handleDownloadClick}
              handlePurchase={handlePurchase}
              isPurchasing={isPurchasing}
              isDarkBackground={isDarkMode}
              downloads={downloads}
              translationFiles={[]}
            />
          </aside>
        </div>

        <div className="mt-16">
          <Separator className="mb-12 opacity-50" />
          <RelatedArticles
            articles={relatedArticles}
            currentArticleId={article.id}
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