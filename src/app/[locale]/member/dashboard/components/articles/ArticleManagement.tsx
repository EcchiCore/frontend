'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import ArticleItem from './ArticleItem';
import { getSdk } from '@/lib/sdk';
import { ArticleListItem, ArticleListOptions, ArticleStatus } from '@chanomhub/sdk';

// Use ArticleListItem from SDK, but we might need to cast or adapt if ArticleItem expects more.
// For now, let's treat the state as holding SDK items.
type AnyArticle = any;

const ArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<AnyArticle[]>([]);
  const [articlesCount, setArticlesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const router = useRouter();

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const sdk = await getSdk();
      const offset = (page - 1) * itemsPerPage;

      const options: ArticleListOptions = {
        limit: itemsPerPage,
        offset: offset,
        filter: {}
      };

      // Set filters
      if (tagFilter && options.filter) options.filter.tag = tagFilter;

      // Cast string to ArticleStatus (top-level option, not in filter)
      if (statusFilter) options.status = statusFilter as ArticleStatus;

      // Try to get "my" articles via author filter - assuming SDK supports 'me' alias or backend handles it
      if (options.filter) options.filter.author = 'me';

      // Use getAllPaginated
      const res = await sdk.articles.getAllPaginated(options);

      const list = res.items;
      const count = res.total;

      setArticles(list);
      setArticlesCount(count);

    } catch (err) {
      console.error('fetchArticles: Error during fetch:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, tagFilter, page, itemsPerPage]);

  useEffect(() => {
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
    setPage(1);
  };

  const handleTagFilterChange = (newTag: string) => {
    setTagFilter(newTag);
    setPage(1);
  };

  const handleFavoriteChange = (slug: string, favorited: boolean, favoritesCount: number) => {
    // Optimistic update
    setArticles(articles.map(article =>
      article.slug === slug ? { ...article, favorited, favoritesCount } : article
    ));
  };

  const handleViewArticle = (slug: string) => {
    window.open(`/articles/${slug}`, '_blank');
  };

  const handleEditArticle = (slug: string) => {
    router.push(`/editor/${slug}`);
  };

  const handleDeleteArticle = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const sdk = await getSdk();
      await sdk.articles.delete(slug);

      setArticles(articles.filter(article => article.slug !== slug));
      setArticlesCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
    }
  };

  const handlePublishRequest = async (slug: string) => {
    if (!window.confirm('Are you sure you want to request publication for this article?')) return;

    try {
      // Fallback to manual fetch for custom endpoint not in SDK yet
      const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
          ?.split('=')[1];
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      };
      const token = getCookie('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL;


      const response = await fetch(`${API_URL}/api/articles/${slug}/publish-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request publication');
      }

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
              // Map SDK named entities (or string) to string[]
              tagList={article.tags ? article.tags.map((t: any) => t.name || t) : (article.tagList || [])}
              author={article.author}
              createdAt={article.createdAt}
              status={article.status}
              onView={() => handleViewArticle(article.slug)}
              onEdit={handleEditArticle}
              onDelete={handleDeleteArticle}
              onFavoriteChange={handleFavoriteChange}
              onPublishRequest={handlePublishRequest}
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