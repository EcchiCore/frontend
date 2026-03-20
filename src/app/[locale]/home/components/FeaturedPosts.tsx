"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import type { ArticleListItem } from '@chanomhub/sdk';

// ลบ title ออกจาก Interface
interface FeaturedPostsProps {
  posts: ArticleListItem[];
  loading: boolean;
}


import Image from 'next/image';
import imageLoader from '@/lib/imageLoader';

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} นาที`;
  if (diffHours < 24) return `${diffHours} ชม.`;
  if (diffDays < 7) return `${diffDays} วัน`;
  return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

function PostCard({ post }: { post: ArticleListItem }) {
  const [timeString, setTimeString] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setTimeString(getRelativeTime(post.createdAt));
  }, [post.createdAt]);

  const views = post.viewsCount || 0;
  const relativeTime = timeString || "";
  const src = post.coverImage || post.mainImage || null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group">
      {/* Thumbnail */}
      <Link href={`/articles/${post.slug}?id=${post.id}`} className="shrink-0 relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-md overflow-hidden bg-muted">
        {src && !imageError ? (
          <Image
            loader={imageLoader}
            src={src}
            alt={post.title}
            fill
            sizes="100px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-2xl opacity-50">
            📰
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link href={`/articles/${post.slug}?id=${post.id}`} className="block">
          <h3 className="text-foreground font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors mb-1">
            {post.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {post.description || 'ไม่มีคำอธิบาย'}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-muted-foreground">
          {post.categories?.[0] && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
              {post.categories[0].name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="opacity-70">👤</span> {post.author.name}
          </span>
          <span className="flex items-center gap-1">
            <span className="opacity-70">👁️</span> {views.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <span className="opacity-70">🕒</span> {relativeTime}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-end">
        <Link 
          href={`/articles/${post.slug}?id=${post.id}`}
          className="w-full sm:w-auto text-center px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold rounded-full shadow-sm transition-all"
        >
          อ่าน
        </Link>
      </div>
    </div>
  );
}

export default function FeaturedPosts({ posts, loading }: FeaturedPostsProps) {
  if (loading) {
    return <div className="text-center text-xs py-4">กำลังโหลด...</div>;
  }

  if (!posts || posts.length === 0) {
    return <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border rounded-lg">ไม่มีกระทู้</div>;
  }

  return (
    <div className="flex flex-col gap-3 mb-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}