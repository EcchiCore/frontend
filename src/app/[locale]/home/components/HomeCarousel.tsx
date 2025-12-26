"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface Article {
  id: number;
  title: string;
  slug: string;
  mainImage: string | null;
  coverImage: string | null;
  backgroundImage: string | null;
  description: string;
}

interface HomeCarouselProps {
  articles: Article[];
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {displayArticles.map((article) => {
          const src = article.coverImage || article.mainImage || article.backgroundImage || null;
          const hasError = imageErrors[article.id];

          return (
            <Link
              key={article.id}
              href={`/articles/${article.slug}?id=${article.id}`}
              className="group"
            >
              <div className="border border-border rounded overflow-hidden hover:border-primary/50 transition-colors bg-card">
                {/* Compact Image */}
                <div className="relative w-full h-20 bg-muted">
                  {src && !hasError ? (
                    <Image
                      src={src}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      onError={() => handleImageError(article.id)}
                      priority={displayArticles.indexOf(article) === 0}
                      loading={displayArticles.indexOf(article) === 0 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-2xl">📰</div>
                    </div>
                  )}
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Compact Info */}
                <div className="p-2">
                  <h4 className="text-foreground text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {article.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">
                    {article.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}