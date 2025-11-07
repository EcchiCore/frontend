
export interface Author {
  name: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface Article {
  tagList: string[];
  categoryList: string[];
  title: string;
  slug: string;
  description: string;
  body: string;
  author: Author;
  favorited: boolean;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  mainImage: string | null;
  images: string[];
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export interface DashboardUser {
  username: string;
  email: string;
  bio: string | null;
  image: string | null;
  backgroundImage: string | null;
  shrtflyApiKey: string | null;
  socialMediaLinks: SocialMediaLink[];
  token?: string;
  createdAt?: string;
  ranks: string[];
}

interface SocialMediaLink {
  platform: string;
  url: string;
}
