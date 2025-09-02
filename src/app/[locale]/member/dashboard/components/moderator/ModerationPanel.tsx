'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { parseCookies } from 'nookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.online';

interface ModerationRequest {
  id: number;
  entityType: string;
  entityId: number;
  status: string;
  requestNote: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  requesterId: number;
  reviewerId: number | null;
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
  entityDetails: any; // This will vary based on entityType
}

const ModerationPanel: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<ModerationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  };

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const token = getCookie('token');
      if (!token) {
        throw new Error('Authorization token not found. Please log in.');
      }

      const response = await fetch(`${API_URL}/api/moderation/requests?status=PENDING`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: ModerationRequest[] = await response.json();
      setPendingRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleModerate = async (requestId: number, status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION', reviewNote: string = '') => {
    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error('Authorization token not found. Please log in.');
      }

      const response = await fetch(`${API_URL}/api/moderation/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, reviewNote })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update moderation request');
      }

      // Refresh the list of pending requests
      fetchPendingRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to moderate request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error mb-6">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Moderation Panel</h2>
      {pendingRequests.length === 0 ? (
        <div className="alert alert-info">
          <span>No pending moderation requests.</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingRequests.map((request) => (
            <div key={request.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Request ID: {request.id} - {request.entityType}</h3>
                <p><strong>Entity ID:</strong> {request.entityId}</p>
                <p><strong>Status:</strong> {request.status}</p>
                <p><strong>Requested by:</strong> {request.requester.name}</p>
                {request.requestNote && <p><strong>Requester Note:</strong> {request.requestNote}</p>}
                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-success"
                    onClick={() => handleModerate(request.id, 'APPROVED')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      const note = prompt('Enter review note for NEEDS_REVISION:');
                      if (note !== null) handleModerate(request.id, 'NEEDS_REVISION', note);
                    }}
                  >
                    Needs Revision
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={() => {
                      const note = prompt('Enter review note for REJECTED:');
                      if (note !== null) handleModerate(request.id, 'REJECTED', note);
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;
