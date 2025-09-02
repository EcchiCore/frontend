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
  const [statusFilter, setStatusFilter] = useState<string>(''); // New state for status filter
  const [tagFilter, setTagFilter] = useState<string>(''); // New state for tag filter
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
    console.log('fetchArticles: Starting fetch...');
    try {
      setLoading(true);
      const token = getCookie('token');
      console.log('fetchArticles: Token:', token ? 'present' : 'missing');
      if (!token) {
        throw new Error('Authorization token not found. Please log in.');
      }

      const offset = (page - 1) * itemsPerPage;
      const queryParams = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(tagFilter && { tag: tagFilter })
      });

      const endpoint = `${API_URL}/api/articles/me?${queryParams}`;
      console.log('fetchArticles: Fetching from:', endpoint);

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('fetchArticles: Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('fetchArticles: API error data:', errorData);
        throw new Error(`API error: ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const data: ArticlesResponse = await response.json();
      console.log('fetchArticles: Fetched articles data:', data);
      setArticles(data.articles);
      setArticlesCount(data.articlesCount);
      setError(null);
    } catch (err) {
      console.error('fetchArticles: Error during fetch:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
      console.log('fetchArticles: Fetch finished. Loading:', false, 'Error:', error);
    }
  }, [statusFilter, tagFilter, page, itemsPerPage, API_URL]);

  useEffect(() => {
    console.log('ArticleManagement: useEffect triggered. Calling fetchArticles...');
    fetchArticles();
  }, [fetchArticles]);

  

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1); // Reset to first page when filter changes
  };

  const handleTagFilterChange = (newTag: string) => {
    setTagFilter(newTag);
    setPage(1); // Reset to first page when filter changes
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

  const handlePublishRequest = async (slug: string) => {
    if (!window.confirm('Are you sure you want to request publication for this article?')) return;

    try {
      const token = getCookie('token');
      if (!token) throw new Error('Authorization required');

      const response = await fetch(`${API_URL}/api/articles/${slug}/publish-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body as per API docs example
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request publication');
      }

      // Optionally, update the article status in the local state to PENDING_REVIEW
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.slug === slug ? { ...article, status: 'PENDING_REVIEW' } : article
        )
      );
      alert('Publication request submitted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request publication');
    }
  };

  const handleCreateArticle = () => {
    router.push('/editor');
  };

  console.log('ArticleManagement: Rendering. Loading:', loading, 'Error:', error, 'Articles count:', articles.length);
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Article Management</h2>
        <button className="btn btn-primary" onClick={handleCreateArticle}>
          <PlusIcon className="h-5 w-5" />
          Create New Article
        </button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <label className="label">
          <span className="label-text">Filter by Status:</span>
        </label>
        <select
          className="select select-bordered"
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
        >
          <option value="">All</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="ARCHIVED">Archived</option>
          <option value="NOT_APPROVED">Not Approved</option>
          <option value="NEEDS_REVISION">Needs Revision</option>
        </select>
        <label className="label">
          <span className="label-text">Filter by Tag:</span>
        </label>
        <input
          type="text"
          name="tagFilter"
          value={tagFilter}
          onChange={(e) => handleTagFilterChange(e.target.value)}
          className="input input-bordered"
          placeholder="Enter tag"
        />
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
              onPublishRequest={handlePublishRequest} // New prop
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