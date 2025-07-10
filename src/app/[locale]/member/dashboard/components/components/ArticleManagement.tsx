'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ArticleItem from './ArticleItem';
import { PlusIcon } from '@heroicons/react/24/outline';

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

interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

const ArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesCount, setArticlesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  };

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const token = getCookie('token');
      if (!token) {
        throw new Error('Authorization token not found. Please log in.');
      }

      const statusFilter = tabValue === 0 ? '' : tabValue === 1 ? 'PUBLISHED' : 'DRAFT';
      const offset = (page - 1) * itemsPerPage;
      const queryParams = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
        ...(statusFilter && { status: statusFilter })
      });

      const endpoint = tabValue === 3
        ? `${API_URL}/api/articles/feed?${queryParams}`
        : `${API_URL}/api/articles/me?${queryParams}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const data: ArticlesResponse = await response.json();
      setArticles(data.articles);
      setArticlesCount(data.articlesCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [tabValue, page, itemsPerPage, API_URL]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleFavoriteChange = (slug: string, favorited: boolean, favoritesCount: number) => {
    setArticles(articles.map(article =>
      article.slug === slug ? { ...article, favorited, favoritesCount } : article
    ));
  };

  const handleViewArticle = async (slug: string) => {
    try {
      const token = getCookie('token');
      if (!token) throw new Error('Authorization required');

      const response = await fetch(`${API_URL}/api/articles/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch article');
      window.open(`/articles/${slug}`, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to view article');
    }
  };

  const handleEditArticle = (slug: string) => {
    router.push(`/editor/${slug}`);
  };

  const handleDeleteArticle = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const token = getCookie('token');
      if (!token) throw new Error('Authorization required');

      const response = await fetch(`${API_URL}/api/articles/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error('Failed to delete article');
      setArticles(articles.filter(article => article.slug !== slug));
      setArticlesCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
    }
  };

  const handleCreateArticle = () => {
    router.push('/editor');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Article Management</h2>
        <button className="btn btn-primary" onClick={handleCreateArticle}>
          <PlusIcon className="h-5 w-5" />
          Create New Article
        </button>
      </div>
      <div className="tabs tabs-boxed mb-6">
        <a className={`tab ${tabValue === 0 ? 'tab-active' : ''}`} onClick={() => handleTabChange(0)}>
          All Articles
        </a>
        <a className={`tab ${tabValue === 1 ? 'tab-active' : ''}`} onClick={() => handleTabChange(1)}>
          Published
        </a>
        <a className={`tab ${tabValue === 2 ? 'tab-active' : ''}`} onClick={() => handleTabChange(2)}>
          Drafts
        </a>
        <a className={`tab ${tabValue === 3 ? 'tab-active' : ''}`} onClick={() => handleTabChange(3)}>
          Feed
        </a>
      </div>
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : articles.length === 0 ? (
        <div className="alert alert-info">
          <span>No articles found. Click &quot;Create New Article&quot; to get started.</span>
        </div>
      ) : (
        <>
          {articles.map((article) => (
            <ArticleItem
              key={article.slug}
              slug={article.slug}
              title={article.title}
              description={article.description}
              favoritesCount={article.favoritesCount}
              favorited={article.favorited}
              tagList={article.tagList}
              author={article.author}
              createdAt={article.createdAt}
              status={article.status}
              onView={handleViewArticle}
              onEdit={handleEditArticle}
              onDelete={handleDeleteArticle}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Per Page</span>
              </label>
              <select
                className="select select-bordered"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="join">
              {Array.from({ length: Math.ceil(articlesCount / itemsPerPage) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`join-item btn ${page === p ? 'btn-active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleManagement;