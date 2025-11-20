import { Dispatch, SetStateAction } from "react";
import { SwipeableHandlers } from "react-swipeable";
import { Article } from "@/types/article";


export interface DownloadFile {
  id: number;
  name: string;
  url: string;
  isActive: boolean;
  vipOnly: boolean;
}

export interface TranslationFile {
  id: number;
  articleId: number;
  translatorId: number;
  name: string;
  description: string;
  language: string;
  creditTo: string;
  fileUrl: string;
  version: string;
  articleVersion: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  article: {
    id: number;
    title: string;
    slug: string;
    description: string;
    status: string;
  };
  translator: {
    id: number;
    name: string;
    image: string;
  };
  images: string[];

}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: {
    username: string;
    bio: any;
    image: any;
    following: boolean;
  };
}

export interface TokenPayload {
  username: string;
  sub: number;
}

export interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export interface UserPreferences {
  imageResolution?: string;
  backgroundColor?: string;
  darkMode?: boolean;
}

export interface ArticleContentParseResult {
  content: React.ReactNode;
  headings: { text: string; id: string }[];
}

export interface ArticleHeaderProps {
  isTranslated: boolean;
  translationInfo: {
    sourceLanguage: string;
    targetLanguage: string;
  } | null;
  slug: string;
}

export interface SidebarLeftProps {
  article: Article;
  topCommenters: { username: string; count: number }[];
  isDarkBackground: boolean; // Add this
}

export interface SidebarRightProps {
  article: Article;
  isCurrentUserAuthor: boolean;
  isFollowing: boolean;
  handleFollow: () => void;
  isFavorited: boolean;
  handleFavorite: () => void;
  setOpenDownloadDialog: () => void;
  isDarkBackground: boolean; // Add this
  downloads: Article["downloads"];
  translationFiles: TranslationFile[];
}

export interface ArticleBodyProps {
  content: React.ReactNode;
  article: Article;
  selectedImage: string;
  setSelectedImage: (image: string) => void;
  handleOpenLightbox: (index: number) => void; // Required prop
  isDarkBackground: boolean;
  isTranslated: boolean;
  slug: string;
}

export interface CommentsSectionProps {
  isAuthenticated: boolean;
  isDarkBackground: boolean;
  comments: Comment[];
  newComment: string;
  setNewComment: Dispatch<SetStateAction<string>>;
  handleAddComment: () => void;
  isCurrentUserAuthor: boolean;
  handleDeleteComment: (commentId: number) => void;
  isLoading?: boolean; // เพิ่ม prop สำหรับ loading state
}

export interface ImageLightboxProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  isDarkMode?: boolean;
  swipeHandlers: SwipeableHandlers; // NEW: Add swipeHandlers
}


export interface N8nTranslationRequest {
  title: string;
  description: string;
  body: string;
  sourceLanguage: string;
  targetLanguage: string;
  slug: string;
}

export interface N8nTranslationResponse {
  success: boolean;
  translatedTitle: string;
  translatedDescription: string;
  translatedBody: string;
  error?: string;
}