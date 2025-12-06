import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Check, X, Clock, Trash2, AlertTriangle, FileText, Link, MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../providers/AuthProvider';
import { ArticleStatus } from '../utils/types';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

// Define types
type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
type EntityType = 'ARTICLE' | 'DOWNLOAD_LINK' | 'COMMENT';
type EntityStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED' | 'PENDING_REVIEW' | 'PENDING' | 'NEEDS_REVISION';

interface ModerationRequest {
  id: number;
  entityId: number;
  entityType: EntityType;
  requesterId: number;
  reviewerId: number | null;
  status: RequestStatus;
  requestNote: string;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: number;
    name: string;
    image: string | null;
  };
  reviewer: {
    id: number;
    name: string;
    image: string | null;
  } | null;
  entityDetails: {
    id: number;
    title?: string;
    slug?: string;
    url?: string;
    name?: string;
    content?: string;
    status: EntityStatus;
    articleId?: number;
  } | null;
}

interface Statistics {
  pendingRequests: number;
  needsRevisionRequests: number;
  articleRequests: number;
  downloadLinkRequests: number;
  commentRequests: number;
}

// API base URL
const API_BASE_URL = 'https://api.chanomhub.online/api/graphql';

const StatusBadge = ({ status }: { status: RequestStatus | EntityStatus }) => {
  if (!status) {
    return null;
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'APPROVED':
      case 'PUBLISHED':
        return 'default';
      case 'REJECTED':
      case 'DELETED':
        return 'destructive';
      case 'NEEDS_REVISION':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getStatusVariant(status) as any}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

const EntityIcon = ({ type }: { type: EntityType }) => {
  switch (type) {
    case 'ARTICLE':
      return <FileText className="w-4 h-4" />;
    case 'DOWNLOAD_LINK':
      return <Link className="w-4 h-4" />;
    case 'COMMENT':
      return <MessageCircle className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export const ModerationPage: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuthContext();
  const [requests, setRequests] = useState<ModerationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ModerationRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState<EntityType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ModerationRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [userRole, setUserRole] = useState<'MODERATOR' | 'ADMIN' | null>(null);

  // API states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate statistics
  const stats: Statistics = {
    pendingRequests: requests.filter(r => r.status === 'PENDING').length,
    needsRevisionRequests: requests.filter(r => r.status === 'NEEDS_REVISION').length,
    articleRequests: requests.filter(r => r.entityType === 'ARTICLE').length,
    downloadLinkRequests: requests.filter(r => r.entityType === 'DOWNLOAD_LINK').length,
    commentRequests: requests.filter(r => r.entityType === 'COMMENT').length,
  };

  // API call helper
  const fetchData = useCallback(async (query: string, variables: any = {}) => {
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
    } catch (err: any) {
      throw new Error(err.message || "An error occurred while connecting to the server");
    }
  }, []);

  // Load requests from API
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pendingQuery = `
        query GetPendingModerationRequests {
          moderate {
            moderationRequests(status: PENDING) {
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
                  status
                }
                ... on DownloadLinkDetails {
                  id
                  name
                  url
                  status
                }
                ... on OtherDetails {
                  id
                }
              }
            }
          }
        }
      `;

      const needsRevisionQuery = `
        query GetNeedsRevisionModerationRequests {
          moderate {
            moderationRequests(status: NEEDS_REVISION) {
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
                  status
                }
                ... on DownloadLinkDetails {
                  id
                  name
                  url
                  status
                }
                ... on OtherDetails {
                  id
                }
              }
            }
          }
        }
      `;

      const [pendingResult, needsRevisionResult] = await Promise.all([
        fetchData(pendingQuery),
        fetchData(needsRevisionQuery)
      ]);

      if (pendingResult || needsRevisionResult) {
        const combinedRequests = [
          ...(pendingResult?.moderate.moderationRequests || []),
          ...(needsRevisionResult?.moderate.moderationRequests || []),
        ];
        setRequests(combinedRequests);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  // Check user role
  const checkUserRole = useCallback(async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      if (token && user?.rank) {
        setUserRole(user.rank === 'ADMIN' ? 'ADMIN' : 'MODERATOR');
      } else {
        setUserRole('MODERATOR');
      }
    } catch (err) {
      console.error('Failed to check user role:', err);
      setUserRole('MODERATOR');
    }
  }, [user]);

  // Filter and search functionality
  const filterRequests = useCallback(() => {
    let filtered = requests;

    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(req => req.entityType === activeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.entityDetails?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.entityDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.entityDetails?.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestNote.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [requests, activeFilter, searchTerm]);

  useEffect(() => {
    filterRequests();
  }, [filterRequests]);

  // Initialize data
  useEffect(() => {
    checkUserRole();
    loadRequests();
  }, [checkUserRole, loadRequests]);

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

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handleReviewRequest = (request: ModerationRequest) => {
    setSelectedRequest(request);
    setReviewComment(request.reviewNote || '');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (action: RequestStatus) => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      setError(null);

      const mutation = `
        mutation UpdateModerationStatus($input: UpdateModerationStatusInput!) {
          updateModerationStatus(input: $input) {
            id
            status
            reviewNote
          }
        }
      `;

      const result = await fetchData(mutation, {
        input: {
          id: selectedRequest.id.toString(),
          status: action,
          reviewNote: reviewComment,
        }
      });

      if (result) {
        setSuccess(`Request ${action.toLowerCase()} successfully`);
        setShowReviewModal(false);
        setSelectedRequest(null);
        setReviewComment('');
        await loadRequests(); // Refresh data
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (!window.confirm('Are you sure you want to delete this moderation request?')) return;

    if (userRole !== 'ADMIN') {
      setError('Only administrators can delete moderation requests');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const mutation = `
        mutation DeleteModerationRequest($id: ID!) {
          deleteModerationRequest(id: $id)
        }
      `;

      const result = await fetchData(mutation, { id: requestId.toString() });

      if (result) {
        setSuccess('Moderation request deleted successfully');
        await loadRequests();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center h-full">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Moderation Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Manage and review content submissions</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
            className="bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 border-2 hover:border-purple-300 transition-all duration-200"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <Check className="w-4 h-4" />
          <AlertDescription>
            {success}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess(null)}
              className="ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200/50 dark:border-yellow-800/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pendingRequests}</p>
                <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Awaiting review</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Needs Revision</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.needsRevisionRequests}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Requires changes</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Articles</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.articleRequests}</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Content submissions</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Links</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.downloadLinkRequests}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">Download links</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <Link className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200/50 dark:border-pink-800/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Comments</p>
                <p className="text-3xl font-bold text-pink-900 dark:text-pink-100">{stats.commentRequests}</p>
                <p className="text-xs text-pink-600/70 dark:text-pink-400/70">User comments</p>
              </div>
              <div className="p-3 bg-pink-500/10 rounded-full">
                <MessageCircle className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-purple-600" />
            Search & Filter
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search requests..."
                  className="pl-10 focus:ring-2 focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('ALL')}
                className={activeFilter === 'ALL' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'hover:bg-purple-50 dark:hover:bg-purple-950/20'}
              >
                All ({requests.length})
              </Button>
              <Button
                variant={activeFilter === 'ARTICLE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('ARTICLE')}
                className={activeFilter === 'ARTICLE' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'hover:bg-purple-50 dark:hover:bg-purple-950/20'}
              >
                <FileText className="w-4 h-4 mr-1" />
                Articles ({stats.articleRequests})
              </Button>
              <Button
                variant={activeFilter === 'DOWNLOAD_LINK' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('DOWNLOAD_LINK')}
                className={activeFilter === 'DOWNLOAD_LINK' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'hover:bg-purple-50 dark:hover:bg-purple-950/20'}
              >
                <Link className="w-4 h-4 mr-1" />
                Links ({stats.downloadLinkRequests})
              </Button>
              <Button
                variant={activeFilter === 'COMMENT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('COMMENT')}
                className={activeFilter === 'COMMENT' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'hover:bg-purple-50 dark:hover:bg-purple-950/20'}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Comments ({stats.commentRequests})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Requests Table */}
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Moderation Requests
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Content</TableHead>
                <TableHead className="font-semibold">Requester</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && !refreshing && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      <p className="text-sm text-muted-foreground">Loading moderation requests...</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && currentRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        {filteredRequests.length === 0 && requests.length === 0
                          ? 'No moderation requests found'
                          : 'No requests found matching your criteria'}
                      </p>
                      {searchTerm && (
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && currentRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/30 dark:hover:from-gray-800/30 dark:hover:to-gray-700/30 transition-all duration-200 border-b border-gray-200/50 dark:border-gray-700/50">
                  <TableCell className="font-mono text-sm font-medium text-purple-600 dark:text-purple-400">#{request.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/20">
                        <EntityIcon type={request.entityType} />
                      </div>
                      <span className="text-sm font-medium">{request.entityType.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate text-gray-900 dark:text-white">
                        {request.entityType === 'ARTICLE' && (request.entityDetails?.title || 'Untitled Article')}
                        {request.entityType === 'DOWNLOAD_LINK' && (request.entityDetails?.name || 'Unnamed Link')}
                        {request.entityType === 'COMMENT' &&
                          (request.entityDetails?.content?.substring(0, 50) || 'No content') +
                          (request.entityDetails?.content && request.entityDetails.content.length > 50 ? '...' : '')}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {request.requestNote}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border-2 border-gray-200 dark:border-gray-700">
                        <AvatarImage src={request.requester.image || undefined} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                          {request.requester.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium">{request.requester.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(request.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {(request.status === 'PENDING' || request.status === 'NEEDS_REVISION') && (
                        <Button
                          size="sm"
                          onClick={() => handleReviewRequest(request)}
                          disabled={loading}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      )}
                      {userRole === 'ADMIN' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id)}
                          disabled={loading}
                          className="hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center p-4">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  «
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  »
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Review {selectedRequest?.entityType.replace('_', ' ')} Request
            </DialogTitle>
            <DialogDescription>
              Review the content and approve or reject the request.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Content Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedRequest.entityType === 'ARTICLE' && selectedRequest.entityDetails && (
                    <div className="space-y-2">
                      <p><strong>Title:</strong> {selectedRequest.entityDetails.title || 'Untitled'}</p>
                      <p><strong>Status:</strong> <StatusBadge status={selectedRequest.entityDetails.status} /></p>
                    </div>
                  )}
                  {selectedRequest.entityType === 'DOWNLOAD_LINK' && selectedRequest.entityDetails && (
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedRequest.entityDetails.name || 'Unnamed'}</p>
                      <p><strong>URL:</strong> <a href={selectedRequest.entityDetails.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedRequest.entityDetails.url}</a></p>
                    </div>
                  )}
                  {selectedRequest.entityType === 'COMMENT' && selectedRequest.entityDetails && (
                    <div>
                      <p><strong>Comment:</strong> {selectedRequest.entityDetails.content}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <h4 className="font-semibold mb-2">Request Note</h4>
                <p className="text-muted-foreground">{selectedRequest.requestNote || 'No note provided'}</p>
              </div>

              {selectedRequest.status === 'NEEDS_REVISION' && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    This request is marked as NEEDS_REVISION. You can reject it or update the review note, but direct approval is not allowed.
                  </AlertDescription>
                </Alert>
              )}

              {selectedRequest.entityType === 'ARTICLE' &&
                selectedRequest.entityDetails &&
                (selectedRequest.entityDetails.status !== ArticleStatus.PENDING_REVIEW && selectedRequest.entityDetails.status !== 'PENDING') &&
                selectedRequest.status === 'PENDING' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      This article is currently {selectedRequest.entityDetails.status}. It must be in PENDING or PENDING_REVIEW status to be approved.
                    </AlertDescription>
                  </Alert>
                )}
              <div className="space-y-2">
                <Label htmlFor="review-comment" className="font-semibold">Review Comment</Label>
                <Textarea
                  id="review-comment"
                  placeholder="Add your review comment..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleSubmitReview('REJECTED')}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
              Reject
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSubmitReview('NEEDS_REVISION')}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-1" />}
              Needs Revision
            </Button>
            <Button
              onClick={() => handleSubmitReview('APPROVED')}
              disabled={
                loading ||
                !selectedRequest ||
                selectedRequest.status === 'NEEDS_REVISION' ||
                (selectedRequest.entityType === 'ARTICLE' &&
                  (!selectedRequest.entityDetails ||
                    (selectedRequest.entityDetails.status !== ArticleStatus.PENDING_REVIEW &&
                      selectedRequest.entityDetails.status !== 'PENDING')))
              }
            >
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}