"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ArticleListItem } from "@chanomhub/sdk";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useViewHistory } from "./hooks/useViewHistory";

interface RelatedArticlesProps {
    articles: ArticleListItem[];
    currentArticleId: number;
}

export default function RelatedArticles({
    articles,
    currentArticleId,
}: RelatedArticlesProps) {
    const t = useTranslations("RelatedArticles");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get user's preferred tags from view history
    const { tagScores } = useViewHistory();

    // Filter and sort articles by user preference
    const filteredArticles = useMemo(() => {
        const filtered = articles.filter((a) => a.id !== currentArticleId);

        // Score each article based on how many tags match user's viewing history
        const scored = filtered.map(article => {
            const articleTags = article.tags?.map(t => t.name.toLowerCase()) || [];
            let score = 0;

            // Add score based on user's tag view history
            for (const tag of articleTags) {
                score += tagScores[tag] || 0;
            }

            return { article, score };
        });

        // Sort by preference score (higher first), then slice
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(item => item.article);
    }, [articles, currentArticleId, tagScores]);

    // Handle user scroll - pause and set timeout to resume
    const handleUserScroll = useCallback(() => {
        setIsPaused(true);

        // Clear existing timeout
        if (resumeTimeoutRef.current) {
            clearTimeout(resumeTimeoutRef.current);
        }

        // Resume auto-scroll after 2 seconds of no scrolling
        resumeTimeoutRef.current = setTimeout(() => {
            setIsPaused(false);
        }, 2000);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (resumeTimeoutRef.current) {
                clearTimeout(resumeTimeoutRef.current);
            }
        };
    }, []);

    // Auto-scroll effect
    useEffect(() => {
        if (filteredArticles.length === 0) return;

        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const scrollSpeed = 1; // pixels per frame
        const scrollInterval = 50; // ms between scroll steps

        const autoScroll = () => {
            if (isPaused || !scrollContainer) return;

            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

            if (scrollContainer.scrollLeft >= maxScroll) {
                // Reset to beginning for infinite loop effect
                scrollContainer.scrollLeft = 0;
            } else {
                scrollContainer.scrollLeft += scrollSpeed;
            }
        };

        const intervalId = setInterval(autoScroll, scrollInterval);

        return () => clearInterval(intervalId);
    }, [isPaused, filteredArticles.length]);

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 300;
        const newScrollLeft = direction === 'left'
            ? scrollRef.current.scrollLeft - scrollAmount
            : scrollRef.current.scrollLeft + scrollAmount;

        scrollRef.current.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });
    }, []);

    if (filteredArticles.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    {t("title")}
                </h3>

                {/* Navigation buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-card border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-card border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Horizontal scrollable container */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    onScroll={handleUserScroll}
                    className="flex gap-4 overflow-x-auto pb-4 scroll-smooth cursor-grab active:cursor-grabbing"
                    style={{
                        scrollbarWidth: 'thin',
                    }}
                >
                    {/* Duplicate items for infinite loop effect */}
                    {filteredArticles.map((article, index) => {
                        const imageSrc =
                            article.coverImage ||
                            article.mainImage ||
                            null;

                        return (
                            <Link
                                key={`${article.id}-${index}`}
                                href={`/articles/${article.slug}`}
                                className="group block flex-shrink-0"
                            >
                                <Card className="w-[260px] overflow-hidden bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                                    {/* Thumbnail */}
                                    <div className="relative aspect-[16/9] overflow-hidden bg-muted/50">
                                        {imageSrc ? (
                                            <Image
                                                src={imageSrc}
                                                alt={article.title}
                                                width={260}
                                                height={146}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-muted/50 flex items-center justify-center">
                                                <span className="text-3xl font-bold text-muted-foreground/30">
                                                    {article.title.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 space-y-2">
                                        <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight min-h-[2.5rem]">
                                            {article.title}
                                        </h4>

                                        {article.author && (
                                            <div className="flex items-center gap-1.5">
                                                {article.author.image ? (
                                                    <Image
                                                        src={article.author.image}
                                                        alt={article.author.name}
                                                        width={16}
                                                        height={16}
                                                        className="rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-[10px] font-semibold text-primary">
                                                            {article.author.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {article.author.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Fade edges */}
                <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
