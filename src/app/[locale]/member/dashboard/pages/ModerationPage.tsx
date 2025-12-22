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
import { useAppSelector } from '@/store/hooks';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Custom Components
import {
  ArticleModerationCard,
  ArticleModerationGroup,
  ModerationRequest,
  EntityType,
  RequestStatus
} from '../components/moderator/ArticleModerationCard';
import { BulkActionBar } from '../components/moderator/BulkActionBar';

// API base URL
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "https://api.chanomhub.com"}/api/graphql`;

interface Statistics {
  totalGroups: number;
  totalRequests: number;
  articleRequests: number;
  downloadRequests: number;
  officialRequests: number;
  commentRequests: number;
}

export const ModerationPage: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAppSelector((state) => state.auth);

  // Data states
  const [groups, setGroups] = useState<ArticleModerationGroup[]>([]);
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

  // Load moderation groups using new API
  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `
        query GetArticleModerationGroups($status: RequestStatus!) {
          moderate {
            articleModerationGroups(status: $status) {
              article {
                id
                title
                slug
                mainImage
                description
                images { url }
                author {
                  id
                  name
                  image
                }
              }
              requests {
                id
                entityId
                entityType
                status
                requestNote
                reviewNote
                createdAt
                requester {
                  id
                  name
                  image
                }
                entityDetails {
                  ... on DownloadLinkDetails {
                    name
                    url
                  }
                  ... on OfficialDownloadSourceDetails {
                    name
                    url
                  }
                  ... on CommentDetails {
                    content
                  }
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

      // Merge results from both statuses
      const pendingGroups = pendingResult?.moderate?.articleModerationGroups || [];
      const revisionGroups = needsRevisionResult?.moderate?.articleModerationGroups || [];

      // Merge groups by article ID
      const groupMap = new Map<number, ArticleModerationGroup>();

      [...pendingGroups, ...revisionGroups].forEach((group: ArticleModerationGroup) => {
        const articleId = group.article.id;
        if (groupMap.has(articleId)) {
          // Merge requests
          const existing = groupMap.get(articleId)!;
          const existingIds = new Set(existing.requests.map(r => r.id));
          group.requests.forEach(req => {
            if (!existingIds.has(req.id)) {
              existing.requests.push(req);
            }
          });
        } else {
          groupMap.set(articleId, { ...group });
        }
      });

      setGroups(Array.from(groupMap.values()));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

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
    loadGroups();
  }, [loadGroups]);

  // Calculate statistics
  const stats: Statistics = useMemo(() => {
    const allRequests = groups.flatMap(g => g.requests);
    return {
      totalGroups: groups.length,
      totalRequests: allRequests.length,
      articleRequests: allRequests.filter(r => r.entityType === 'ARTICLE').length,
      downloadRequests: allRequests.filter(r => r.entityType === 'DOWNLOAD_LINK').length,
      officialRequests: allRequests.filter(r => r.entityType === 'OFFICIAL_DOWNLOAD_SOURCE').length,
      commentRequests: allRequests.filter(r => r.entityType === 'COMMENT').length,
    };
  }, [groups]);

  // Filter groups based on search and filter
  const filteredGroups = useMemo(() => {
    let filtered = groups;

    // Filter by entity type
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(group =>
        group.requests.some(r => r.entityType === activeFilter)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(group =>
        group.article.title.toLowerCase().includes(search) ||
        group.article.slug.toLowerCase().includes(search) ||
        group.requests.some(r => r.requester.name.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [groups, activeFilter, searchTerm]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
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
    if (selectedArticles.size === filteredGroups.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(filteredGroups.map(g => g.article.id)));
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
      await loadGroups();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
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
      await loadGroups();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
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
      setSuccess(`${requestIds.length} requests approved`);
      await loadGroups();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
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
      setSuccess(`${requestIds.length} requests rejected`);
      await loadGroups();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  // Bulk approve selected articles
  const handleApproveSelected = async () => {
    const requestIds = filteredGroups
      .filter(g => selectedArticles.has(g.article.id))
      .flatMap(g => g.requests.map(r => r.id));
    await handleApproveAll(requestIds, '');
    setSelectedArticles(new Set());
  };

  // Bulk reject selected articles
  const handleRejectSelected = async () => {
    const requestIds = filteredGroups
      .filter(g => selectedArticles.has(g.article.id))
      .flatMap(g => g.requests.map(r => r.id));
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
              {filteredGroups.length} articles • {stats.totalRequests} pending requests
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
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
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Clock} label="Articles" value={stats.totalGroups} color="yellow" />
        <StatCard icon={AlertTriangle} label="Requests" value={stats.totalRequests} color="blue" />
        <StatCard icon={FileText} label="Article" value={stats.articleRequests} color="purple" />
        <StatCard icon={Link} label="Downloads" value={stats.downloadRequests} color="green" />
        <StatCard icon={ShoppingCart} label="Official" value={stats.officialRequests} color="orange" />
        <StatCard icon={MessageCircle} label="Comments" value={stats.commentRequests} color="pink" />
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
                placeholder="Search articles..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterButton active={activeFilter === 'ALL'} onClick={() => setActiveFilter('ALL')}>
                All
              </FilterButton>
              <FilterButton active={activeFilter === 'ARTICLE'} onClick={() => setActiveFilter('ARTICLE')}>
                <FileText className="w-4 h-4" /> Articles
              </FilterButton>
              <FilterButton active={activeFilter === 'DOWNLOAD_LINK'} onClick={() => setActiveFilter('DOWNLOAD_LINK')}>
                <Link className="w-4 h-4" /> Downloads
              </FilterButton>
              <FilterButton active={activeFilter === 'OFFICIAL_DOWNLOAD_SOURCE'} onClick={() => setActiveFilter('OFFICIAL_DOWNLOAD_SOURCE')}>
                <ShoppingCart className="w-4 h-4" /> Official
              </FilterButton>
              <FilterButton active={activeFilter === 'COMMENT'} onClick={() => setActiveFilter('COMMENT')}>
                <MessageCircle className="w-4 h-4" /> Comments
              </FilterButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {filteredGroups.length > 0 && (
        <BulkActionBar
          totalCount={filteredGroups.length}
          selectedCount={selectedArticles.size}
          isAllSelected={selectedArticles.size === filteredGroups.length && filteredGroups.length > 0}
          onSelectAll={handleSelectAll}
          onApproveSelected={handleApproveSelected}
          onRejectSelected={handleRejectSelected}
          loading={loading}
        />
      )}

      {/* Loading State */}
      {loading && !refreshing && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredGroups.length === 0 && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center gap-3 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">
              {groups.length === 0 ? 'No pending requests' : 'No results matching your search'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Article Groups List */}
      {!loading && filteredGroups.length > 0 && (
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <ArticleModerationCard
              key={group.article.id}
              group={group}
              isSelected={selectedArticles.has(group.article.id)}
              isExpanded={expandedArticle === group.article.id}
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

// Helper components
const StatCard = ({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) => (
  <Card className={`bg-gradient-to-br from-${color}-50 to-${color}-50/50 dark:from-${color}-950/20 dark:to-${color}-950/10 border-${color}-200/50`}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium text-${color}-600`}>{label}</p>
          <p className={`text-2xl font-bold text-${color}-900 dark:text-${color}-100`}>{value}</p>
        </div>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
    </CardContent>
  </Card>
);

const FilterButton = ({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Button
    variant={active ? 'default' : 'outline'}
    size="sm"
    onClick={onClick}
    className={`gap-1 ${active ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
  >
    {children}
  </Button>
);

export default ModerationPage;