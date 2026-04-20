"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ArticleListItem } from '@chanomhub/sdk';
import imageLoader from '@/lib/imageLoader';
import { useFormatter, useTranslations } from 'next-intl';

interface FeaturedPostsProps {
  posts: ArticleListItem[];
  loading: boolean;
}

function getCardBadge(post: ArticleListItem): { label: string; color: string } | null {
  const diffDays = Math.floor((Date.now() - new Date(post.createdAt).getTime()) / 86400000);
  if (diffDays <= 3) return { label: 'NEW', color: 'bg-green-500 text-black' };
  if ((post.viewsCount || 0) > 10000) return { label: 'HOT', color: 'bg-red-500 text-white' };
  const cat = post.categories?.[0]?.name;
  if (cat) return { label: cat, color: 'bg-primary/80 text-primary-foreground' };
  return null;
}

const gradients = [
  'from-violet-950 via-purple-900 to-slate-950',
  'from-blue-950 via-blue-900 to-slate-950',
  'from-rose-950 via-pink-900 to-slate-950',
  'from-emerald-950 via-teal-900 to-slate-950',
  'from-amber-950 via-orange-900 to-slate-950',
  'from-indigo-950 via-purple-900 to-slate-950',
  'from-cyan-950 via-sky-900 to-slate-950',
  'from-slate-900 via-zinc-800 to-slate-950',
];

function GameCard({ post, index }: { post: ArticleListItem; index: number }) {
  const [imageError, setImageError] = useState(false);
  const [timeString, setTimeString] = useState('');
  const src = post.coverImage || post.mainImage || null;
  const badge = getCardBadge(post);
  const fallback = gradients[index % gradients.length];
  const format = useFormatter();

  useEffect(() => {
    setTimeString(format.relativeTime(new Date(post.createdAt), { now: new Date() }));
  }, [post.createdAt, format]);

  return (
    <Link
      href={`/articles/${post.slug}?id=${post.id}`}
      // Mobile: horizontal row | sm+: vertical portrait card
      className="group border border-border rounded-xl overflow-hidden hover:border-primary/60 transition-all duration-200 bg-card flex flex-row sm:flex-col"
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 overflow-hidden bg-muted
        w-[90px] h-[90px]
        sm:w-full sm:h-auto sm:aspect-[3/4]">
        {src && !imageError ? (
          <Image
            loader={imageLoader}
            src={src}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 90px, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            loading={index < 4 ? 'eager' : 'lazy'}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${fallback} flex items-center justify-center`}>
            <span className="text-2xl sm:text-4xl opacity-25">🎮</span>
          </div>
        )}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {badge && (
          <span className={`hidden sm:inline-block absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded z-10 ${badge.color}`}>
            {badge.label}
          </span>
        )}
        <div className="hidden sm:flex absolute top-2 right-2 bg-black/60 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded items-center gap-1 z-10">
          <span>★</span><span>{((post.viewsCount || 0) / 1000).toFixed(1)}k</span>
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 p-2 sm:p-2.5 flex flex-col justify-between gap-1">
        <div>
          {badge && (
            <span className={`sm:hidden inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mb-1 ${badge.color}`}>
              {badge.label}
            </span>
          )}
          <h3 className="text-foreground font-semibold text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.description && (
            <p className="sm:hidden text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
              {post.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded truncate max-w-[80px]">
            {post.categories?.[0]?.name || 'General'}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeString}</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-row sm:flex-col bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="w-[90px] h-[90px] sm:w-full sm:h-auto sm:aspect-[3/4] bg-muted flex-shrink-0" />
      <div className="flex-1 p-2 sm:p-2.5 space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-2.5 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

export default function FeaturedPosts({ posts, loading }: FeaturedPostsProps) {
  const t = useTranslations('FeaturedPosts');
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-xs text-muted-foreground py-12 border border-dashed border-border rounded-xl">
        {t('noPosts')}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      {posts.map((post, i) => (
        <GameCard key={post.id} post={post} index={i} />
      ))}
    </div>
  );
}
