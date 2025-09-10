'use client';

import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import SourceCard from './SourceCard';
import { Source, SourcesResponse } from './types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

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
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="source-id">Source ID</Label>
          <Input
            type="number"
            id="source-id"
            placeholder="Enter Source ID"
            value={updateStatus.id}
            onChange={(e) =>
              setUpdateStatus({ ...updateStatus, id: e.target.value })
            }
            required
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            value={updateStatus.status}
            onValueChange={(value: 'APPROVED' | 'REJECTED') =>
              setUpdateStatus({
                ...updateStatus,
                status: value,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APPROVED">APPROVED</SelectItem>
              <SelectItem value="REJECTED">REJECTED</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="review-note">Review Note</Label>
          <Textarea
            id="review-note"
            placeholder="Enter Review Note"
            value={updateStatus.reviewNote}
            onChange={(e) =>
              setUpdateStatus({ ...updateStatus, reviewNote: e.target.value })
            }
          />
        </div>
        <Button type="submit" className="w-full">
          Update Status
        </Button>
      </form>
    </div>
  );
}