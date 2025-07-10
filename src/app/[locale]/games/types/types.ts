export interface NewsArticleBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface NewsArticleAuthor {
  image: string;
  bio: string;
  id: number;
  documentId?: string;
  name?: string;
  email?: string;
}

export interface ImageFormat {
  url?: string;
  width?: number;
  height?: number;
}

export interface NewsArticleCover {
  id: number;
  documentId?: string;
  url?: string;
  formats?: {
    thumbnail?: ImageFormat;
    large?: ImageFormat;
    medium?: ImageFormat;
    small?: ImageFormat;
  };
}

export interface NewsArticle {
  mainImage: string;
  favoriteCount: number;
  commentCount: number;
  status: string;
  slug: string;
  categories?: Category[]; // Make it an optional array of Category objects
  id: number;
  documentId?: string;
  title?: string;
  description?: string;
  body?: string;
  content?: string;
  cover?: NewsArticleCover | null;
  author?: NewsArticleAuthor | null;
  blocks?: NewsArticleBlock[] | null;
  featured?: boolean;
  isHot?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tags?: Tag[];
  platforms?: Tag[];
  sequentialCode: string;
}


export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Platform {
  id: number
  name: string
}