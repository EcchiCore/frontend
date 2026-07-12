"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import imageLoader from "@/lib/imageLoader";
import { useState } from "react";
import type { SponsoredArticle } from "@chanomhub/sdk";
import { Megaphone } from "lucide-react";

interface SponsoredArticlesProps {
  articles: SponsoredArticle[];
}

export default function SponsoredArticles({ articles }: SponsoredArticlesProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const handleImageError = (id: number) =>
    setImageErrors((prev) => ({ ...prev, [id]: true }));

  if (!articles || articles.length === 0) return null;

  return (
    <section className="bg-card/50 border-b border-border/30">
      <div className="container mx-auto px-4 max-w-5xl py-2.5">
        <div className="flex items-center gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {articles.map((sponsored) => {
            const article = sponsored.article;
            const src = sponsored.coverImage || article.coverImage || article.mainImage || null;
            const hasError = imageErrors[sponsored.id];
            return (
              <Link
                key={sponsored.id}
                href={`/articles/${article.slug}?id=${article.id}`}
                className="group flex-shrink-0 flex items-center gap-3 pr-6 border-r border-border/20 last:border-r-0 last:pr-0"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                  {src && !hasError ? (
                    <Image
                      loader={imageLoader}
                      src={src}
                      alt={article.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                      onError={() => handleImageError(sponsored.id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                      <Megaphone className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider">
                    Ad
                  </span>
                  <h4 className="text-foreground text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors leading-tight mt-0.5">
                    {article.title}
                  </h4>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
