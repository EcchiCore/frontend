import { useSyncExternalStore, useCallback, useState, useEffect } from 'react';
import { PageType } from '@/types/dashboard';

const getHashSnapshot = () => window.location.hash.replace('#', '') as PageType;

export const useNavigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const hash = useSyncExternalStore(
    (callback) => {
      window.addEventListener('hashchange', callback);
      return () => window.removeEventListener('hashchange', callback);
    },
    getHashSnapshot,
    () => 'profile' as PageType
  );

  const validPages: PageType[] = ['profile', 'articles', 'moderation', 'settings'];
  const currentPage = validPages.includes(hash) ? hash : 'profile';

  const navigateTo = useCallback((page: PageType) => {
    window.location.hash = page;
    setMobileOpen(false);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  // Close mobile menu when resize (Still need this as a side effect if we don't use matchMedia)
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