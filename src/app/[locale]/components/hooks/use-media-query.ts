import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Create a MediaQueryList object
    const mediaQuery = window.matchMedia(query);

    // Update the state with the initial match
    setMatches(mediaQuery.matches);

    // Create a handler to update state when the media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener for changes
    mediaQuery.addEventListener('change', handleChange);

    // Clean up the event listener when the component unmounts
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}