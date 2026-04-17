import { useSyncExternalStore, useCallback } from 'react';

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((callback: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }, [query]);

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = () => {
    return false; // Default to mobile/false for server-side rendering
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}