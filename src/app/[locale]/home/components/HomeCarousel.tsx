"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import imageLoader from "@/lib/imageLoader";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import type { ArticleListItem } from "@chanomhub/sdk";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HomeCarouselProps {
  articles: ArticleListItem[];
  loading: boolean;
}

const AUTO_INTERVAL = 6000;

const fallbacks = [
  "from-primary/20 via-card to-background",
  "from-accent/20 via-card to-background",
  "from-primary/15 via-card to-background",
  "from-accent/15 via-card to-background",
  "from-primary/10 via-card to-background",
];

export default function HomeCarousel({ articles, loading }: HomeCarouselProps) {
  const t = useTranslations("homePage.HomeCarousel");
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = articles?.length || 0;

  const goTo = useCallback(
    (index: number, dir?: "left" | "right") => {
      if (total === 0) return;
      const next = ((index % total) + total) % total;
      setDirection(dir || (next > current ? "right" : "left"));
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(next);
        setIsAnimating(false);
      }, 50);
    },
    [total, current],
  );

  const next = useCallback(() => goTo(current + 1, "right"), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1, "left"), [goTo, current]);

  // Auto-rotate
  useEffect(() => {
    if (isPaused || total <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next, total]);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    const el = document.getElementById("hero-carousel");
    if (!el) return;
    el.addEventListener("keydown", handleKey);
    return () => el.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    trackMouse: false,
  });

  const handleImageError = (id: number) =>
    setImageErrors((prev) => ({ ...prev, [id]: true }));

  if (loading) {
    return (
      <section className="relative w-full h-[clamp(280px,50vh,480px)] bg-card overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-muted/50" />
      </section>
    );
  }

  if (!articles || articles.length === 0) return null;

  const article = articles[current];
  const coverSrc = article.coverImage || article.mainImage || "";
  const hasError = imageErrors[article.id];
  const categories = article.categories || [];

  return (
    <section
      id="hero-carousel"
      {...swipeHandlers}
      className="relative w-full h-[clamp(280px,50vh,480px)] overflow-hidden bg-background"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={t("featuredPostsToday")}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsPaused(false);
      }}
    >
      {/* Slide content */}
      <Link
        href={`/articles/${article.slug}?id=${article.id}`}
        className="group absolute inset-0 flex items-end"
        aria-current={true}
      >
        {/* Background image */}
        {coverSrc && !hasError ? (
          <Image
            loader={imageLoader}
            src={coverSrc}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
              isAnimating
                ? direction === "right"
                  ? "animate-[slideInRight_500ms_ease-out]"
                  : "animate-[slideInLeft_500ms_ease-out]"
                : ""
            }`}
            onError={() => handleImageError(article.id)}
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              fallbacks[current % fallbacks.length]
            }`}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        {/* Bottom content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-8 sm:pb-12">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded tracking-wider uppercase">
              Featured
            </span>
            {categories[0] && (
              <span className="text-[10px] font-semibold text-white/70 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded">
                {categories[0].name}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-white font-bold text-xl sm:text-3xl md:text-4xl leading-tight max-w-3xl line-clamp-2 text-wrap-balance group-hover:text-primary/90 transition-colors duration-300">
            {article.title}
          </h2>

          {/* Description */}
          {article.description && (
            <p className="text-white/50 text-sm sm:text-base mt-2 line-clamp-1 max-w-2xl">
              {article.description}
            </p>
          )}
        </div>
      </Link>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all duration-200 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all duration-200 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                goTo(i, i > current ? "right" : "left");
              }}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === current
                  ? "w-6 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
