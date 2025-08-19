export interface DashboardUser {
  id: string;
  username: string;
  email: string;
  bio?: string | null;
  image?: string | null;
  backgroundImage?: string | null;
  shrtflyApiKey?: string | null;
  socialMediaLinks?: SocialMediaLink[];
  rank?: string;
  createdAt: string;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
}

export interface Token {
  id: number;
  token: string;
  expiresAt: string;
  ranks: { id: number; rank: string }[];
}

export interface Author {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  mainImage?: string;
  status: ArticleStatus;
  author: {
    username: string;
    bio?: string;
    image?: string;
    following: boolean;
  };
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export type PageType = 'profile' | 'articles' | 'moderation' | 'settings';

export interface NavigationItem {
  id: PageType;
  label: string;
  icon: string;
  path: string;
  requiredRanks?: string[];
}

export interface DashboardContextType {
  currentPage: PageType;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  navigateTo: (page: PageType) => void;
  toggleMobile: () => void;
}

export interface AuthContextType {
  user: DashboardUser | null;
  loading: boolean;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<DashboardUser>) => void;
}

export interface User {
  username: string;
  image?: string;
  rank: string;
}

export interface UserDataContextType {
  userData: DashboardUser | null;
  articles: Article[];
  articlesCount: number;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateArticles: (articles: Article[]) => void;
}

export interface UserResponse {
  user: DashboardUser;
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}