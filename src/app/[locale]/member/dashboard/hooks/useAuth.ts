// dashboard/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { DashboardUser } from '../utils/types';
import { userApi, ApiError } from '../utils/api';

const CACHE_KEY = 'dashboard_user';

/**
 * @deprecated This hook is deprecated. Use Redux `authSlice` via `useAppSelector` or `useAppDispatch` instead.
 * Evolution: Moved to src/store/features/auth/authSlice.ts
 */
export const useAuth = () => {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const response = await userApi.getUser();
      const fetchedUser = response.user;
      setUser(fetchedUser);
      localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedUser));
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to fetch user data';
      setError(errorMessage);
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        localStorage.removeItem(CACHE_KEY);
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    try {
      const cachedUser = localStorage.getItem(CACHE_KEY);
      if (cachedUser) {
        if (isMounted) {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setLoading(true);
        }
      }
    } catch (error) {
      console.error("Failed to parse cached user:", error);
      if (isMounted) {
        setLoading(true);
      }
    }

    refreshUser();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const login = useCallback(async (token: string) => {
    document.cookie = `token=${token}; path=/`;
    setLoading(true);
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
    setError(null);
    localStorage.removeItem(CACHE_KEY);
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((userData: Partial<DashboardUser>) => {
    setUser(prev => {
      if (prev) {
        const updatedUser = { ...prev, ...userData };
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    });
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    updateUser
  };
};