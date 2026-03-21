"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ArticleListItem } from '@chanomhub/sdk';
import imageLoader from '@/lib/imageLoader';

interface GameShelfProps {
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

  useEffect(() => {
    setTimeString(getRelativeTime(post.createdAt));
  }, [post.createdAt]);

  return (
    <Link
      href={`/articles/${post.slug}?id=${post.id}`}
      // Mobile: fixed 130px wide (scroll row) | Desktop: fills grid cell
      className="group border border-border rounded-xl overflow-hidden bg-card
        hover:border-primary/60 hover:-translate-y-0.5 transition-all duration-200
        flex-shrink-0 w-[130px]
        md:flex-shrink md:w-auto"
    >
      {/* Portrait thumbnail — fixed height on mobile, auto on desktop */}
      <div className="relative w-full h-[174px] bg-muted overflow-hidden">
        {src && !imageError ? (
          <Image
            loader={imageLoader}
            src={src}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 130px, (max-width: 1024px) 16vw, 150px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            loading={index < 6 ? 'eager' : 'lazy'}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center`}>
            <span className="text-3xl opacity-20">🎮</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {badge && (
          <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded z-10 ${badge.color}`}>
            {badge.label}
          </span>
        )}
        <div className="absolute top-1.5 right-1.5 bg-black/60 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 z-10">
          <span>★</span>
          <span>{((post.viewsCount || 0) / 1000).toFixed(1)}k</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <h3 className="text-foreground font-semibold text-[11px] leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
          {post.title}
        </h3>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded truncate max-w-[60px]">
            {post.categories?.[0]?.name || 'General'}
          </span>
          <span className="text-[9px] text-muted-foreground flex-shrink-0">{timeString}</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card animate-pulse
      flex-shrink-0 w-[130px] md:flex-shrink md:w-auto">
      <div className="w-full h-[174px] bg-muted" />
      <div className="p-2 space-y-1.5">
        <div className="h-2.5 bg-muted rounded w-full" />
        <div className="h-2.5 bg-muted rounded w-3/4" />
        <div className="h-2 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

export default function GameShelf({ title, posts, loading, href }: GameShelfProps) {
  const items = loading ? Array.from({ length: 24 }) : posts;

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
        Mobile  (<md): flex row → horizontal scroll, each card 130px fixed
        Desktop (≥md): grid 6 columns → full width, no scroll
      */}
      <div className="
        flex gap-2.5 overflow-x-auto pb-1
        [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        md:grid md:grid-cols-6 md:overflow-visible md:pb-0
      ">
        {loading
          ? Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)
          : posts.map((post, i) => <GameCard key={post.id} post={post} index={i} />)
        }
      </div>
    </section>
  );
}
