'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
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

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('profile');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigateTo = useCallback((page: PageType) => {
    console.log('Navigating to page:', page); // Debug log
    setCurrentPage(page);
    setMobileOpen(false); // Close mobile menu when navigating
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