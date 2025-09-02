'use client';

import React from 'react';
import { format } from 'date-fns';
import ArticleFavoriteHandler from './ArticleFavoriteHandler';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImageWithFallback from '@/components/ImageWithFallback';

interface Author {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

interface ArticleItemProps {
  slug: string;
  title: string;
  description: string;
  favoritesCount: number;
  favorited: boolean;
  tagList: string[];
  author: Author;
  createdAt: string;
  status: string;
  onEdit?: (slug: string) => void;
  onDelete?: (slug: string) => void;
  onView?: (slug: string) => void;
  onFavoriteChange?: (slug: string, favorited: boolean, favoritesCount: number) => void;
}

const ArticleItem: React.FC<ArticleItemProps> = ({
                                                   slug,
                                                   title,
                                                   description,
                                                   favoritesCount,
                                                   favorited,
                                                   tagList,
                                                   author,
                                                   createdAt,
                                                   status,
                                                   onEdit,
                                                   onDelete,
                                                   onView,
                                                   onFavoriteChange
                                                 }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleFavoriteChange = (newFavorited: boolean, newFavoritesCount: number) => {
    onFavoriteChange?.(slug, newFavorited, newFavoritesCount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'badge-success';
      case 'draft': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl mb-4">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                {author.image ? (
                  <ImageWithFallback src={author.image} alt={author.username} className="rounded-full" type="nextImage" />
                ) : (
                  <div className="bg-primary text-white flex items-center justify-center h-full text-xl">
                    {author.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="card-title">{title}</h2>
              <p className="text-sm text-base-content/70">
                By {author.username} • {formatDate(createdAt)}
              </p>
            </div>
          </div>
          <div className={`badge badge-sm capitalize ${getStatusColor(status)}`}>
            {status}
          </div>
        </div>
        <p className="mt-2 text-base-content/70">{description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {tagList.map((tag) => (
            <div key={tag} className="badge badge-outline">
              {tag}
            </div>
          ))}
        </div>
        <div className="divider"></div>
        <div className="card-actions justify-between">
          <ArticleFavoriteHandler
            slug={slug}
            initialFavorited={favorited}
            initialFavoritesCount={favoritesCount}
            onFavoriteChange={handleFavoriteChange}
          />
          <div className="flex gap-2">
            {onView && (
              <button className="btn btn-ghost btn-sm" onClick={() => onView(slug)}>
                <EyeIcon className="h-5 w-5" />
                View
              </button>
            )}
            {onEdit && (
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(slug)}>
                <PencilIcon className="h-5 w-5" />
                Edit
              </button>
            )}
            {onDelete && (
              <button className="btn btn-error btn-sm" onClick={() => onDelete(slug)}>
                <TrashIcon className="h-5 w-5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleItem;