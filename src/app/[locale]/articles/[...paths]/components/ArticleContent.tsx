"use client";
import React, { useEffect, useState } from "react";
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
import { ExternalLink, Lock, Unlock, ShoppingCart, MessageCircle, Trophy, Medal, Award, Clock, ChevronRight, Plus, Star, ChevronLeft, X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from "lucide-react";

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

  const initialPlatform = article.platforms?.[0]?.name?.toLowerCase() || "";
  const [activePlatform, setActivePlatform] = React.useState<string>(initialPlatform);
  const [showAllTags, setShowAllTags] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && article.platforms) {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const articlePlatforms = article.platforms.map(p => p.name.toLowerCase());
      
      let detected = "";
      if (userAgent.includes("win") && articlePlatforms.includes("windows")) {
        detected = "windows";
      } else if (userAgent.includes("mac") && articlePlatforms.includes("macos")) {
        detected = "macos";
      } else if (userAgent.includes("linux") && articlePlatforms.includes("linux")) {
        detected = "linux";
      } else if ((userAgent.includes("android") || userAgent.includes("mobile")) && (articlePlatforms.includes("android") || articlePlatforms.includes("apk") || articlePlatforms.includes("mobile"))) {
        detected = articlePlatforms.find(p => ["android", "apk", "mobile"].includes(p)) || "";
      }
      
      if (detected) {
        setActivePlatform(detected);
      }
    }
  }, [article.platforms]);

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

  const getRankingColors = (index: number) => {
    switch (index) {
      case 0: return "from-yellow-400 to-orange-500";
      case 1: return "from-gray-300 to-gray-500";
      case 2: return "from-amber-600 to-amber-800";
      default: return "from-primary to-secondary";
    }
  };

  // ── Assemble media slides ──
  const slides: { type: "video" | "image"; url: string }[] = [];
  
  // Video preview (default slide)
  slides.push({
    type: "video",
    url: "https://vidoes.chanomhub.com/file/Chanomhub-Vidoes/20-1-26_2.webm?Authorization=4_0051e50adc6bddd0000000001_01c1e6d3_f3aa13_acct_M803cRTXDpM8g_fqY8ZYrBjl__c="
  });

  if (article.mainImage) {
    slides.push({ type: "image", url: getImageUrl(article.mainImage, "hero") || article.mainImage });
  }

  if (article.coverImage) {
    const coverUrl = getImageUrl(article.coverImage, "hero") || article.coverImage;
    if (!slides.some(s => s.url === coverUrl)) {
      slides.push({ type: "image", url: coverUrl });
    }
  }

  if (article.backgroundImage) {
    const bgUrl = getImageUrl(article.backgroundImage, "hero") || article.backgroundImage;
    if (!slides.some(s => s.url === bgUrl)) {
      slides.push({ type: "image", url: bgUrl });
    }
  }

  if (article.images && article.images.length > 0) {
    article.images.forEach((img) => {
      const fullUrl = getImageUrl(img.url, "hero") || img.url;
      if (fullUrl && !slides.some(s => s.url === fullUrl)) {
        slides.push({ type: "image", url: fullUrl });
      }
    });
  }

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState<{ type: "video" | "image"; url: string }>(
    slides[0] || { type: "image", url: "/placeholder-image.png" }
  );

  // ── Fullscreen Modal Gallery States ──
  const imageSlides = slides.filter(s => s.type === "image");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleImageClick = () => {
    if (activeSlide.type === "image") {
      const idx = imageSlides.findIndex(s => s.url === activeSlide.url);
      if (idx !== -1) {
        setModalImageIndex(idx);
        setIsModalOpen(true);
        setZoomLevel(1);
      }
    }
  };

  const nextImage = () => {
    if (imageSlides.length === 0) return;
    setModalImageIndex(prev => (prev < imageSlides.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  };

  const prevImage = () => {
    if (imageSlides.length === 0) return;
    setModalImageIndex(prev => (prev > 0 ? prev - 1 : imageSlides.length - 1));
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  const resetZoom = () => setZoomLevel(1);

  const downloadImage = async () => {
    if (imageSlides.length === 0) return;
    const imageUrl = imageSlides[modalImageIndex].url;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${article.title}-image-${modalImageIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
      else if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, modalImageIndex]);

  return (
    <div className="client-article-loaded min-h-screen bg-background text-foreground pb-16 font-sans relative overflow-x-hidden">
      
      {/* ── Background Hero Effect (Ambient Glow using design system variables) ────────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[600px] -z-10 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-background to-background" />
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

      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-20">

        {/* ── Steam Style Tab Links (Game Page / Share Images / Discussions / Mods - Placed above Breadcrumbs) ── */}
        <div className="mb-4 border-b border-border flex items-center justify-between">
          <ArticleCommunityTabs
            slug={slug}
            commentCount={comments?.length}
            variant="inline"
            className="w-full overflow-x-auto border-none bg-transparent"
          />
        </div>

        {/* ── 1. Breadcrumbs ── */}
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Link href="/games" className="hover:text-foreground transition-colors">
            All Games
          </Link>
          {article.categories?.[0] && (
            <>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 text-muted-foreground" />
              <Link
                href={`/games?category=${encodeURIComponent(article.categories[0].name)}`}
                className="hover:text-foreground transition-colors"
              >
                {article.categories[0].name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 opacity-40 text-muted-foreground" />
          <span className="text-primary truncate max-w-[200px] sm:max-w-none">{article.title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-wide mb-5 drop-shadow-sm">
          {article.title}
        </h1>

        {/* ── 2. Showcase Block (Split View) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 bg-card border border-border p-4 sm:p-5 rounded-lg shadow-xl mb-6">
          
          {/* Left Column: Media Slider */}
          <div className="flex flex-col min-w-0">
            {/* Active Display Panel */}
            <div 
              onClick={() => activeSlide.type === "image" && handleImageClick()}
              className={`relative w-full aspect-video bg-black/60 border border-border rounded-sm overflow-hidden flex items-center justify-center ${activeSlide.type === "image" ? "cursor-pointer group/active" : ""}`}
            >
              {activeSlide.type === "video" ? (
                <video
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                  poster={getImageUrl(article.coverImage || article.mainImage || null, "hero") || undefined}
                >
                  <source src={activeSlide.url} type="video/webm" />
                </video>
              ) : (
                <>
                  <img
                    src={activeSlide.url}
                    alt={`${article.title} Media`}
                    className="w-full h-full object-contain select-none transition-transform duration-300 group-hover/active:scale-[1.01]"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 text-white p-2 rounded-sm opacity-0 group-hover/active:opacity-100 transition-opacity duration-200">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails list */}
            {slides.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1 [scrollbar-width:thin] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {slides.map((slide, idx) => {
                  const isActive = idx === activeSlideIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveSlideIndex(idx);
                        setActiveSlide(slide);
                      }}
                      className={`relative w-20 aspect-video rounded-sm overflow-hidden shrink-0 border transition-all duration-200 ${
                        isActive 
                          ? "border-primary opacity-100 ring-1 ring-primary/50" 
                          : "border-border/60 opacity-60 hover:opacity-100 hover:border-primary/50"
                      }`}
                    >
                      {slide.type === "video" ? (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-[9px] text-primary font-bold">
                          ▶ VIDEO
                        </div>
                      ) : (
                        <img src={slide.url} alt="thumb" className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Capsule Info Card */}
          <div className="flex flex-col justify-between h-full gap-4 text-xs">
            {/* Top capsule thumbnail image */}
            <div className="relative w-full h-[150px] bg-muted border border-border rounded-sm overflow-hidden shadow-inner">
              <img
                src={getImageUrl(article.coverImage || article.mainImage || article.backgroundImage, "hero") || "/placeholder-image.png"}
                alt="Game Capsule"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="text-muted-foreground leading-relaxed line-clamp-3 text-[11px] px-1 italic">
              {article.description || "สัมผัสประสบการณ์การเล่นและการใช้งานม็อดสุดเจ๋งที่รวบรวมไว้สำหรับคุณโดยเฉพาะ..."}
            </div>

            {/* Metadata details */}
            <div className="space-y-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
              <div className="flex justify-between items-center px-1">
                <span className="uppercase">รีวิวทั้งหมด:</span>
                <span className="text-primary font-bold hover:underline cursor-pointer">
                  เป็นบวกอย่างยิ่ง ({favoritesCount} favorites)
                </span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="uppercase">วันวางจำหน่าย:</span>
                <span className="text-foreground font-medium">
                  {new Date(article.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="uppercase">ผู้พัฒนา:</span>
                <span className="text-primary hover:underline cursor-pointer">
                  {article.creators && article.creators.length > 0
                    ? article.creators.map((c) => c.name).join(", ")
                    : ""}
                </span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="uppercase">ผู้เผยแพร่:</span>
                <span className="text-primary hover:underline cursor-pointer">
                  {article.author?.name || "AdminChanom"}
                </span>
              </div>
            </div>

            {/* Popular tags box */}
            <div className="border-t border-border pt-3">
              <span className="text-[10px] text-muted-foreground block mb-1.5 uppercase font-semibold">แท็กยอดนิยมสำหรับเกมนี้:</span>
              <div className="flex flex-wrap gap-1">
                {(showAllTags ? article.tags : article.tags?.slice(0, 4))?.map((tag, idx) => (
                  <Link
                    key={idx}
                    href={`/games?tag=${encodeURIComponent(tag.name)}`}
                    className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-sm transition-colors border border-primary/20"
                  >
                    {tag.name}
                  </Link>
                ))}
                {article.tags && article.tags.length > 4 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-[10px] px-2 py-0.5 rounded-sm transition-colors border border-border cursor-pointer font-semibold"
                  >
                    {showAllTags ? "แสดงน้อยลง" : `+ แสดงทั้งหมด (${article.tags.length})`}
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* ── 4. Purchase/Download Banner ── */}
        <div className="mb-8 bg-card border border-border p-4 sm:p-5 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-wide">
              {article.isPaid && !article.isUnlocked ? `ปลดล็อกเนื้อหาพรีเมียม ${article.title}` : `ดาวน์โหลด/เล่น ${article.title}`}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {article.ver && (
                <span className="bg-muted border border-border text-foreground px-2 py-0.5 rounded-sm">
                  เวอร์ชัน: v{article.ver}
                </span>
              )}
              {article.platforms?.map((plat, idx) => (
                <span key={idx} className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-sm font-medium">
                  {plat.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center shrink-0 self-end sm:self-center">
            {article.isPaid && !article.isUnlocked ? (
              <div className="bg-background border border-border rounded-md p-1 flex items-center gap-3">
                <span className="text-sm font-bold text-amber-500 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-sm">
                  {article.price} CC
                </span>
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-sm px-6 h-10 shadow-md transition-all text-sm"
                >
                  {isPurchasing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      ปลดล็อกเนื้อหา
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-md p-1 flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-semibold px-3 uppercase">
                  ฟรีดาวน์โหลด
                </span>
                <Button
                  onClick={handleDownloadClick}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-sm px-6 h-10 shadow-md transition-all text-sm flex items-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  ดาวน์โหลด/เล่นทันที
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── 5. Main Content Columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          
          {/* Left Column: About & Reviews */}
          <main className="min-w-0 space-y-6">
            
            {/* About This Game Card */}
            <Card className="border border-border bg-card rounded-lg p-5 sm:p-7 shadow-lg">
              <CardContent className="p-0 space-y-6">
                
                {/* Title */}
                <div className="border-b border-border pb-3 mb-5">
                  <h2 className="text-base sm:text-lg font-bold text-foreground uppercase tracking-wider">
                    ABOUT THIS GAME (เกี่ยวกับเกมนี้)
                  </h2>
                </div>

                {/* Description Preview block */}
                {article.description && (
                  <div className="mb-6 p-4 rounded-sm bg-muted/50 border-l-4 border-primary text-xs text-muted-foreground leading-relaxed italic">
                    {article.description}
                  </div>
                )}

                {/* Body Content */}
                <div
                  className={`prose prose-lg max-w-none text-muted-foreground prose-invert prose-primary
                            prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-6 prose-headings:mb-3
                            prose-h2:text-base prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-2
                            prose-p:mb-4 prose-p:leading-relaxed prose-p:text-xs prose-p:text-muted-foreground
                            prose-a:text-primary prose-a:underline hover:prose-a:text-primary/85
                            prose-img:max-w-full prose-img:h-auto prose-img:rounded-md prose-img:my-6 prose-img:border prose-img:border-border
                            prose-table:border-collapse prose-table:w-full prose-table:my-5 prose-table:text-xs
                            prose-th:border prose-th:border-border/60 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:bg-muted/50
                            prose-td:border prose-td:border-border/40 prose-td:px-3 prose-td:py-2`}
                  dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                />

                {/* Original Sources Section */}
                {article.officialDownloadSources && article.officialDownloadSources.length > 0 && (!article.isPaid || article.isUnlocked) && (
                  <div className="pt-6 border-t border-border/30 space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ลิงก์ดาวน์โหลดต้นทาง (Official Sources)</h4>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {article.officialDownloadSources.map((source, index) => (
                        <a key={index} href={source.url} target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto flex-1">
                          <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-10 border-border hover:bg-muted transition-all rounded-sm text-xs text-foreground">
                            <ExternalLink className="w-3.5 h-3.5 text-primary" />
                            <span className="font-semibold">{t('loadOriginal', { source: source.name ? `(${source.name})` : "" })}</span>
                          </Button>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Requirements Block */}
            {(() => {
              const platforms = article.platforms?.map(p => p.name.toLowerCase()) || [];
              if (platforms.length === 0) return null;

              let selectedPlatform = platforms[0];
              if (activePlatform && platforms.includes(activePlatform)) {
                selectedPlatform = activePlatform;
              } else if (platforms.length > 0) {
                if (platforms.includes("windows")) selectedPlatform = "windows";
                else if (platforms.includes("macos")) selectedPlatform = "macos";
                else if (platforms.includes("linux")) selectedPlatform = "linux";
                else if (platforms.some(p => ["android", "apk", "mobile"].includes(p))) {
                  selectedPlatform = platforms.find(p => ["android", "apk", "mobile"].includes(p)) || platforms[0];
                }
              }

              return (
                <Card className="border border-border bg-card rounded-lg p-5 sm:p-7 shadow-lg text-xs text-muted-foreground">
                  <div className="border-b border-border pb-3 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
                      SYSTEM REQUIREMENTS (ความต้องการระบบ)
                    </h3>
                    {platforms.length > 1 && (
                      <div className="flex gap-1 bg-muted p-0.5 rounded-sm border border-border">
                        {platforms.map(p => {
                          const displayLabel = p === "windows" ? "Windows" :
                                               p === "macos" ? "macOS" :
                                               p === "linux" ? "SteamOS + Linux" :
                                               ["android", "apk", "mobile"].includes(p) ? "Android" : p.toUpperCase();
                          return (
                            <button
                              key={p}
                              onClick={() => setActivePlatform(p)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                                selectedPlatform === p 
                                  ? "bg-background text-primary shadow-sm border border-border" 
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {displayLabel}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    {selectedPlatform === "windows" && (
                      <div className="space-y-2 text-muted-foreground">
                        <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wide border-b border-border/50 pb-1 mb-2">WINDOWS:</h4>
                        <p><span className="text-muted-foreground/60">OS:</span> Windows 10/11 (64-bit)</p>
                        <p><span className="text-muted-foreground/60">Processor:</span> Dual Core CPU 2.0 GHz หรือรุ่นที่เทียบเท่า</p>
                        <p><span className="text-muted-foreground/60">Memory:</span> 4 GB RAM</p>
                        <p><span className="text-muted-foreground/60">Graphics:</span> DirectX 10 Compatible GPU</p>
                        <p><span className="text-muted-foreground/60">Storage:</span> 2 GB พื้นที่ว่างที่พร้อมใช้งาน</p>
                      </div>
                    )}
                    {["android", "apk", "mobile"].includes(selectedPlatform) && (
                      <div className="space-y-2 text-muted-foreground">
                        <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wide border-b border-border/50 pb-1 mb-2">ANDROID (APK):</h4>
                        <p><span className="text-muted-foreground/60">OS:</span> Android 9.0 ขึ้นไป</p>
                        <p><span className="text-muted-foreground/60">Processor:</span> Octa-core CPU 1.8 GHz ขึ้นไป</p>
                        <p><span className="text-muted-foreground/60">Memory:</span> 3 GB RAM</p>
                        <p><span className="text-muted-foreground/60">Storage:</span> 2 GB พื้นที่ว่างที่พร้อมใช้งาน</p>
                      </div>
                    )}
                    {selectedPlatform === "macos" && (
                      <div className="space-y-2 text-muted-foreground">
                        <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wide border-b border-border/50 pb-1 mb-2">MACOS:</h4>
                        <p><span className="text-muted-foreground/60">OS:</span> macOS 10.15 ขึ้นไป</p>
                        <p><span className="text-muted-foreground/60">Processor:</span> Apple M1 หรือ Intel Core i5</p>
                        <p><span className="text-muted-foreground/60">Memory:</span> 4 GB RAM</p>
                        <p><span className="text-muted-foreground/60">Storage:</span> 2 GB พื้นที่ว่างที่พร้อมใช้งาน</p>
                      </div>
                    )}
                    {selectedPlatform === "linux" && (
                      <div className="space-y-2 text-muted-foreground">
                        <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wide border-b border-border/50 pb-1 mb-2">LINUX:</h4>
                        <p><span className="text-muted-foreground/60">OS:</span> Ubuntu 20.04 ขึ้นไป หรือเทียบเท่า</p>
                        <p><span className="text-muted-foreground/60">Processor:</span> Intel Core i5 หรือ AMD equivalent</p>
                        <p><span className="text-muted-foreground/60">Memory:</span> 4 GB RAM</p>
                        <p><span className="text-muted-foreground/60">Storage:</span> 2 GB พื้นที่ว่างที่พร้อมใช้งาน</p>
                      </div>
                    )}
                    {!["windows", "android", "apk", "mobile", "macos", "linux"].includes(selectedPlatform) && (
                      <div className="space-y-2 text-muted-foreground">
                        <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wide border-b border-border/50 pb-1 mb-2">{selectedPlatform.toUpperCase()}:</h4>
                        <p><span className="text-muted-foreground/60">OS:</span> Windows 10/11 หรือ Android 9.0 หรือเทียบเท่า</p>
                        <p><span className="text-muted-foreground/60">Processor:</span> Dual Core CPU 2.0 GHz ขึ้นไป</p>
                        <p><span className="text-muted-foreground/60">Memory:</span> 4 GB RAM</p>
                        <p><span className="text-muted-foreground/60">Storage:</span> 2 GB พื้นที่ว่างที่พร้อมใช้งาน</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })()}


          </main>

          {/* Right Column: Game Info Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start text-muted-foreground w-full">
            {/* Wishlist / Follow / Share Card */}
            <div className="bg-card border border-border p-4 rounded-lg shadow-lg space-y-2">
              <Button
                variant={isFavorited ? "destructive" : "outline"}
                className="w-full flex items-center justify-center gap-2 rounded-md text-xs font-semibold h-9"
                onClick={handleFavorite}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "บุ๊คมาร์กแล้ว" : "เพิ่มในรายการโปรด"}
              </Button>

              {!isCurrentUserAuthor && (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  className="w-full flex items-center justify-center gap-2 rounded-md text-xs font-semibold h-9"
                  onClick={handleFollow}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isFollowing ? "กำลังติดตาม" : "ติดตามบทความนี้"}
                </Button>
              )}

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 rounded-md text-xs font-semibold h-9"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                แชร์ลิงก์บทความ
              </Button>
            </div>

            {/* Game Features details */}
            <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden text-xs">
              <div className="bg-muted px-4 py-2 font-bold text-foreground uppercase tracking-wider">
                คุณสมบัติบทความ/เกม
              </div>
              <div className="p-3 divide-y divide-border text-[11px] text-muted-foreground">
                <div className="py-2 flex justify-between items-center">
                  <span>ผู้แต่ง</span>
                  <Link href={`/profiles/${encodeURIComponent(article.author?.name || "")}`} className="text-primary hover:underline font-bold">
                    {article.author?.name}
                  </Link>
                </div>
                {article.engine && (
                  <div className="py-2 flex justify-between items-center">
                    <span>เอนจินพัฒนา</span>
                    <span className="bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-sm font-semibold">
                      {article.engine.name}
                    </span>
                  </div>
                )}
                {article.ver && (
                  <div className="py-2 flex justify-between items-center">
                    <span>เวอร์ชันล่าสุด</span>
                    <span className="text-foreground font-bold">{article.ver}</span>
                  </div>
                )}
                <div className="py-2 flex justify-between items-center">
                  <span>วิวทั้งหมด</span>
                  <span className="text-primary font-bold">{(article.viewsCount || 0).toLocaleString()} ครั้ง</span>
                </div>
              </div>
            </div>

            {/* Supported Languages box */}
            <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden text-xs">
              <div className="bg-muted px-4 py-2 font-bold text-foreground uppercase tracking-wider">
                ภาษาที่รองรับ
              </div>
              <div className="p-3 text-[11px]">
                <table className="w-full text-left text-muted-foreground divide-y divide-border/60">
                  <thead>
                    <tr className="text-muted-foreground/60">
                      <th className="pb-1.5 font-normal">ภาษา</th>
                      <th className="pb-1.5 font-normal text-center">อินเตอร์เฟซ</th>
                      <th className="pb-1.5 font-normal text-center">เสียงพากย์</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    <tr>
                      <td className="py-2">ไทย (Thai)</td>
                      <td className="py-2 text-center text-primary">✔</td>
                      <td className="py-2 text-center text-muted-foreground">-</td>
                    </tr>
                    <tr>
                      <td className="py-2">อังกฤษ (English)</td>
                      <td className="py-2 text-center text-primary">✔</td>
                      <td className="py-2 text-center text-primary">✔</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Donation Sidebar Widget */}
            <Card className="border border-border bg-card rounded-lg p-4 text-xs">
              <h4 className="font-bold text-foreground uppercase mb-2">สนับสนุนชุมชนของเรา</h4>
              <p className="text-muted-foreground mb-3 leading-relaxed">
                การสนับสนุนของคุณช่วยขับเคลื่อนให้แอดมินและผู้แปลมีกำลังใจในการทำม็อดแปลไทยต่อ
              </p>
              <Link href="/donations" className="block w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 rounded-sm text-xs border-none">
                  ร่วมโดเนตสนับสนุน
                </Button>
              </Link>
            </Card>
          </aside>

        </div>

        {/* ── Comments (Full Width, outside boundary of article columns) ── */}
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

      </div>

      <ArticleDownloadDialog
        article={article}
        downloads={downloads}
        showAlert={showAlert}
        openDownloadDialog={openDownloadDialog}
        setOpenDownloadDialog={setOpenDownloadDialog}
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        relatedArticles={relatedArticles}
      />
      
      {/* ── Fullscreen Image Modal Gallery ── */}
      {isModalOpen && imageSlides.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="bg-white/10 text-white px-4 py-2 rounded-full text-xs font-medium backdrop-blur-md">
                  {modalImageIndex + 1} / {imageSlides.length}
                </span>
                <span className="text-white/80 text-xs font-medium">
                  {article.title}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 backdrop-blur-md hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          {imageSlides.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 backdrop-blur-md hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 backdrop-blur-md hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Zoom and download Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-6 py-2.5 backdrop-blur-md">
              <button 
                onClick={handleZoomOut} 
                className="p-1.5 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110" 
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-white text-xs px-2.5 py-0.5 bg-white/10 rounded-md font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button 
                onClick={handleZoomIn} 
                className="p-1.5 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110" 
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button 
                onClick={resetZoom} 
                className="p-1.5 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110" 
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-white/30 mx-1.5" />

              <button 
                onClick={downloadImage} 
                className="p-1.5 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110" 
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Image View */}
          <div className="relative w-full h-full flex items-center justify-center p-8 sm:p-16">
            <div
              className="relative w-full h-full max-w-6xl max-h-full transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={imageSlides[modalImageIndex].url}
                alt={`${article.title} Fullscreen`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {alert.open && (
        <CustomArticleAlert
          title={alert.severity === "success" ? t("success") || "สำเร็จ" : t("error") || "เกิดข้อผิดพลาด"}
          message={alert.message}
          variant={alert.severity === "success" ? "default" : "destructive"}
        />
      )}
    </div>
  );
};

export default ArticleContent;
