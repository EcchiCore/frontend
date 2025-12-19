// dashboard/providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { AuthContextType } from '../utils/types';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchUser,
  loginUser,
  logout as logoutAction,
  updateUserLocal,
  initializeAuth
} from '@/store/features/auth/authSlice';
import { DashboardUser } from '../utils/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, loading, error, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth());
      dispatch(fetchUser());
    }
  }, [dispatch, initialized]);

  const login = useCallback(async (token: string) => {
    await dispatch(loginUser(token));
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutAction());
    window.location.href = '/login';
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    await dispatch(fetchUser());
  }, [dispatch]);

  const updateUser = useCallback((userData: Partial<DashboardUser>) => {
    dispatch(updateUserLocal(userData));
  }, [dispatch]);

  const authValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};