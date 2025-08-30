'use client';

import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import SourceCard from './SourceCard';
import { Source, SourcesResponse } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.online';

export default function UserSources() {
  const [cookies] = useCookies(['token']);
  const [articleId, setArticleId] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [newSource, setNewSource] = useState({
    articleId: '',
    name: '',
    url: '',
    submitNote: '',
  });
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (cookies.token) {
      try {
        const payload = JSON.parse(atob(cookies.token.split('.')[1]));
        setIsAuthenticated(!!payload);
      } catch {
        setError('Invalid token');
      }
    }
  }, [cookies.token]);

  const handleSubmitNewSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to submit a source');
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/official-download-sources`,
        {
          articleId: Number(newSource.articleId),
          name: newSource.name,
          url: newSource.url,
          submitNote: newSource.submitNote,
        },
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSources([...sources, response.data.source]);
      setNewSource({ articleId: '', name: '', url: '', submitNote: '' });
    } catch {
      setError('Failed to submit new source');
    }
  };

  const fetchApprovedSources = async () => {
    if (!articleId) {
      setError('Please enter an Article ID');
      return;
    }
    try {
      const response = await axios.get<SourcesResponse>(
        `${API_URL}/api/official-download-sources/article/${articleId}`
      );
      setSources(response.data.sources);
      setError('');
    } catch {
      setError('Failed to fetch approved sources');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Official Download Sources</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit New Source */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Submit New Source</h2>
        <form onSubmit={handleSubmitNewSource} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="new-article-id">Article ID</Label>
            <Input
              type="number"
              id="new-article-id"
              placeholder="Enter Article ID"
              value={newSource.articleId}
              onChange={(e) =>
                setNewSource({ ...newSource, articleId: e.target.value })
              }
              required
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="source-name">Source Name</Label>
            <Input
              type="text"
              id="source-name"
              placeholder="Enter Source Name"
              value={newSource.name}
              onChange={(e) =>
                setNewSource({ ...newSource, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="source-url">URL</Label>
            <Input
              type="url"
              id="source-url"
              placeholder="Enter URL"
              value={newSource.url}
              onChange={(e) =>
                setNewSource({ ...newSource, url: e.target.value })
              }
              required
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="submit-note">Submit Note</Label>
            <Textarea
              id="submit-note"
              placeholder="Enter Submit Note"
              value={newSource.submitNote}
              onChange={(e) =>
                setNewSource({ ...newSource, submitNote: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full">
            Submit Source
          </Button>
        </form>
      </div>

      {/* Fetch Approved Sources */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Approved Sources</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            type="number"
            placeholder="Enter Article ID"
            value={articleId}
            onChange={(e) => setArticleId(e.target.value)}
            className="w-full sm:w-1/2"
          />
          <Button onClick={fetchApprovedSources}>
            Fetch Sources
          </Button>
        </div>
        {sources.length === 0 ? (
          <p className="text-gray-500">
            No approved sources available for this article.
          </p>
        ) : (
          <div className="space-y-4">
            {sources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}