// dashboard/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { DashboardUser } from '../utils/types';
import { userApi, ApiError } from '../utils/api';

export const useAuth = () => {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUser();
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to fetch user data';
      setError(errorMessage);
      setUser(null);

      // Redirect to login if unauthorized
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (token: string) => {
    // Set token in cookie (if needed)
    document.cookie = `token=${token}; path=/`;
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
    setError(null);
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((userData: Partial<DashboardUser>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  }, []);

  // Initial load
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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