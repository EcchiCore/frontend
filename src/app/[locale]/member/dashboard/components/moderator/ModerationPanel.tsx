'use client';

import React, { useState, useEffect, useCallback } from 'react';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.online/api/graphql';

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

  const fetchData = useCallback(async (query: string, variables: any = {}) => {
    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error('Authorization token not found. Please log in.');
      }

      const response = await fetch(API_URL, {
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

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const query = `
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
      const result = await fetchData(query);
      setPendingRequests(result?.moderate.moderationRequests || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleModerate = async (requestId: number, status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION', reviewNote: string = '') => {
    try {
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