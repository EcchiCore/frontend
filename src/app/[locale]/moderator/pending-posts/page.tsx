"use client"
import React, { useState, useEffect, useCallback } from "react";
import { Search, Eye, Check, X, Clock, Trash2, AlertTriangle, FileText, Link, MessageCircle, RefreshCw, AlertCircle } from "lucide-react";

// Define types
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION";
type EntityType = "ARTICLE" | "DOWNLOAD_LINK" | "COMMENT";
type EntityStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "DELETED" | "PENDING_REVIEW" | "PENDING" | "NEEDS_REVISION";

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
const API_BASE_URL = "https://api.chanomhub.online/api";

// Get auth token from cookies (you'll need to install js-cookie or implement your own cookie handler)
const getAuthToken = () => {
  // Simple cookie parser for token
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

const StatusBadge = ({ status }: { status: RequestStatus | EntityStatus }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "badge-warning";
      case "APPROVED":
      case "PUBLISHED":
        return "badge-success";
      case "REJECTED":
      case "DELETED":
        return "badge-error";
      case "NEEDS_REVISION":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  return (
    <div className={`badge ${getStatusStyle(status)} badge-sm`}>
      {status.replace("_", " ")}
    </div>
  );
};

const EntityIcon = ({ type }: { type: EntityType }) => {
  switch (type) {
    case "ARTICLE":
      return <FileText className="w-4 h-4" />;
    case "DOWNLOAD_LINK":
      return <Link className="w-4 h-4" />;
    case "COMMENT":
      return <MessageCircle className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export default function ModerationDashboard() {
  const [requests, setRequests] = useState<ModerationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ModerationRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState<EntityType | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ModerationRequest | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [userRole, setUserRole] = useState<"MODERATOR" | "ADMIN" | null>(null);

  // API states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate statistics
  const stats: Statistics = {
    pendingRequests: requests.filter(r => r.status === "PENDING").length,
    needsRevisionRequests: requests.filter(r => r.status === "NEEDS_REVISION").length,
    articleRequests: requests.filter(r => r.entityType === "ARTICLE").length,
    downloadLinkRequests: requests.filter(r => r.entityType === "DOWNLOAD_LINK").length,
    commentRequests: requests.filter(r => r.entityType === "COMMENT").length,
  };

  // API call helper
  const fetchData = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required: Please log in");
        window.location.href = "/login";
        return null;
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...options.headers,
      };

      if (options.method !== 'DELETE') {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          const data = await response.json();
          throw new Error(data.message || "You do not have permission to perform this action");
        } else if (response.status === 401) {
          throw new Error("Session expired: Please log in again");
        } else if (response.status === 404) {
          throw new Error("Resource not found");
        } else if (response.status === 204) {
          return { success: true }; // Handle DELETE success
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      throw new Error(err.message || "An error occurred while connecting to the server");
    }
  }, []);

  // Load requests from API
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingResult, needsRevisionResult] = await Promise.all([
        fetchData("/moderation/requests?status=PENDING"),
        fetchData("/moderation/requests?status=NEEDS_REVISION")
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
      const token = getAuthToken();
      if (token) {
        // TODO: Replace with actual API call to get user role
        // For now, assume MODERATOR - you should decode JWT or call user API
        setUserRole("MODERATOR");
      }
    } catch (err) {
      console.error("Failed to check user role:", err);
      setUserRole("MODERATOR");
    }
  }, []);

  // Filter and search functionality
  const filterRequests = useCallback(() => {
    let filtered = requests;

    // Filter by type
    if (activeFilter !== "ALL") {
      filtered = filtered.filter(req => req.entityType === activeFilter);
    }

    // Filter by search term
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
    setReviewComment(request.reviewNote || "");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (action: RequestStatus) => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      setError(null);

      // Check specific conditions
      if (action === "APPROVED" && selectedRequest.entityType === "ARTICLE" && selectedRequest.entityDetails.status !== "PENDING_REVIEW") {
        setError("Cannot approve: Article must be in PENDING_REVIEW status");
        return;
      }

      const result = await fetchData(`/moderation/requests/${selectedRequest.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: action,
          reviewNote: reviewComment,
        }),
      });

      if (result) {
        setSuccess(`Request ${action.toLowerCase()} successfully`);
        setShowReviewModal(false);
        setSelectedRequest(null);
        setReviewComment("");
        await loadRequests(); // Refresh data
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (!window.confirm("Are you sure you want to delete this moderation request?")) return;

    if (userRole !== "ADMIN") {
      setError("Only administrators can delete moderation requests");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await fetchData(`/moderation/requests/${requestId}`, {
        method: "DELETE",
      });

      if (result?.success) {
        setSuccess("Moderation request deleted successfully");
        await loadRequests(); // Refresh data
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
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-2">Moderation Dashboard</h1>
            <p className="text-base-content/70">Manage and review content submissions</p>
          </div>
          <button
            className={`btn btn-circle ${refreshing ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            {!refreshing && <RefreshCw className="w-5 h-5" />}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6">
            <Check className="w-5 h-5" />
            <span>{success}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setSuccess(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-warning">
                <Clock className="w-8 h-8" />
              </div>
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">{stats.pendingRequests}</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-info">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="stat-title">Needs Revision</div>
              <div className="stat-value text-info">{stats.needsRevisionRequests}</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FileText className="w-8 h-8" />
              </div>
              <div className="stat-title">Articles</div>
              <div className="stat-value text-primary">{stats.articleRequests}</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Link className="w-8 h-8" />
              </div>
              <div className="stat-title">Links</div>
              <div className="stat-value text-secondary">{stats.downloadLinkRequests}</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-accent">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Comments</div>
              <div className="stat-value text-accent">{stats.commentRequests}</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="form-control flex-1">
                <div className="input-group">
                  <span className="bg-base-200">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${activeFilter === "ALL" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setActiveFilter("ALL")}
                >
                  All ({requests.length})
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === "ARTICLE" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setActiveFilter("ARTICLE")}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Articles ({stats.articleRequests})
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === "DOWNLOAD_LINK" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setActiveFilter("DOWNLOAD_LINK")}
                >
                  <Link className="w-4 h-4 mr-1" />
                  Links ({stats.downloadLinkRequests})
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === "COMMENT" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setActiveFilter("COMMENT")}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Comments ({stats.commentRequests})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && !refreshing && (
          <div className="flex justify-center items-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        )}

        {/* Requests Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Content</th>
                  <th>Requester</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {!loading && currentRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="text-base-content/50">
                        {filteredRequests.length === 0 && requests.length === 0
                          ? "No moderation requests found"
                          : "No requests found matching your criteria"
                        }
                      </div>
                    </td>
                  </tr>
                )}
                {currentRequests.map((request) => (
                  <tr key={request.id} className="hover">
                    <td className="font-mono text-sm">#{request.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <EntityIcon type={request.entityType} />
                        <span className="text-sm">{request.entityType.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">
                          {request.entityType === "ARTICLE" && (request.entityDetails.title || "Untitled Article")}
                          {request.entityType === "DOWNLOAD_LINK" && (request.entityDetails.name || "Unnamed Link")}
                          {request.entityType === "COMMENT" &&
                            (request.entityDetails.content?.substring(0, 50) || "No content") +
                            (request.entityDetails.content && request.entityDetails.content.length > 50 ? "..." : "")
                          }
                        </div>
                        <div className="text-sm text-base-content/70 truncate">
                          {request.requestNote}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
                            <span className="text-xs">{request.requester.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="text-sm">{request.requester.name}</div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="text-sm text-base-content/70">
                      {formatDate(request.createdAt)}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {(request.status === "PENDING" || request.status === "NEEDS_REVISION") && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReviewRequest(request)}
                            disabled={loading}
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </button>
                        )}
                        {userRole === "ADMIN" && (
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleDeleteRequest(request.id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center p-4">
                <div className="btn-group">
                  <button
                    className="btn btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    «
                  </button>
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
                      <button
                        key={page}
                        className={`btn btn-sm ${currentPage === page ? "btn-active" : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    className="btn btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedRequest && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">
                Review {selectedRequest.entityType.replace("_", " ")} Request
              </h3>

              <div className="space-y-4">
                {/* Entity Details */}
                <div className="bg-base-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Content Details</h4>
                  {selectedRequest.entityType === "ARTICLE" && (
                    <div>
                      <p><strong>Title:</strong> {selectedRequest.entityDetails.title || "Untitled"}</p>
                      <p><strong>Status:</strong> <StatusBadge status={selectedRequest.entityDetails.status} /></p>
                    </div>
                  )}
                  {selectedRequest.entityType === "DOWNLOAD_LINK" && (
                    <div>
                      <p><strong>Name:</strong> {selectedRequest.entityDetails.name || "Unnamed"}</p>
                      <p><strong>URL:</strong> <a href={selectedRequest.entityDetails.url} target="_blank" rel="noopener noreferrer" className="link link-primary">{selectedRequest.entityDetails.url}</a></p>
                    </div>
                  )}
                  {selectedRequest.entityType === "COMMENT" && (
                    <div>
                      <p><strong>Comment:</strong> {selectedRequest.entityDetails.content}</p>
                    </div>
                  )}
                </div>

                {/* Request Note */}
                <div>
                  <h4 className="font-semibold mb-2">Request Note</h4>
                  <p className="text-base-content/70">{selectedRequest.requestNote || "No note provided"}</p>
                </div>

                {/* Warnings */}
                {selectedRequest.status === "NEEDS_REVISION" && (
                  <div className="alert alert-info">
                    <AlertTriangle className="w-4 h-4" />
                    <span>This request is marked as NEEDS_REVISION. You can reject it or update the review note, but direct approval is not allowed.</span>
                  </div>
                )}

                {selectedRequest.entityType === "ARTICLE" &&
                  selectedRequest.entityDetails.status !== "PENDING_REVIEW" &&
                  selectedRequest.status === "PENDING" && (
                    <div className="alert alert-warning">
                      <AlertTriangle className="w-4 h-4" />
                      <span>This article is currently {selectedRequest.entityDetails.status}. It must be in PENDING_REVIEW status to be approved.</span>
                    </div>
                  )}

                {/* Review Comment */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Review Comment</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    placeholder="Add your review comment..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => setShowReviewModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className={`btn btn-error ${loading ? 'loading' : ''}`}
                  onClick={() => handleSubmitReview("REJECTED")}
                  disabled={loading}
                >
                  {!loading && <X className="w-4 h-4 mr-1" />}
                  Reject
                </button>
                <button
                  className={`btn btn-warning ${loading ? 'loading' : ''}`}
                  onClick={() => handleSubmitReview("NEEDS_REVISION")}
                  disabled={loading}
                >
                  {!loading && <AlertTriangle className="w-4 h-4 mr-1" />}
                  Needs Revision
                </button>
                <button
                  className={`btn btn-success ${loading ? 'loading' : ''}`}
                  onClick={() => handleSubmitReview("APPROVED")}
                  disabled={
                    loading ||
                    selectedRequest.status === "NEEDS_REVISION" ||
                    (selectedRequest.entityType === "ARTICLE" &&
                      selectedRequest.entityDetails.status !== "PENDING_REVIEW")
                  }
                >
                  {!loading && <Check className="w-4 h-4 mr-1" />}
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}