'use client';
import React, { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface ArticleFavoriteHandlerProps {
  slug: string;
  initialFavorited: boolean;
  initialFavoritesCount: number;
  onFavoriteChange?: (favorited: boolean, favoritesCount: number) => void;
}

const ArticleFavoriteHandler: React.FC<ArticleFavoriteHandlerProps> = ({
  slug,
  initialFavorited,
  initialFavoritesCount,
  onFavoriteChange
}) => {
  const [favorited, setFavorited] = useState<boolean>(initialFavorited);
  const [favoritesCount, setFavoritesCount] = useState<number>(initialFavoritesCount);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  };

  const handleToggleFavorite = async () => {
    try {
      setLoading(true);
      const token = getCookie('token');
      
      if (!token) throw new Error('Authorization token not found. Please log in.');

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3000';
      const endpoint = `${apiBaseUrl}/api/articles/${slug}/favorite`;
      const method = favorited ? 'DELETE' : 'POST';

      // สร้าง headers แยกตาม method
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };

      // เพิ่ม Content-Type เฉพาะเมื่อส่ง body (POST)
      if (method === 'POST') {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body: method === 'POST' ? JSON.stringify({}) : undefined
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      setFavorited(data.article.favorited);
      setFavoritesCount(data.article.favoritesCount);
      onFavoriteChange?.(data.article.favorited, data.article.favoritesCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className="btn btn-ghost btn-sm tooltip"
        data-tip={favorited ? 'Unfavorite' : 'Favorite'}
        onClick={handleToggleFavorite}
        disabled={loading}
      >
        {loading ? (
          <span className="loading loading-spinner"></span>
        ) : favorited ? (
          <HeartIcon className="h-5 w-5 text-error" />
        ) : (
          <HeartOutlineIcon className="h-5 w-5" />
        )}
      </button>
      <span>{favoritesCount}</span>
      
      {snackbarOpen && (
        <div className="toast toast-end">
          <div className="alert alert-error">
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleCloseSnackbar}>
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleFavoriteHandler;
