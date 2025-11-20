'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { formatDate } from '@/lib/dateUtils';
import { AlertCircle, Copy, Loader2, Plus, Trash } from 'lucide-react';

interface Token {
  id: number;
  token: string;
  expiresAt: string;
  ranks: { id: number; rank: string }[];
}

interface TokenManagerFormProps {
  token: string | null;
  ranks: string[]; // New prop for user ranks
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

const TokenManagerForm = ({ token, ranks, setError, setSuccessMessage }: TokenManagerFormProps) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTokenDuration, setNewTokenDuration] = useState('7d');
  const [newTokenRank, setNewTokenRank] = useState('USER');
  const [newCreatedToken, setNewCreatedToken] = useState<string | null>(null);

  const durations = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '365d', label: '1 Year' },
    { value: 'permanent', label: 'Permanent' },
  ];

  const allRankOptions = useMemo(() => [
    { value: 'USER', label: 'User' },
    { value: 'MODERATOR', label: 'Moderator' },
    { value: 'ADMIN', label: 'Admin' },
  ], []);

  // Determine highest rank for permissions
  const getHighestRank = useCallback((ranks: string[]): string | null => {
    if (ranks.includes('ADMIN')) return 'ADMIN';
    if (ranks.includes('MODERATOR')) return 'MODERATOR';
    if (ranks.includes('USER')) return 'USER';
    return null;
  }, []);

  // Filter rank options based on highest rank
  const getFilteredRankOptions = useCallback((rank: string | null) => {
    if (!rank) return [];
    switch (rank) {
      case 'ADMIN':
        return allRankOptions;
      case 'MODERATOR':
        return allRankOptions.filter(option => option.value !== 'ADMIN');
      case 'USER':
        return allRankOptions.filter(option => option.value === 'USER');
      default:
        return [];
    }
  }, [allRankOptions]);

  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
      const response = await fetch(`${apiUrl}/api/user/tokens`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load tokens: ${response.status}`);
      }

      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Error loading tokens:', error);
      setError('Failed to load tokens. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [token, setError]);

  const createToken = async () => {
    setIsCreating(true);
    setNewCreatedToken(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
      const response = await fetch(`${apiUrl}/api/user/tokens`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration: newTokenDuration,
          ranks: [newTokenRank],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create token: ${response.status}`);
      }

      const data = await response.json();
      setNewCreatedToken(data.token);
      setSuccessMessage('Token created successfully!');
      fetchTokens();
    } catch (error) {
      console.error('Error creating token:', error);
      setError('Failed to create token. Please try again later.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteToken = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
      const response = await fetch(`${apiUrl}/api/user/tokens/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete token: ${response.status}`);
      }

      setSuccessMessage('Token deleted successfully!');
      setTokens(tokens.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting token:', error);
      setError('Failed to delete token. Please try again later.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSuccessMessage('Token copied to clipboard!');
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(() => {
        setError('Failed to copy token.');
      });
  };



  // Set default rank and fetch tokens on mount
  useEffect(() => {
    if (token) {
      const highestRank = getHighestRank(ranks);
      const availableRanks = getFilteredRankOptions(highestRank);
      if (availableRanks.length > 0) {
        setNewTokenRank(availableRanks[0].value);
      }
      fetchTokens();
    }
  }, [token, ranks, getHighestRank, getFilteredRankOptions, fetchTokens]);

  if (!token) {
    return (
      <div className="alert alert-warning mb-4">
        <AlertCircle className="h-6 w-6" />
        <span>You need to be logged in to manage tokens.</span>
      </div>
    );
  }

  const rankOptions = getFilteredRankOptions(getHighestRank(ranks));

  return (
    <div className="bg-base-100 rounded-box p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4">API Tokens</h2>
      <p className="text-base-content/70 mb-6">
        Create and manage API tokens to access the Chanom API. Tokens can have different permission levels and expiration dates.
      </p>

      <div className="bg-base-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold mb-3">Create New Token</h3>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="form-control w-full md:w-1/3">
            <label className="label">
              <span className="label-text">Duration</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={newTokenDuration}
              onChange={(e) => setNewTokenDuration(e.target.value)}
            >
              {durations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full md:w-1/3">
            <label className="label">
              <span className="label-text">Permission Level</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={newTokenRank}
              onChange={(e) => setNewTokenRank(e.target.value)}
              disabled={rankOptions.length === 0}
            >
              {rankOptions.length > 0 ? (
                rankOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              ) : (
                <option value="">No available ranks</option>
              )}
            </select>
          </div>

          <div className="form-control w-full md:w-1/3 md:self-end">
            <button
              className="btn btn-primary w-full"
              onClick={createToken}
              disabled={isCreating || rankOptions.length === 0}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Token
                </>
              )}
            </button>
          </div>
        </div>

        {newCreatedToken && (
          <div className="mt-4 p-3 bg-base-300 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm text-base-content/70 mb-1">Your new API token:</span>
              <div className="flex items-center">
                <code className="text-sm bg-base-100 p-2 rounded flex-1 overflow-x-auto">
                  {newCreatedToken}
                </code>
                <button
                  className="btn btn-ghost btn-sm ml-2"
                  onClick={() => copyToClipboard(newCreatedToken)}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-warning mt-2">
                Make sure to copy your token now. You won&#39;t be able to see it again!
              </p>
            </div>
          </div>
        )}
      </div>

      <h3 className="font-semibold mb-3">Your Tokens</h3>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tokens.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
            <tr>
              <th>ID</th>
              <th>Token</th>
              <th>Permissions</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {tokens.map((token) => (
              <tr key={token.id}>
                <td>{token.id}</td>
                <td>
                  <div className="flex items-center">
                    <code className="text-xs">
                      {token.token.substring(0, 10)}...{token.token.substring(token.token.length - 10)}
                    </code>
                    <button
                      className="btn btn-ghost btn-xs ml-1"
                      onClick={() => copyToClipboard(token.token)}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {token.ranks.map((rank) => (
                      <span key={rank.id} className="badge badge-primary badge-sm">
                          {rank.rank}
                        </span>
                    ))}
                  </div>
                </td>
                <td>{formatDate(token.expiresAt)}</td>
                <td>
                  <button
                    className="btn btn-error btn-xs"
                    onClick={() => deleteToken(token.id)}
                  >
                    <Trash className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-base-200 p-6 rounded-lg text-center">
          <p className="text-base-content/70">You don&#39;t have any API tokens yet.</p>
        </div>
      )}
    </div>
  );
};

export default TokenManagerForm;