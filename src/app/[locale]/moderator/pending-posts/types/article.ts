// src/types/article.ts
export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

// Other article-related types can go here
export interface Article {
  id: number;
  title: string;
  status: ArticleStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
  };
}