"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ArticleListItem } from '@chanomhub/sdk';
import imageLoader from '@/lib/imageLoader';

interface ArticleShelfProps {
  title: string;
  posts: ArticleListItem[];
  loading?: boolean;
  href?: string;
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}น.`;
  if (diffHours < 24) return `${diffHours}ชม.`;
  if (diffDays < 7) return `${diffDays}วัน`;
  return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

const gradients = [
  'from-violet-950 via-purple-900 to-slate-950',
  'from-blue-950 via-blue-900 to-slate-950',
  'from-rose-950 via-pink-900 to-slate-950',
  'from-emerald-950 via-teal-900 to-slate-950',
  'from-amber-950 via-orange-900 to-slate-950',
];

function ArticleCard({ post, index }: { post: ArticleListItem; index: number }) {
  const [imageError, setImageError] = useState(false);
  const [timeString, setTimeString] = useState('');
  const src = post.coverImage || post.mainImage || null;

  useEffect(() => {
    setTimeString(getRelativeTime(post.createdAt));
  }, [post.createdAt]);

  return (
    <Link
      href={`/articles/${post.slug}?id=${post.id}`}
      className="group border border-border rounded-xl overflow-hidden bg-card
        hover:border-primary/60 hover:-translate-y-0.5 transition-all duration-200 flex flex-col
        flex-shrink-0 w-[240px]
        md:flex-shrink md:w-auto"
    >
      {/* Landscape thumbnail */}
      <div className="relative w-full h-[128px] bg-muted overflow-hidden flex-shrink-0">
        {src && !imageError ? (
          <Image
            loader={imageLoader}
            src={src}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 240px, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center`}>
            <span className="text-3xl opacity-20">📰</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {post.categories?.[0] && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[9px] font-bold text-primary bg-primary/20 border border-primary/30 px-1.5 py-0.5 rounded">
              {post.categories[0].name}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col flex-1 justify-between gap-1.5">
        <h3 className="text-foreground font-semibold text-[11px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="truncate">👤 {post.author?.name}</span>
          <span className="flex-shrink-0">👁 {(post.viewsCount || 0).toLocaleString()}</span>
          <span className="ml-auto flex-shrink-0">{timeString}</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card animate-pulse flex flex-col
      flex-shrink-0 w-[240px] md:flex-shrink md:w-auto">
      <div className="w-full h-[128px] bg-muted" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-2.5 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

export default function ArticleShelf({ title, posts, loading, href }: ArticleShelfProps) {
  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-primary rounded-full" />
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
        </div>
        {href && (
          <Link href={href} className="text-[11px] font-semibold text-primary hover:opacity-80 transition-opacity flex items-center gap-1">
            ดูทั้งหมด <span>→</span>
          </Link>
        )}
      </div>

      {/*
        Mobile  (<md): flex row → horizontal scroll, each card 240px fixed
        Desktop (≥md): grid 3 columns → full width, no scroll
      */}
      <div className="
        flex gap-2.5 overflow-x-auto pb-1
        [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        md:grid md:grid-cols-3 md:overflow-visible md:pb-0
      ">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : posts.map((post, i) => <ArticleCard key={post.id} post={post} index={i} />)
        }
      </div>
    </section>
  );
}
