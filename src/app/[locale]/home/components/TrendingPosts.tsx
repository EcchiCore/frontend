'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  Eye,
  Zap,
  ChevronRight,
  Heart,
  Tag,
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  sequentialCode: string;
  favoriteCount: number;
  commentCount: number;
  createdAt: number;
  mainImage: string;
  author: {
    id: number;
    name: string;
    bio: string;
    image: string;
  };
  categories: Array<{
    id: number;
    name: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

interface TrendingPost {
  id: number;
  title: string;
  author: string;
  authorImage: string;
  category: string;
  replies: number;
  views: number;
  favorites: number;
  time: string;
  isHot: boolean;
  slug: string;
  sequentialCode: string;
  mainImage: string;
}

export default function TrendingPosts() {
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_MEILISEARCH_HOST_EXTERNAL}/indexes/article/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY_EXTERNAL}`,
        },
        body: JSON.stringify({
          q: '', // Empty query to get all articles
          limit: 8, // Get top 8 trending articles
          sort: ['favoriteCount:desc', 'commentCount:desc', 'createdAt:desc'], // Sort by popularity
          filter: 'status = PUBLISHED', // Only published articles
          attributesToRetrieve: [
            'id',
            'title',
            'slug',
            'description',
            'sequentialCode',
            'favoriteCount',
            'commentCount',
            'createdAt',
            'mainImage',
            'author',
            'categories',
            'tags'
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match our component structure
      const transformedPosts: TrendingPost[] = data.hits.map((article: Article) => {
        const timeDiff = Date.now() - article.createdAt;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        let timeString;
        if (days > 0) {
          timeString = `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
          timeString = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
          timeString = 'Just now';
        }

        // Determine if post is "hot" based on recent activity
        const isHot = (article.favoriteCount > 5 || article.commentCount > 10) && days < 3;

        return {
          id: article.id,
          title: article.title,
          author: article.author.name,
          authorImage: article.author.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
          category: article.categories[0]?.name || 'General',
          replies: article.commentCount,
          views: Math.floor(Math.random() * 5000) + 100, // Mock views since not in data
          favorites: article.favoriteCount,
          time: timeString,
          isHot,
          slug: article.slug,
          sequentialCode: article.sequentialCode,
          mainImage: article.mainImage
        };
      });

      setTrendingPosts(transformedPosts);
    } catch (err) {
      console.error('Error fetching trending posts:', err);
      setError('Failed to load trending posts');

      // Fallback to mock data on error
      setTrendingPosts([
        {
          id: 1,
          title: 'Unable to load trending posts - Please check your connection',
          author: 'System',
          authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
          category: 'System',
          replies: 0,
          views: 0,
          favorites: 0,
          time: 'Now',
          isHot: false,
          slug: '',
          sequentialCode: '',
          mainImage: ''
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-red-500" />
            Trending Discussions
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-6 rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50/50 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex space-x-4">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-8 h-8 mr-3 text-red-500" />
          Trending Articles
        </h2>
        <button
          onClick={() => window.location.href = '/games'}
          className="text-indigo-600 hover:text-purple-600 font-semibold flex items-center transition-colors"
        >
          View All <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">{error}</p>
          <button
            onClick={fetchTrendingPosts}
            className="mt-2 text-yellow-600 hover:text-yellow-800 font-medium underline"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="space-y-4">
        {trendingPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => window.location.href = `/articles/${post.slug}`}
            className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer bg-gradient-to-r from-white to-gray-50/50"
          >
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Image
                  src={post.authorImage}
                  alt={post.author}
                  width={50}
                  height={50}
                  className="rounded-full object-cover ring-2 ring-white shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face';
                  }}
                />
                {post.isHot && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <Star className="w-2 h-2 text-white fill-current" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-3">
                  {post.isHot && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white">
                      <Zap className="w-3 h-3 mr-1" />
                      Hot
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                    <Tag className="w-3 h-3 mr-1" />
                    {post.category}
                  </span>
                  {post.sequentialCode && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-blue-100 text-blue-700">
                      {post.sequentialCode}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-3 line-clamp-2 leading-tight">
                  {post.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>
                      by <span className="font-semibold text-gray-700">{post.author}</span>
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.replies}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {formatViews(post.views)}
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.favorites}
                    </span>
                  </div>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}