import { NavigationItem } from '@/types/dashboard';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'LayoutDashboard',
    path: '/member/dashboard',
    category: 'general',
    exact: true
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'User',
    path: '/member/dashboard/profile',
    category: 'general'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/member/dashboard/settings',
    category: 'general'
  },
  {
    id: 'studio',
    label: 'Studio',
    icon: 'Activity',
    path: '/member/dashboard/studio',
    category: 'creator'
  },
  {
    id: 'articles',
    label: 'Articles',
    icon: 'FileText',
    path: '/member/dashboard/articles',
    category: 'creator'
  },
  {
    id: 'wallet',
    label: 'Wallet & Points',
    icon: 'Wallet',
    path: '/member/dashboard/wallet',
    category: 'creator'
  },
  {
    id: 'moderation',
    label: 'Moderate Content',
    icon: 'Shield',
    category: 'management',
    requiredRanks: ['MODERATOR', 'ADMIN'],
    path: '/member/dashboard/moderation'
  },
  {
    id: 'admin',
    label: 'Admin Console',
    icon: 'ShieldAlert',
    category: 'management',
    requiredRanks: ['ADMIN'],
    path: '/member/dashboard/admin'
  }
];

export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export const ARTICLE_STATUS = {
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED'
} as const;

export const USER_RANKS = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
} as const;

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200
} as const;