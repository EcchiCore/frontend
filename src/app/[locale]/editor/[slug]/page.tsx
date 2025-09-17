
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// This is the Article interface from ArticleManagement.tsx
interface Author {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

interface Article {
  tagList: string[];
  categoryList: string[];
  title: string;
  slug: string;
  description: string;
  body: string;
  author: Author;
  favorited: boolean;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  mainImage: string | null;
  images: string[];
}

const EditArticlePage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Partial<Article>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  };

  const fetchArticle = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const token = getCookie('token');
      if (!token) {
        throw new Error('Authorization token not found. Please log in.');
      }

      const response = await fetch(`${API_URL}/api/articles/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }

      const data = await response.json();
      setArticle(data.article);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [slug, API_URL]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setArticle(prev => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArticle(prev => ({ ...prev, tagList: e.target.value.split(',') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error('Authorization token not found. Please log in.');
      }

      const response = await fetch(`${API_URL}/api/articles/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ article }),
      });

      if (!response.ok) {
        throw new Error('Failed to update article');
      }

      router.push(`/articles/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (error) {
    return <div className="alert alert-error mb-6"><span>{error}</span></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Article</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={article.title || ''} onChange={handleInputChange} placeholder="Article Title" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={article.description || ''} onChange={handleInputChange} placeholder="What's this article about?" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="body">Body</Label>
                <Textarea id="body" name="body" value={article.body || ''} onChange={handleInputChange} placeholder="Write your article (in markdown)" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="tagList">Tags</Label>
                <Input id="tagList" name="tagList" value={article.tagList?.join(',') || ''} onChange={handleTagChange} placeholder="Enter tags, separated by commas" />
              </div>
              <Button type="submit">Update Article</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditArticlePage;
