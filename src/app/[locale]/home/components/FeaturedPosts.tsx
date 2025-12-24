"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';

// Define the structure of an article from the API
interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  author: {
    name: string;
    image: string | null;
  };
  categories: { name: string }[];
  favoritesCount: number;
  createdAt: string;
  mainImage: string | null;
  backgroundImage: string | null;
  coverImage: string | null;
  platforms: { name: string }[];
  tags: { name: string }[];
}

// ลบ title ออกจาก Interface
interface FeaturedPostsProps {
  posts: Article[];
  loading: boolean;
}

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

// Separate component for each post row to properly use React hooks
function PostRow({ post, index }: { post: Article; index: number }) {
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    setTimeString(getRelativeTime(post.createdAt));
  }, [post.createdAt]);

  // Generate mock data for replies and views (deterministic based on ID to avoid hydration mismatch)
  const replies = (post.id * 7) % 70 + 12;
  const views = (post.id * 13) % 900 + 145;
  const relativeTime = timeString || "";

  return (
    <tr
      className={`border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors ${index % 2 === 1 ? 'bg-muted/20' : ''
        }`}
    >
      {/* Title Column */}
      <td className="px-2 py-1.5 text-foreground  ">
        <Link
          href={`/articles/${post.slug}?id=${post.id}`}
          className="hover:text-primary hover:underline font-medium line-clamp-2 sm:line-clamp-1"
          title={post.description}
        >
          {post.title}
        </Link>
        {/* Show author and category on mobile */}
        <div className="md:hidden text-[10px] text-muted-foreground mt-0.5 space-x-2">
          <span>โดย {post.author.name}</span>
          <span>• {relativeTime}</span>
        </div>
      </td>

      {/* Author Column - Hidden on mobile */}
      <td className="px-2 py-1.5 text-muted-foreground hidden md:table-cell truncate">
        {post.author.name}
      </td>

      {/* Category Column - Hidden on tablet and below */}
      <td className="px-2 py-1.5 hidden lg:table-cell">
        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded truncate inline-block max-w-full">
          {post.categories[0]?.name || 'ทั่วไป'}
        </span>
      </td>

      {/* Replies Column - Hidden on laptop and below */}
      <td className="px-2 py-1.5 text-center text-muted-foreground hidden xl:table-cell">
        {replies}
      </td>

      {/* Views Column - Hidden on laptop and below */}
      <td className="px-2 py-1.5 text-center text-muted-foreground hidden xl:table-cell">
        {views.toLocaleString()}
      </td>

      {/* Last Post Column - Hidden on mobile */}
      <td className="px-2 py-1.5 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
        {relativeTime}
      </td>
    </tr>
  );
}

// ลบ title ออกจากการรับค่า function
export default function FeaturedPosts({ posts, loading }: FeaturedPostsProps) {
  if (loading) {
    return <div className="text-center text-xs">กำลังโหลด...</div>;
  }

  if (!posts || posts.length === 0) {
    return <div className="text-center text-xs text-muted-foreground">ไม่มีกระทู้</div>;
  }

  return (
    <div className="mb-4">
      {/* ลบส่วน Header ที่แสดง title ออกไปแล้ว */}

      {/* Table Layout */}
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 border-b border-border text-foreground">
            <tr>
              <th className="text-left px-2 py-1.5 font-semibold">หัวข้อกระทู้</th>
              <th className="text-left px-2 py-1.5 font-semibold hidden md:table-cell w-28">ผู้เขียน</th>
              <th className="text-left px-2 py-1.5 font-semibold hidden lg:table-cell w-24">หมวดหมู่</th>
              <th className="text-center px-2 py-1.5 font-semibold hidden xl:table-cell w-16">ตอบกลับ</th>
              <th className="text-center px-2 py-1.5 font-semibold hidden xl:table-cell w-16">ดู</th>
              <th className="text-left px-2 py-1.5 font-semibold hidden sm:table-cell w-24">โพสต์ล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <PostRow key={post.id} post={post} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}