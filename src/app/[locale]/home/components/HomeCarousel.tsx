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

const fallbacks = [
  'from-violet-950 via-purple-900 to-slate-950',
  'from-blue-950 via-blue-900 to-slate-950',
  'from-rose-950 via-pink-900 to-slate-950',
];

export default function HomeCarousel({ articles, loading }: HomeCarouselProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const handleImageError = (id: number) =>
    setImageErrors(prev => ({ ...prev, [id]: true }));

  if (loading) {
    return (
      <section className="container mx-auto px-3 py-3 max-w-5xl">
        <div className="bg-muted rounded-xl animate-pulse h-[200px] sm:h-[260px]" />
      </section>
    );
  }
  if (!articles || articles.length === 0) return null;

  const [main, ...secondary] = articles.slice(0, 3);

  return (
    <section className="container mx-auto px-3 py-3 max-w-5xl">
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <div className="w-0.5 h-5 bg-primary rounded-full" />
        <h3 className="text-sm font-bold text-foreground">กระทู้เด่นประจำวัน</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:h-[260px]">
        {/* Main hero */}
        <Link
          href={`/articles/${main.slug}?id=${main.id}`}
          className="group relative overflow-hidden rounded-xl border border-border hover:border-primary/60 transition-all duration-300
            h-[200px] sm:col-span-2 sm:h-full"
        >
          <div className="absolute inset-0">
            {(main.coverImage || main.mainImage) && !imageErrors[main.id] ? (
              <Image
                loader={imageLoader}
                src={main.coverImage || main.mainImage || ''}
                alt={main.title} fill priority
                sizes="(max-width: 640px) 100vw, 66vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => handleImageError(main.id)}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${fallbacks[0]} flex items-center justify-center`}>
                <span className="text-5xl opacity-15">🎮</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          </div>
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[9px] font-extrabold bg-primary text-primary-foreground px-2 py-0.5 rounded tracking-wider">
              FEATURED
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
            {main.categories?.[0] && (
              <span className="inline-block text-[10px] font-bold text-primary bg-primary/15 border border-primary/30 px-2 py-0.5 rounded mb-2">
                {main.categories[0].name}
              </span>
            )}
            <h4 className="text-white font-bold text-base sm:text-xl leading-snug line-clamp-2 group-hover:text-primary/90 transition-colors">
              {main.title}
            </h4>
            {main.description && (
              <p className="text-white/55 text-xs line-clamp-1 mt-1">{main.description}</p>
            )}
          </div>
        </Link>

        {/* Secondary cards — horizontal scroll on mobile, stacked on sm+ */}
        <div className="flex flex-row gap-2 overflow-x-auto sm:flex-col sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {secondary.map((article, i) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}?id=${article.id}`}
              className="group relative overflow-hidden rounded-xl border border-border hover:border-primary/60 transition-all duration-300
                flex-shrink-0 w-[180px] h-[120px]
                sm:w-auto sm:flex-1"
            >
              <div className="absolute inset-0">
                {(article.coverImage || article.mainImage) && !imageErrors[article.id] ? (
                  <Image
                    loader={imageLoader}
                    src={article.coverImage || article.mainImage || ''}
                    alt={article.title} fill
                    sizes="(max-width: 640px) 180px, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => handleImageError(article.id)}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${fallbacks[i + 1]} flex items-center justify-center`}>
                    <span className="text-3xl opacity-15">🎮</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
                <h4 className="text-white font-bold text-xs leading-snug line-clamp-2 group-hover:text-primary/90 transition-colors">
                  {article.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
