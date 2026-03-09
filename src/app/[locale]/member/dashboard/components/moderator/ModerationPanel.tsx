'use client';

import React, { useState, useEffect, useCallback } from 'react';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com/api/graphql';

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

// Icon helper since HeroIcons was used in other files
function IdentificationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
    </svg>
  );
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
                ... on DeveloperProfileDetails {
                  id
                  realName
                  bankType
                  bankName
                  bankAccount
                  swiftCode
                  bankAddress
                  citizenId
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
                
                {request.entityType === 'DEVELOPER_PROFILE' && request.entityDetails && (
                  <div className="mt-4 p-4 bg-base-200 rounded-lg border border-base-300">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <IdentificationIcon className="h-5 w-5" />
                      Applicant Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <p><strong>Real Name:</strong> {request.entityDetails.realName}</p>
                      <p><strong>Bank Type:</strong> {request.entityDetails.bankType}</p>
                      <p><strong>Bank Name:</strong> {request.entityDetails.bankName}</p>
                      <p><strong>Account:</strong> {request.entityDetails.bankAccount}</p>
                      {request.entityDetails.swiftCode && <p><strong>SWIFT:</strong> {request.entityDetails.swiftCode}</p>}
                      {request.entityDetails.citizenId && <p><strong>ID/Passport:</strong> {request.entityDetails.citizenId}</p>}
                      {request.entityDetails.bankAddress && (
                        <p className="col-span-full"><strong>Bank Address:</strong> {request.entityDetails.bankAddress}</p>
                      )}
                    </div>
                  </div>
                )}

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