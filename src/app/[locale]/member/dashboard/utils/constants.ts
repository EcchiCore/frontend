import { NavigationItem } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: 'User',
    path: '#profile'
  },
  {
    id: 'articles',
    label: 'Articles',
    icon: 'FileText',
    path: '#articles'
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: 'CreditCard',
    path: '#subscriptions'
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: 'Wallet',
    path: '#wallet'
  },
  {
    id: 'moderation',
    label: 'Moderate Content',
    icon: 'Shield',
    requiredRanks: ['MODERATOR', 'ADMIN'],
    path: '#moderation'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '#settings'
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