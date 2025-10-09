"use client";

import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, MessageSquare, Heart, Clock } from 'lucide-react';
import Image from 'next/image'; // Import Next.js Image component



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
  backgroundImage: string;
  coverImage: string;
}

interface FeaturedPostsProps {
  posts: Article[];
  loading: boolean;
}

export default function FeaturedPosts({ posts, loading }: FeaturedPostsProps) {
  

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

  

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-1 h-8 bg-primary rounded-full"></div>
        <h3 className="text-lg font-semibold text-foreground">กระทู้แนะนำ</h3>
      </div>
      {posts.map((post) => {
        const imageUrl = post.coverImage || post.mainImage || post.backgroundImage;
        const src = typeof imageUrl === 'string' ? imageUrl : (imageUrl as { url?: string })?.url || null;

        return (
          <Link href={`/articles/${post.slug}`} key={post.id}>
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20 group">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="w-32 h-20 bg-muted rounded-xl flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <Image
                      src={src || '/placeholder-image.png'}
                      alt={post.title}
                      width={128} // Match w-32 (32 * 4 = 128px)
                      height={80} // Match h-20 (20 * 4 = 80px)
                      className="w-full h-full object-cover"
                      priority={false}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {post.categoryList[0] || 'ทั่วไป'}
                      </Badge>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1 group-hover:text-primary transition-colors">
                          <Eye className="h-4 w-4" />
                          <span>0</span> {/* Views not in API, fake or omit */}
                        </div>
                        <div className="flex items-center space-x-1 group-hover:text-primary transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span>0</span> {/* Comments not in API */}
                        </div>
                        <div className="flex items-center space-x-1 group-hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{post.favoritesCount}</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h4>
                    <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-2">{post.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm group-hover:ring-primary/20 transition-all duration-200">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {post.author.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
                          {post.author.username}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}