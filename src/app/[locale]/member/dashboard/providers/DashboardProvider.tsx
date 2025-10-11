'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DashboardContextType, PageType } from '../utils/types';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: React.ReactNode;
}

const getPageFromHash = (): PageType => {
  if (typeof window === 'undefined') {
    return 'profile';
  }
  const hash = window.location.hash.replace('#', '') as PageType;
  const validPages: PageType[] = ['profile', 'articles', 'subscriptions', 'wallet', 'moderation', 'settings'];
  if (validPages.includes(hash)) {
    return hash;
  }
  return 'profile';
};

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageType>(getPageFromHash());
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigateTo = useCallback((page: PageType) => {
    console.log('Navigating to page:', page); // Debug log
    setCurrentPage(page);
    window.location.hash = page;
    setMobileOpen(false); // Close mobile menu when navigating
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const value: DashboardContextType = {
    currentPage,
    mobileOpen,
    setMobileOpen,
    navigateTo,
    toggleMobile
  };

  return (
    <DashboardContext.Provider value={value}>
    {children}
      </DashboardContext.Provider>
      );
    };