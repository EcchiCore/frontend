'use client';

import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import SourceCard from './SourceCard';
import { Source, SourcesResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.online';

export default function ModeratorSources() {
  const [cookies] = useCookies(['token']);
  const [pendingSources, setPendingSources] = useState<Source[]>([]);
  const [updateStatus, setUpdateStatus] = useState({
    id: '',
    status: 'APPROVED' as 'APPROVED' | 'REJECTED',
    reviewNote: '',
  });
  const [error, setError] = useState('');
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    if (cookies.token) {
      try {
        const payload = JSON.parse(atob(cookies.token.split('.')[1]));
        setIsModerator(payload.rank === 'MODERATOR' || payload.rank === 'ADMIN');
      } catch {
        setError('Invalid token');
      }
    }
  }, [cookies.token]);

  const fetchPendingSources = async () => {
    if (!isModerator) {
      setError('Unauthorized: Moderator or Admin role required');
      return;
    }
    try {
      const response = await axios.get<SourcesResponse>(
        `${API_URL}/api/official-download-sources/pending`,
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
          },
        }
      );
      setPendingSources(response.data.sources);
      setError('');
    } catch {
      setError('Failed to fetch pending sources');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isModerator) {
      setError('Unauthorized: Moderator or Admin role required');
      return;
    }
    try {
      await axios.patch(
        `${API_URL}/api/official-download-sources/${updateStatus.id}`,
        {
          status: updateStatus.status,
          reviewNote: updateStatus.reviewNote,
        },
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setPendingSources(
        pendingSources.filter((s) => s.id !== Number(updateStatus.id))
      );
      setUpdateStatus({ id: '', status: 'APPROVED', reviewNote: '' });
    } catch {
      setError('Failed to update source status');
    }
  };


  if (!isModerator) {
    return null; // Prevent rendering if not a moderator
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Moderator: Pending Sources</h1>

      {error && (
        <div className="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={fetchPendingSources}
        className="btn btn-secondary mb-4 w-full sm:w-auto"
      >
        Fetch Pending Sources
      </button>

      {pendingSources.length === 0 ? (
        <p className="text-gray-500">No pending sources available.</p>
      ) : (
        <div className="space-y-4 mb-8">
          {pendingSources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">Update Source Status</h2>
      <form onSubmit={handleUpdateStatus} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Source ID</span>
          </label>
          <input
            type="number"
            placeholder="Enter Source ID"
            value={updateStatus.id}
            onChange={(e) =>
              setUpdateStatus({ ...updateStatus, id: e.target.value })
            }
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          <select
            value={updateStatus.status}
            onChange={(e) =>
              setUpdateStatus({
                ...updateStatus,
                status: e.target.value as 'APPROVED' | 'REJECTED',
              })
            }
            className="select select-bordered w-full"
          >
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Review Note</span>
          </label>
          <textarea
            placeholder="Enter Review Note"
            value={updateStatus.reviewNote}
            onChange={(e) =>
              setUpdateStatus({ ...updateStatus, reviewNote: e.target.value })
            }
            className="textarea textarea-bordered w-full"
          />
        </div>
        <Button type="submit" className="w-full">
          Update Status
        </Button>
      </form>
    </div>
  );
}