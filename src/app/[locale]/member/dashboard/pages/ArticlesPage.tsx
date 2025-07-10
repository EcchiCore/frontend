// dashboard/pages/ArticlesPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  HeartIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useUserData } from '../hooks/useUserData';
import { useAuthContext } from '../providers/AuthProvider';
import { Article } from '../utils/types';
import { ARTICLE_STATUS, ITEMS_PER_PAGE_OPTIONS } from '../utils/constants';
import Image from 'next/image';
import myImageLoader from "../../../lib/imageLoader";


export const ArticlesPage: React.FC = () => {
  const { user } = useAuthContext();
  const {
    articles,
    articlesCount,
    loading,
    error,
    fetchArticles,
    toggleFavorite,
    deleteArticle
  } = useUserData();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [feedMode, setFeedMode] = useState(false);

  // Fetch articles on component mount and when filters change
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    fetchArticles({
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit: itemsPerPage,
      offset,
      feedMode
    });
  }, [fetchArticles, statusFilter, currentPage, itemsPerPage, feedMode]);

  // Filter articles based on search term
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle favorite toggle
  const handleToggleFavorite = async (article: Article) => {
    try {
      await toggleFavorite(article.slug, article.favorited);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Handle article deletion
  const handleDeleteArticle = async (article: Article) => {
    if (!window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
      return;
    }

    try {
      await deleteArticle(article.slug);
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert('Failed to delete article. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(articlesCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, articlesCount);

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6" />
            {feedMode ? 'Article Feed' : 'My Articles'}
          </h1>
          <p className="text-base-content/70 mt-1">
            {feedMode ? 'Discover articles from other writers' : 'Manage your published content'}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Toggle Feed Mode */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Feed Mode</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={feedMode}
                onChange={(e) => setFeedMode(e.target.checked)}
              />
            </label>
          </div>

          {!feedMode && (
            <button className="btn btn-primary">
              <PlusIcon className="h-4 w-4" />
              New Article
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="form-control">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-square">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              className="btn btn-outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-base-300">
              {/* Status Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select select-bordered"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={feedMode}
                >
                  <option value="all">All Status</option>
                  <option value={ARTICLE_STATUS.PUBLISHED}>Published</option>
                  <option value={ARTICLE_STATUS.DRAFT}>Draft</option>
                  <option value={ARTICLE_STATUS.PENDING}>Pending</option>
                </select>
              </div>

              {/* Items per page */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Items per page</span>
                </label>
                <select
                  className="select select-bordered"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  {ITEMS_PER_PAGE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content mb-2">
            {searchTerm ? 'No articles found' : (feedMode ? 'No articles in feed' : 'No articles yet')}
          </h3>
          <p className="text-base-content/70">
            {searchTerm
              ? 'Try adjusting your search terms or filters'
              : (feedMode
                  ? 'Follow some writers to see their articles here'
                  : 'Create your first article to get started'
              )
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div key={article.slug} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Article Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="avatar avatar-xs">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                          {article.author.image ? (
                            <Image
                              src={article.author.image}
                              alt={article.author.username}
                              width={24}
                              height={24}
                              loader={myImageLoader}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            article.author.username.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-base-content/70">
                        {article.author.username}
                      </span>
                      <span className="text-xs text-base-content/50">•</span>
                      <span className="text-xs text-base-content/50">
                        {formatDate(article.createdAt)}
                      </span>

                      {/* Status Badge */}
                      <div className={`badge badge-sm ${
                        article.status === (ARTICLE_STATUS.PUBLISHED as Article['status']) ? 'badge-success' :
                          article.status === (ARTICLE_STATUS.DRAFT as Article['status']) ? 'badge-warning' :
                            'badge-info'
                      }`}>
                        {article.status}
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 className="card-title text-lg mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-base-content/70 mb-3 line-clamp-3">
                      {article.description}
                    </p>

                    {/* Tags */}
                    {article.tagList.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tagList.slice(0, 5).map((tag, index) => (
                          <span key={index} className="badge badge-outline badge-sm">
                            {tag}
                          </span>
                        ))}
                        {article.tagList.length > 5 && (
                          <span className="badge badge-outline badge-sm">
                            +{article.tagList.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-base-content/60">
                      <span className="flex items-center gap-1">
                        <HeartIcon className="h-4 w-4" />
                        {article.favoritesCount}
                      </span>
                    </div>
                  </div>

                  {/* Article Image */}
                  {article.mainImage && (
                    <div className="ml-4">
                      <Image
                        src={article.mainImage}
                        alt={article.title}
                        width={96}
                        height={96}
                        loader={myImageLoader}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="card-actions justify-end mt-4">
                  <button
                    className={`btn btn-sm ${article.favorited ? 'btn-error' : 'btn-outline'}`}
                    onClick={() => handleToggleFavorite(article)}
                  >
                    {article.favorited ? (
                      <HeartSolidIcon className="h-4 w-4" />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                    {article.favorited ? 'Unfavorite' : 'Favorite'}
                  </button>

                  <button className="btn btn-sm btn-outline">
                    <EyeIcon className="h-4 w-4" />
                    View
                  </button>

                  {/* Show edit/delete only for own articles */}
                  {!feedMode && article.author.username === user?.username && (
                    <>
                      <button className="btn btn-sm btn-outline">
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline btn-error"
                        onClick={() => handleDeleteArticle(article)}
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-base-content/70">
            Showing {startIndex}-{endIndex} of {articlesCount} articles
          </div>

          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className="join-item btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && articles.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}
    </div>
  );
};