
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
  };
}

interface Statistics {
  pendingRequests: number;
  needsRevisionRequests: number;
  articleRequests: number;
  downloadLinkRequests: number;
  commentRequests: number;
}

// API base URL
const API_BASE_URL = 'https://api.chanomhub.online/api';

const StatusBadge = ({ status }: { status: RequestStatus | EntityStatus }) => {
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
  const fetchData = useCallback(async (url: string, options: RequestInit = {}) => {
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

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          const data = await response.json();
          throw new Error(data.message || 'You do not have permission to perform this action');
        } else if (response.status === 401) {
          throw new Error('Session expired: Please log in again');
        } else if (response.status === 404) {
          throw new Error('Resource not found');
        } else if (response.status === 204) {
          return { success: true };
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'An error occurred while connecting to the server');
    }
  }, []);

  // Load requests from API
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingResult, needsRevisionResult] = await Promise.all([
        fetchData('/moderation/requests?status=PENDING'),
        fetchData('/moderation/requests?status=NEEDS_REVISION')
      ]);

      if (pendingResult || needsRevisionResult) {
        const combinedRequests = [
          ...(pendingResult || []),
          ...(needsRevisionResult || []),
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
        req.entityDetails.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.entityDetails.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.entityDetails.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      if (action === 'APPROVED' && selectedRequest.entityType === 'ARTICLE' && selectedRequest.entityDetails.status !== ArticleStatus.PENDING_REVIEW) {
        setError('Cannot approve: Article must be in PENDING_REVIEW status');
        return;
      }

      const result = await fetchData(`/moderation/requests/${selectedRequest.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: action,
          reviewNote: reviewComment,
        }),
      });

      if (result) {
        setSuccess(`Request ${action.toLowerCase()} successfully`);
        setShowReviewModal(false);
        setSelectedRequest(null);
        setReviewComment('');
        await loadRequests();
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

      const result = await fetchData(`/moderation/requests/${requestId}`, {
        method: 'DELETE',
      });

      if (result?.success) {
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
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Moderation Dashboard</h1>
          <p className="text-muted-foreground">Manage and review content submissions</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh data"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Needs Revision</p>
                <p className="text-2xl font-bold text-blue-500">{stats.needsRevisionRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Articles</p>
                <p className="text-2xl font-bold text-purple-500">{stats.articleRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Link className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Links</p>
                <p className="text-2xl font-bold text-green-500">{stats.downloadLinkRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-pink-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold text-pink-500">{stats.commentRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search requests..."
                  className="pl-10"
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
              >
                All ({requests.length})
              </Button>
              <Button
                variant={activeFilter === 'ARTICLE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('ARTICLE')}
              >
                <FileText className="w-4 h-4 mr-1" />
                Articles ({stats.articleRequests})
              </Button>
              <Button
                variant={activeFilter === 'DOWNLOAD_LINK' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('DOWNLOAD_LINK')}
              >
                <Link className="w-4 h-4 mr-1" />
                Links ({stats.downloadLinkRequests})
              </Button>
              <Button
                variant={activeFilter === 'COMMENT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('COMMENT')}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Comments ({stats.commentRequests})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading overlay */}
      {loading && !refreshing && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && currentRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {filteredRequests.length === 0 && requests.length === 0
                        ? 'No moderation requests found'
                        : 'No requests found matching your criteria'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {currentRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">#{request.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EntityIcon type={request.entityType} />
                      <span className="text-sm">{request.entityType.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">
                        {request.entityType === 'ARTICLE' && (request.entityDetails.title || 'Untitled Article')}
                        {request.entityType === 'DOWNLOAD_LINK' && (request.entityDetails.name || 'Unnamed Link')}
                        {request.entityType === 'COMMENT' &&
                          (request.entityDetails.content?.substring(0, 50) || 'No content') +
                          (request.entityDetails.content && request.entityDetails.content.length > 50 ? '...' : '')}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {request.requestNote}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.requester.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {request.requester.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">{request.requester.name}</div>
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
                  {selectedRequest.entityType === 'ARTICLE' && (
                    <div className="space-y-2">
                      <p><strong>Title:</strong> {selectedRequest.entityDetails.title || 'Untitled'}</p>
                      <p><strong>Status:</strong> <StatusBadge status={selectedRequest.entityDetails.status} /></p>
                    </div>
                  )}
                  {selectedRequest.entityType === 'DOWNLOAD_LINK' && (
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedRequest.entityDetails.name || 'Unnamed'}</p>
                      <p><strong>URL:</strong> <a href={selectedRequest.entityDetails.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedRequest.entityDetails.url}</a></p>
                    </div>
                  )}
                  {selectedRequest.entityType === 'COMMENT' && (
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
                selectedRequest.entityDetails.status !== ArticleStatus.PENDING_REVIEW &&
                selectedRequest.status === 'PENDING' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      This article is currently {selectedRequest.entityDetails.status}. It must be in PENDING_REVIEW status to be approved.
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
                selectedRequest?.status === 'NEEDS_REVISION' ||
                (selectedRequest?.entityType === 'ARTICLE' &&
                  selectedRequest?.entityDetails.status !== ArticleStatus.PENDING_REVIEW)
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
