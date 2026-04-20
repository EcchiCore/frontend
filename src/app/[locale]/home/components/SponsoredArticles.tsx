"use client";


import { Link } from "@/i18n/navigation";
import Image from 'next/image';
import imageLoader from '@/lib/imageLoader';
import { useState } from 'react';
import type { SponsoredArticle } from '@chanomhub/sdk';
import { Megaphone } from 'lucide-react';

interface SponsoredArticlesProps {
  articles: SponsoredArticle[];
}

export default function SponsoredArticles({ articles }: SponsoredArticlesProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const handleImageError = (id: number) =>
    setImageErrors(prev => ({ ...prev, [id]: true }));

  if (!articles || articles.length === 0) return null;

  return (
    <section className="container mx-auto px-3 pb-2 max-w-5xl">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-0.5 h-4 bg-amber-500 rounded-full" />
        <Megaphone className="w-3 h-3 text-amber-500" />
        <span className="text-[11px] font-bold text-foreground">Sponsored</span>
        <div className="flex-1 h-px bg-amber-500/10" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {articles.map((sponsored) => {
          const article = sponsored.article;
          const src = sponsored.coverImage || article.coverImage || article.mainImage || null;
          const hasError = imageErrors[sponsored.id];
          return (
            <Link
              key={sponsored.id}
              href={`/articles/${article.slug}?id=${article.id}`}
              className="group flex-shrink-0 w-[150px]"
            >
              <div className="relative border border-border rounded-xl overflow-hidden hover:border-amber-500/50 hover:-translate-y-0.5 transition-all duration-200 bg-card">
                <div className="relative w-full h-20 bg-muted">
                  {src && !hasError ? (
                    <Image
                      loader={imageLoader} src={src} alt={article.title} fill sizes="150px"
                      className="object-cover group-hover:scale-105 transition-transform"
                      onError={() => handleImageError(sponsored.id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-950/50 to-orange-900/30 flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-amber-500/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-1 left-1.5">
                    <span className="text-[8px] font-extrabold uppercase text-amber-200 bg-amber-600/80 px-1 py-0.5 rounded">AD</span>
                  </div>
                </div>
                <div className="p-1.5">
                  <h4 className="text-foreground text-[10px] font-semibold line-clamp-2 group-hover:text-amber-500 transition-colors leading-tight">
                    {article.title}
                  </h4>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
