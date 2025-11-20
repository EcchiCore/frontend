// src/app/[locale]/articles/[...paths]/components/hooks/useArticleSettings.ts
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useDebounce } from '../Debounce';

export function useArticleSettings(articleId: number) {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const debouncedSetFontSize = useDebounce(setFontSize, 300);

  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth <= 768);

    const preferencesCookie = Cookies.get('userPreferences');
    try {
      const preferences =
        preferencesCookie && JSON.parse(decodeURIComponent(preferencesCookie));
      setIsDarkMode(preferences?.darkMode ?? true);
    } catch {
      setIsDarkMode(true);
    }

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleScroll = () => {
      const articleElement = document.querySelector('main');
      if (articleElement) {
        const { height } = articleElement.getBoundingClientRect();
        const progress = Math.min(
          Math.max((window.scrollY - articleElement.offsetTop) / (height - window.innerHeight), 0),
          1
        );
        setReadingProgress(progress * 100);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleResize();
    handleScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [articleId]);

  return {
    isClient,
    isMobile,
    isDarkMode,
    readingProgress,
    fontSize,
    debouncedSetFontSize,
    setIsDarkMode,
    setFontSize,
  };
}