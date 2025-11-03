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
  PlusIcon,
  ArrowUpOnSquareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useUserData } from '../hooks/useUserData';
import { useAuthContext } from '../providers/AuthProvider';
import { Article, ArticleStatus } from '../utils/types';
import { ITEMS_PER_PAGE_OPTIONS } from '../utils/constants';





// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import Link from "next/link";

export const ArticlesPage: React.FC = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [publishingSlug, setPublishingSlug] = useState<string | null>(null);
  const {
    articles,
    articlesCount,
    loading,
    error,
    fetchArticles,
    toggleFavorite,
    deleteArticle,
    publishRequest
  } = useUserData();

  // Local state with explicit typing
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all');
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
    (article.author.name && article.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  // Handle publish request
  const handlePublishRequest = async (article: Article) => {
    setPublishingSlug(article.slug);
    try {
      await publishRequest(article.slug);
      // Optionally, refresh the articles list or update the specific article's status in the state
      await fetchArticles({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        feedMode
      });
    } catch (error) {
      console.error('Failed to request publish:', error);
      alert('Failed to request publish. Please try again.');
    } finally {
      setPublishingSlug(null);
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <DocumentTextIcon className="h-6 w-6" />
            {feedMode ? 'Article Feed' : 'My Articles'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {feedMode ? 'Discover articles from other writers' : 'Manage your published content'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle Feed Mode */}
          <div className="flex items-center space-x-2 text-foreground">
            <Label htmlFor="feed-mode">Feed Mode</Label>
            <Switch
              id="feed-mode"
              checked={feedMode}
              onCheckedChange={setFeedMode}
            />
          </div>

          {!feedMode && (
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              <Link href="/upload/games" >New Article</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ArticleStatus | 'all')}
                  disabled={feedMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={ArticleStatus.PUBLISHED}>Published</SelectItem>
                    <SelectItem value={ArticleStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={ArticleStatus.PENDING_REVIEW}>Pending Review</SelectItem>
                    <SelectItem value={ArticleStatus.ARCHIVED}>Archived</SelectItem>
                    <SelectItem value={ArticleStatus.DELETED}>Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Items per page */}
              <div className="space-y-2">
                <Label>Items per page</Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map(option => (
                      <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'No articles found' : (feedMode ? 'No articles in feed' : 'No articles yet')}
          </h3>
          <p className="text-muted-foreground">
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
            <Card key={article.slug} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Article Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={article.author.image ?? ''} 
                          alt={article.author.name}
                        />
                        <AvatarFallback className="text-xs">
                          {article.author.name && article.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {article.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(article.createdAt)}
                      </span>

                      {/* Status Badge */}
                      <Badge 
                        variant={
                          article.status === ArticleStatus.PUBLISHED ? 'default' :
                          article.status === ArticleStatus.DRAFT ? 'secondary' :
                          article.status === ArticleStatus.PENDING_REVIEW ? 'outline' :
                          article.status === ArticleStatus.ARCHIVED ? 'secondary' :
                          'destructive'
                        }
                        className="text-xs"
                      >
                        {article.status}
                      </Badge>
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-3 line-clamp-3">
                      {article.description}
                    </p>

                    {/* Tags */}
                    {(article.tagList && article.tagList.length > 0) && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tagList.slice(0, 5).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {article.tagList.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tagList.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
  <span className="flex items-center gap-1">
    <HeartIcon className="h-4 w-4" />
    {article.favoritesCount}
  </span>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 mt-4 w-full">
                        <Button
                          variant={article.favorited ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleToggleFavorite(article)}
                        >
                          {article.favorited ? (
                            <HeartSolidIcon className="h-4 w-4 mr-2" />
                          ) : (
                            <HeartIcon className="h-4 w-4 mr-2" />
                          )}
                          {article.favorited ? 'Unfavorite' : 'Favorite'}
                        </Button>

                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View
                        </Button>

                        {/* Show edit/delete only for own articles */}
                        {!feedMode && article.author.name === user?.username && (
                          <>
                            {article.status === ArticleStatus.DRAFT && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePublishRequest(article)}
                                disabled={publishingSlug === article.slug}
                              >
                                {publishingSlug === article.slug ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <ArrowUpOnSquareIcon className="h-4 w-4 mr-2" />
                                )}
                                {publishingSlug === article.slug ? 'Requesting...' : 'Request Publish'}
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => router.push(`/editor/${article.slug}`)}>
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteArticle(article)}
                              className="text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                </div>


              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex}-{endIndex} of {articlesCount} articles
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && articles.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
