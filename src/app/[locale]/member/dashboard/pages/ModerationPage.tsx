'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Clock,
  FileText,
  Link,
  ShoppingCart,
  MessageCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuthContext } from '../providers/AuthProvider';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Custom Components
import { ArticleModerationCard, ArticleWithRequests, ModerationRequest, EntityType, RequestStatus } from '../components/moderator/ArticleModerationCard';
import { BulkActionBar } from '../components/moderator/BulkActionBar';

// API base URL
const API_BASE_URL = 'https://api.chanomhub.online/api/graphql';

interface Statistics {
  pendingRequests: number;
  needsRevisionRequests: number;
  articleRequests: number;
  downloadLinkRequests: number;
  officialSourceRequests: number;
  commentRequests: number;
}

export const ModerationPage: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuthContext();

  // Data states
  const [requests, setRequests] = useState<ModerationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<EntityType | 'ALL'>('ALL');
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set());
  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
  const [userRole, setUserRole] = useState<'MODERATOR' | 'ADMIN' | null>(null);

  // API call helper
  const fetchData = useCallback(async (query: string, variables: object = {}) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      if (!token) {
        setError('Authentication required: Please log in');
        window.location.href = '/login';
        return null;
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.errors?.[0]?.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      return data.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      throw new Error(message);
    }
  }, []);

  // Load moderation requests
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `
        query GetModerationRequests($status: RequestStatus!) {
          moderate {
            moderationRequests(status: $status) {
              id
              entityId
              entityType
              status
              requestNote
              reviewNote
              createdAt
              updatedAt
              requester {
                id
                name
                image
              }
              reviewer {
                id
                name
                image
              }
              entityDetails {
                ... on ArticleDetails {
                  id
                  title
                  slug
                  status
                  description
                  mainImage
                  images { url }
                  author { name, image }
                }
                ... on DownloadLinkDetails {
                  id
                  name
                  url
                  status
                  articleId
                }
                ... on OfficialDownloadSourceDetails {
                  id
                  name
                  url
                  status
                  articleId
                }
                ... on CommentDetails {
                  id
                  content
                  status
                  articleId
                }
              }
            }
          }
        }
      `;

      const [pendingResult, needsRevisionResult] = await Promise.all([
        fetchData(query, { status: 'PENDING' }),
        fetchData(query, { status: 'NEEDS_REVISION' }),
      ]);

      if (pendingResult || needsRevisionResult) {
        const combinedRequests = [
          ...(pendingResult?.moderate?.moderationRequests || []),
          ...(needsRevisionResult?.moderate?.moderationRequests || []),
        ];
        setRequests(combinedRequests);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load requests';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Check user role
  useEffect(() => {
    if (user?.rank) {
      setUserRole(user.rank === 'ADMIN' ? 'ADMIN' : 'MODERATOR');
    }
  }, [user]);

  // Auto-dismiss messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Initialize data
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Calculate statistics
  const stats: Statistics = useMemo(() => ({
    pendingRequests: requests.filter(r => r.status === 'PENDING').length,
    needsRevisionRequests: requests.filter(r => r.status === 'NEEDS_REVISION').length,
    articleRequests: requests.filter(r => r.entityType === 'ARTICLE').length,
    downloadLinkRequests: requests.filter(r => r.entityType === 'DOWNLOAD_LINK').length,
    officialSourceRequests: requests.filter(r => r.entityType === 'OFFICIAL_DOWNLOAD_SOURCE').length,
    commentRequests: requests.filter(r => r.entityType === 'COMMENT').length,
  }), [requests]);

  // Group requests by article (for article-centric view)
  const articlesWithRequests: ArticleWithRequests[] = useMemo(() => {
    const articleMap = new Map<number, ArticleWithRequests>();

    requests.forEach((request) => {
      let articleId: number;
      let articleTitle: string;
      let articleSlug: string;
      let articleDescription: string;
      let mainImage: string | null = null;
      let images: { url: string }[] = [];
      let author: { name: string; image: string | null } | null = null;

      if (request.entityType === 'ARTICLE' && request.entityDetails) {
        articleId = request.entityDetails.id;
        articleTitle = request.entityDetails.title || 'Untitled Article';
        articleSlug = request.entityDetails.slug || '';
        articleDescription = request.entityDetails.description || '';
        mainImage = request.entityDetails.mainImage || null;
        images = request.entityDetails.images || [];
        author = request.entityDetails.author || null;
      } else if (request.entityDetails?.articleId) {
        articleId = request.entityDetails.articleId;
        // For non-article entities, we need to find the article info from other requests
        const articleRequest = requests.find(
          r => r.entityType === 'ARTICLE' && r.entityDetails?.id === articleId
        );
        if (articleRequest?.entityDetails) {
          articleTitle = articleRequest.entityDetails.title || 'Untitled Article';
          articleSlug = articleRequest.entityDetails.slug || '';
          articleDescription = articleRequest.entityDetails.description || '';
          mainImage = articleRequest.entityDetails.mainImage || null;
          images = articleRequest.entityDetails.images || [];
          author = articleRequest.entityDetails.author || null;
        } else {
          articleTitle = `Article #${articleId}`;
          articleSlug = '';
          articleDescription = '';
        }
      } else {
        // For entities without articleId, group by negative entityId to keep them separate
        articleId = -request.entityId;
        articleTitle = request.entityDetails?.name || request.entityDetails?.content?.substring(0, 30) || 'Unknown';
        articleSlug = '';
        articleDescription = '';
      }

      if (!articleMap.has(articleId)) {
        articleMap.set(articleId, {
          articleId,
          articleTitle,
          articleSlug,
          articleDescription,
          mainImage,
          images,
          author,
          requests: [],
          requester: request.requester,
        });
      }

      const article = articleMap.get(articleId)!;
      article.requests.push(request);

      // Update article info if we have better data
      if (request.entityType === 'ARTICLE' && request.entityDetails) {
        article.mainImage = request.entityDetails.mainImage || article.mainImage;
        article.images = request.entityDetails.images || article.images;
        article.author = request.entityDetails.author || article.author;
        article.articleDescription = request.entityDetails.description || article.articleDescription;
      }
    });

    return Array.from(articleMap.values());
  }, [requests]);

  // Filter articles based on search and filter
  const filteredArticles = useMemo(() => {
    let filtered = articlesWithRequests;

    // Filter by entity type
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(article =>
        article.requests.some(r => r.entityType === activeFilter)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.articleTitle.toLowerCase().includes(search) ||
        article.articleDescription.toLowerCase().includes(search) ||
        article.requester.name.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [articlesWithRequests, activeFilter, searchTerm]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  // Toggle article selection
  const toggleArticleSelect = (articleId: number) => {
    setSelectedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // Toggle request selection
  const toggleRequestSelect = (requestId: number) => {
    setSelectedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  // Toggle expand
  const toggleExpand = (articleId: number) => {
    setExpandedArticle(prev => prev === articleId ? null : articleId);
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedArticles.size === filteredArticles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(filteredArticles.map(a => a.articleId)));
    }
  };

  // Update moderation status
  const updateModerationStatus = async (requestId: number, status: RequestStatus, reviewNote: string) => {
    const mutation = `
      mutation UpdateModerationStatus($input: UpdateModerationStatusInput!) {
        updateModerationStatus(input: $input) {
          id
          status
          reviewNote
        }
      }
    `;

    await fetchData(mutation, {
      input: {
        id: requestId.toString(),
        status,
        reviewNote,
      }
    });
  };

  // Approve single request
  const handleApproveRequest = async (requestId: number, reviewNote: string) => {
    try {
      setLoading(true);
      await updateModerationStatus(requestId, 'APPROVED', reviewNote);
      setSuccess('Request approved successfully');
      await loadRequests();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to approve';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Reject single request
  const handleRejectRequest = async (requestId: number, reviewNote: string) => {
    try {
      setLoading(true);
      await updateModerationStatus(requestId, 'REJECTED', reviewNote);
      setSuccess('Request rejected successfully');
      await loadRequests();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reject';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk approve
  const handleApproveAll = async (requestIds: number[], reviewNote: string) => {
    try {
      setLoading(true);
      for (const id of requestIds) {
        await updateModerationStatus(id, 'APPROVED', reviewNote);
      }
      setSuccess(`${requestIds.length} requests approved successfully`);
      await loadRequests();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to approve';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk reject
  const handleRejectAll = async (requestIds: number[], reviewNote: string) => {
    try {
      setLoading(true);
      for (const id of requestIds) {
        await updateModerationStatus(id, 'REJECTED', reviewNote);
      }
      setSuccess(`${requestIds.length} requests rejected successfully`);
      await loadRequests();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reject';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk approve selected articles
  const handleApproveSelected = async () => {
    const requestIds = filteredArticles
      .filter(a => selectedArticles.has(a.articleId))
      .flatMap(a => a.requests.map(r => r.id));
    await handleApproveAll(requestIds, '');
    setSelectedArticles(new Set());
  };

  // Bulk reject selected articles
  const handleRejectSelected = async () => {
    const requestIds = filteredArticles
      .filter(a => selectedArticles.has(a.articleId))
      .flatMap(a => a.requests.map(r => r.id));
    await handleRejectAll(requestIds, '');
    setSelectedArticles(new Set());
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Auth error state
  if (authError) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-6">
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Moderation Dashboard
            </h1>
            <p className="text-muted-foreground">
              Article-centric review • {filteredArticles.length} articles with pending requests
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
            className="bg-white/50 hover:bg-white/80 dark:bg-gray-800/50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400">
          <Check className="w-4 h-4" />
          <AlertDescription className="flex items-center justify-between">
            {success}
            <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pendingRequests}</p>
              </div>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Needs Revision</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.needsRevisionRequests}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Articles</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.articleRequests}</p>
              </div>
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600">Downloads</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.downloadLinkRequests}</p>
              </div>
              <Link className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600">Official</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.officialSourceRequests}</p>
              </div>
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-pink-600">Comments</p>
                <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">{stats.commentRequests}</p>
              </div>
              <MessageCircle className="h-5 w-5 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles, authors..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'ARTICLE', 'DOWNLOAD_LINK', 'OFFICIAL_DOWNLOAD_SOURCE', 'COMMENT'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={activeFilter === filter ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {filter === 'ALL' && 'All'}
                  {filter === 'ARTICLE' && <><FileText className="w-4 h-4 mr-1" /> Articles</>}
                  {filter === 'DOWNLOAD_LINK' && <><Link className="w-4 h-4 mr-1" /> Downloads</>}
                  {filter === 'OFFICIAL_DOWNLOAD_SOURCE' && <><ShoppingCart className="w-4 h-4 mr-1" /> Official</>}
                  {filter === 'COMMENT' && <><MessageCircle className="w-4 h-4 mr-1" /> Comments</>}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {filteredArticles.length > 0 && (
        <BulkActionBar
          totalCount={filteredArticles.length}
          selectedCount={selectedArticles.size}
          isAllSelected={selectedArticles.size === filteredArticles.length && filteredArticles.length > 0}
          onSelectAll={handleSelectAll}
          onApproveSelected={handleApproveSelected}
          onRejectSelected={handleRejectSelected}
          loading={loading}
        />
      )}

      {/* Loading State */}
      {loading && !refreshing && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm text-muted-foreground">Loading moderation requests...</p>
          </div>
        </div>
      )}

      {/* Articles List */}
      {!loading && filteredArticles.length === 0 && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">
              {requests.length === 0 ? 'No moderation requests' : 'No results matching your search'}
            </p>
            {searchTerm && (
              <Button variant="link" size="sm" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && filteredArticles.length > 0 && (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <ArticleModerationCard
              key={article.articleId}
              article={article}
              isSelected={selectedArticles.has(article.articleId)}
              isExpanded={expandedArticle === article.articleId}
              selectedRequests={selectedRequests}
              onToggleSelect={toggleArticleSelect}
              onToggleExpand={toggleExpand}
              onToggleRequestSelect={toggleRequestSelect}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
              onApproveAll={handleApproveAll}
              onRejectAll={handleRejectAll}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationPage;