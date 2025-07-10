'use client';

import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import SourceCard from './SourceCard';
import { Source, SourcesResponse } from './types';

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

      {/* Submit New Source */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Submit New Source</h2>
        <form onSubmit={handleSubmitNewSource} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Article ID</span>
            </label>
            <input
              type="number"
              placeholder="Enter Article ID"
              value={newSource.articleId}
              onChange={(e) =>
                setNewSource({ ...newSource, articleId: e.target.value })
              }
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Source Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter Source Name"
              value={newSource.name}
              onChange={(e) =>
                setNewSource({ ...newSource, name: e.target.value })
              }
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">URL</span>
            </label>
            <input
              type="url"
              placeholder="Enter URL"
              value={newSource.url}
              onChange={(e) =>
                setNewSource({ ...newSource, url: e.target.value })
              }
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Submit Note</span>
            </label>
            <textarea
              placeholder="Enter Submit Note"
              value={newSource.submitNote}
              onChange={(e) =>
                setNewSource({ ...newSource, submitNote: e.target.value })
              }
              className="textarea textarea-bordered w-full"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Submit Source
          </button>
        </form>
      </div>

      {/* Fetch Approved Sources */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Approved Sources</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="number"
            placeholder="Enter Article ID"
            value={articleId}
            onChange={(e) => setArticleId(e.target.value)}
            className="input input-bordered w-full sm:w-1/2"
          />
          <button
            onClick={fetchApprovedSources}
            className="btn btn-success w-full sm:w-auto"
          >
            Fetch Sources
          </button>
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