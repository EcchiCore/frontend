"use client";

import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';

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

interface FeaturedPostsProps {
  posts: Article[];
  loading: boolean;
  title: string;
}

export default function FeaturedPosts({ posts, loading, title }: FeaturedPostsProps) {
  if (loading) {
    return <div className="text-center">กำลังโหลดกระทู้แนะนำ...</div>;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-1 h-8 bg-primary rounded-full"></div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link href={`/articles/${post.slug}?id=${post.id}`} key={post.id}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20 group bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-grow pr-4">
                    <h4 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {post.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end space-y-1 text-xs text-muted-foreground text-right">
                    <div className="truncate">
                      <span className="font-semibold text-foreground/80">ผู้เขียน:</span>{' '}
                      {post.author.name}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-foreground/80">หมวดหมู่:</span>{' '}
                      {post.categories[0]?.name || 'N/A'}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-foreground/80">วันที่:</span>{' '}
                      {new Date(post.createdAt).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}