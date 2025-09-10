// dashboard/hooks/useNavigation.ts
import { useState, useEffect, useCallback } from 'react';
import { PageType } from '../utils/types';

export const useNavigation = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('profile');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.replace('#', '') as PageType;
    const validPages: PageType[] = ['profile', 'articles', 'moderation', 'settings'];

    if (validPages.includes(hash)) {
      setCurrentPage(hash);
    } else {
      setCurrentPage('profile');
    }
  }, []);

  const navigateTo = useCallback((page: PageType) => {
    setCurrentPage(page);
    window.location.hash = page;
    // Close mobile menu when navigating
    setMobileOpen(false);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  // Listen for hash changes
  useEffect(() => {
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  // Close mobile menu when clicking outside (on larger screens)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    currentPage,
    mobileOpen,
    navigateTo,
    toggleMobile,
    setMobileOpen
  };
};