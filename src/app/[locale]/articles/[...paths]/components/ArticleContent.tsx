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
import { getImageUrl } from "@/lib/imageUrl";
import type { ArticleListItem } from '@chanomhub/sdk';
import ArticleDownloadSection from "./ArticleDownloadSection";

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
      className={`client-article-loaded min-h-screen relative overflow-x-hidden ${isDarkMode ? "bg-muted text-foreground" : "bg-muted text-foreground"
        }`}
    >
      {/* ── Background Hero Effect ────────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[600px] -z-10 pointer-events-none overflow-hidden opacity-50">
        <div className={`absolute inset-0 z-10 ${isDarkMode ? "bg-gradient-to-b from-transparent via-muted to-muted" : "bg-gradient-to-b from-transparent via-muted to-muted"}`} />
        {(() => {
          const bgImgUrl = getImageUrl(
            article.backgroundImage || article.coverImage || article.mainImage || null,
            "hero"
          );
          return bgImgUrl ? (
            <img
              src={bgImgUrl}
              className="w-full h-full object-cover blur-3xl scale-125 transition-opacity duration-1000"
              alt=""
            />
          ) : null;
        })()}
      </div>

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

        {/* ── Top Hero Banner ────────────────────────────────────── */}
        <div className="mb-8">
          <div className="w-full aspect-[21/9] sm:aspect-[25/9] lg:aspect-[32/10] rounded-2xl overflow-hidden border border-border/30 shadow-2xl bg-black/40 relative group">
            {(() => {
              const coverImgUrl = getImageUrl(
                article.coverImage || article.mainImage || article.backgroundImage || null,
                "hero"
              );

              return coverImgUrl ? (
                <>
                  {/* Blurred background for wide/narrow images */}
                  <img
                    src={coverImgUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-125"
                  />
                  {/* Main Hero Image - object-contain to preserve width */}
                  <img
                    src={coverImgUrl}
                    alt="Cover"
                    className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 text-6xl font-black">
                  {article.title.toUpperCase()}
                </div>
              );
            })()}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20" />

            {/* Quick Info Overlay on Banner */}
            <div className="absolute bottom-6 left-6 right-6 z-30 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {article.categories?.slice(0, 3).map((cat, i) => (
                    <span
                      key={i}
                      className="bg-blue-500 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg"
                    >
                      {cat.name}
                    </span>
                  ))}
                  {article.ver && (
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-white/20">
                      v{article.ver}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-2xl">
                  {article.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <main className="min-w-0 space-y-5">
            {/* Gallery Card */}
            <div className="rounded-2xl overflow-hidden border border-border/30 shadow-2xl bg-black/20">
              <ArticleTitleMeta
                article={article}
                isDarkMode={isDarkMode}
                hideHeader
              />
            </div>

            {/* ── Content card: title row + body ────────────────────── */}
            <Card className="overflow-hidden border border-border/30 shadow-xl">
              <CardContent className="p-5 sm:p-7">

                {/* Title row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                  <h1 className="text-2xl lg:text-3xl font-bold leading-tight flex-1">
                    {article.title}
                    {article.isPaid && (
                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                        PREMIUM
                      </span>
                    )}
                  </h1>
                  {(article as any).sequentialCode && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-primary/30 bg-primary/10 text-primary shrink-0 self-start">
                      <span className="text-primary/70">★</span>
                      {(article as any).sequentialCode}
                    </div>
                  )}
                </div>

                {/* Article Description */}
                {article.description && (
                  <div className="mb-6 p-5 rounded-xl bg-primary/5 border-l-4 border-primary italic text-muted-foreground leading-relaxed">
                    {article.description}
                  </div>
                )}

                {/* Video Preview */}
                <div className="mb-8 rounded-xl overflow-hidden bg-black aspect-video shadow-xl group relative border border-border/10">
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
                  <div className="mb-7 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {article.officialDownloadSources.map((source, index) => (
                        <a key={index} href={source.url} target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto flex-1">
                          <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-11 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all rounded-xl">
                            <ExternalLink className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{t('loadOriginal', { source: source.name ? `(${source.name})` : "" })}</span>
                          </Button>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article body */}
                <div
                  className={`prose prose-lg max-w-none mb-10 overflow-hidden break-words ${isDarkMode ? "prose-invert" : ""} prose-primary
                            prose-headings:mb-5 prose-headings:font-bold prose-headings:tracking-tight
                            prose-p:mb-5 prose-p:leading-relaxed prose-p:text-foreground/90
                            prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                            prose-img:max-w-full prose-img:h-auto prose-img:rounded-2xl prose-img:my-8 prose-img:shadow-2xl
                            prose-table:border-collapse prose-table:w-full prose-table:my-6
                            prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-bold prose-th:bg-muted/50
                            prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3`}
                  dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                />

                {/* Paid Article Section */}
                {article.isPaid && !article.isUnlocked && (
                  <div className={`mt-6 p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-5 text-center transition-all ${isDarkMode ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50/50 border-amber-200"
                    }`}>
                    <div className={`p-4 rounded-full ${isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"
                      }`}>
                      <Lock className="w-9 h-9" />
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
                      className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-amber-500/20 text-lg"
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
                  <div className="flex items-center gap-3 mb-10 p-4 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 shadow-sm">
                    <Unlock className="w-5 h-5" />
                    <span className="font-bold">{t('accessGranted')}</span>
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

                {/* Inline Downloads Section */}
                <ArticleDownloadSection
                  article={article}
                  downloads={downloads}
                  isDarkMode={isDarkMode}
                  handlePurchase={handlePurchase}
                  isPurchasing={isPurchasing}
                  showAlert={showAlert}
                />
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

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
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
