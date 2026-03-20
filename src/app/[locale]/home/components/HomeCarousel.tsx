"use client";

import Link from 'next/link';
import Image from 'next/image';
import imageLoader from '@/lib/imageLoader';
import { useState } from 'react';
import type { ArticleListItem } from '@chanomhub/sdk';

interface HomeCarouselProps {
  articles: ArticleListItem[];
  loading: boolean;
}


export default function HomeCarousel({ articles, loading }: HomeCarouselProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const handleImageError = (articleId: number) => {
    setImageErrors(prev => ({ ...prev, [articleId]: true }));
  };

  if (loading) {
    return (
      <section className="container mx-auto px-2 py-3">
        <div className="relative bg-muted rounded h-32 animate-pulse"></div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  // Show only first 3 articles
  const displayArticles = articles.slice(0, 3);

  return (
    <section className="container mx-auto px-2 py-3">
      <div className="flex items-center space-x-2 mb-2 px-1">
        <div className="w-0.5 h-5 bg-primary"></div>
        <h3 className="text-sm font-semibold text-foreground">กระทู้เด่นประจำวัน</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-2 h-auto md:h-[400px]">
        {displayArticles.map((article, index) => {
          const src = article.coverImage || article.mainImage || null;
          const hasError = imageErrors[article.id];
          const isLarge = index === 0;

          return (
            <Link
              key={article.id}
              href={`/articles/${article.slug}?id=${article.id}`}
              className={`group relative overflow-hidden rounded bg-card border border-border hover:border-primary/50 transition-colors ${
                isLarge ? 'md:col-span-2 md:row-span-2 h-[240px] md:h-full' : 'col-span-1 row-span-1 h-[140px] md:h-full'
              }`}
            >
              <div className="absolute inset-0 bg-muted">
                {src && !hasError ? (
                  <Image
                    loader={imageLoader}
                    src={src}
                    alt={article.title}
                    fill
                    sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => handleImageError(article.id)}
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-4xl opacity-50">📰</div>
                  </div>
                )}
                {/* Gradient overlay for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>

              {/* Info Layered on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-10 flex flex-col justify-end">
                <h4 className={`text-white font-bold leading-tight line-clamp-2 drop-shadow-md group-hover:text-primary transition-colors ${isLarge ? 'text-lg md:text-2xl' : 'text-sm'}`}>
                  {article.title}
                </h4>
                {isLarge && (
                  <p className="text-white/80 text-xs md:text-sm line-clamp-1 mt-1.5 drop-shadow">
                    {article.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}