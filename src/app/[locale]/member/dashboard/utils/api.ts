import { API_URL } from './constants';
import {
  UserResponse,
  ArticlesResponse,
  Article,
  DashboardUser,
  Token,
  PasswordUpdateData,
  Subscription,
  SubscriptionPlan,
  RedeemTrueMoneyRequest,
} from './types';

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
};

export const setCookie = (name: string, value: string, days: number) => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    return true;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return false;
  }
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getCookie('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export class ApiError extends Error {
  constructor(public message: string, public status: number, public response?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  const token = getCookie('token');

  if (!token) {
    throw new ApiError('Authorization token not found. Please log in.', 401);
  }

  const headers: Record<string, string> = getAuthHeaders();
  if (options.method !== 'DELETE') {
    headers['Content-Type'] = 'application/json';
  }

  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();
    return json.data ? json.data : json;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error occurred', 0);
  }
};

export const userApi = {
  getUser: () => apiRequest<UserResponse>('/api/user'),
  updateUser: (userData: Partial<DashboardUser>) =>
    apiRequest<UserResponse>('/api/user', {
      method: 'PUT',
      body: JSON.stringify({ user: userData }),
    }),
  updatePassword: (data: PasswordUpdateData) =>
    apiRequest<void>('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getTokens: () => apiRequest<{ tokens: Token[] }>('/api/user/tokens').then((data) => data.tokens),
  createToken: (data: { duration: string; ranks: string[] }) =>
    apiRequest<{ token: string }>('/api/user/tokens', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteToken: (id: number) =>
    apiRequest<void>(`/api/user/tokens/${id}`, {
      method: 'DELETE',
    }),
  deleteAccount: () =>
    apiRequest<void>('/api/user', {
      method: 'DELETE',
    }),
};

export const articlesApi = {
  getMyArticles: (params?: URLSearchParams) => {
    const endpoint = params ? `/api/articles/me?${params}` : '/api/articles/me';
    return apiRequest<ArticlesResponse>(endpoint);
  },
  getFeedArticles: (params?: URLSearchParams) => {
    const endpoint = params ? `/api/articles/feed?${params}` : '/api/articles/feed';
    return apiRequest<ArticlesResponse>(endpoint);
  },
  getArticle: (slug: string) => apiRequest<{ article: Article }>(`/api/articles/${slug}`),
  deleteArticle: (slug: string) =>
    apiRequest<void>(`/api/articles/${slug}`, {
      method: 'DELETE',
    }),
  favoriteArticle: (slug: string) =>
    apiRequest<{ article: Article }>(`/api/articles/${slug}/favorite`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  unfavoriteArticle: (slug: string) =>
    apiRequest<{ article: Article }>(`/api/articles/${slug}/favorite`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    }),
  publishRequest: (slug: string) =>
    apiRequest<void>(`/api/articles/${slug}/publish-request`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};

export const subscriptionApi = {
  listPlans: () => apiRequest<SubscriptionPlan[]>('/api/subscriptions/plans'),
  getUserSubscriptions: () => apiRequest<Subscription[]>('/api/subscriptions'),
  createSubscription: (planId: string) =>
    apiRequest<Subscription>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),
  cancelSubscription: (id: number | string) =>
    apiRequest<Subscription>(`/api/subscriptions/${id}`, {
      method: 'DELETE',
    }),
};

export const walletApi = {
  redeemTrueMoney: (data: RedeemTrueMoneyRequest) =>
    apiRequest<{ success?: boolean; message?: string; points?: number }>('/api/wallet/truemoney/redeem', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};