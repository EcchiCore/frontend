export interface Author {
  username: string;
  bio: string;
  image: string;
  backgroundImage: string;
  following: boolean;
}

export interface Article {
  excerpt: string;
  publishedAt: string;
  id: number;
  title: string;
  slug: string;
  description: string;
  body: string;
  tagList: string[];
  categoryList: string[];
  platformList: string[];
  version: number;
  author: Author;
  favorited: boolean;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  mainImage: string;
  images: string[];
  engine?: string;
  ver?: string;
  sequentialCode?: string;
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}