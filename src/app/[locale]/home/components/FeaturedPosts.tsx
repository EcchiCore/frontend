"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, MessageSquare, Heart, Clock } from 'lucide-react';
import Image from 'next/image'; // Import Next.js Image component

const PLACEHOLDER_IMAGE = '/placeholder-image.png';

// Define the structure of an article from the API
interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  author: {
    username: string;
  };
  categoryList: string[];
  favoritesCount: number;
  createdAt: string;
  mainImage: string;
}

interface FeaturedPostsProps {
  posts: Article[];
  loading: boolean;
}

export default function FeaturedPosts({ posts, loading }: FeaturedPostsProps) {
  const [error, setError] = useState<string | null>(null);

  // Function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMs = now.getTime() - created.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) return 'เมื่อไม่กี่นาทีที่แล้ว';
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} วันที่แล้ว`;
  };

  if (loading) {
    return <div className="text-center">กำลังโหลดกระทู้แนะนำ...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm leading-none font-medium text-foreground">กระทู้แนะนำ</h3>
      {posts.map((post) => (
        <Link href={`/articles/${post.slug}`} key={post.id}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="w-32 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                  <Image
                    src={post.mainImage}
                    alt={post.title}
                    width={128} // Match w-32 (32 * 4 = 128px)
                    height={80} // Match h-20 (20 * 4 = 80px)
                    className="w-full h-full object-cover"
                    priority={false}
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{post.categoryList[0] || 'ทั่วไป'}</Badge>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>0</span> {/* Views not in API, fake or omit */}
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>0</span> {/* Comments not in API */}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.favoritesCount}</span>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-muted-foreground mb-3">{post.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{post.author.username}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
