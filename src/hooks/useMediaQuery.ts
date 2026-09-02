import { useEffect, useState } from 'react';

/** Subscribes to a CSS media query. SSR-safe: returns false before hydration. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Re-sync when the query itself changes. The functional form avoids a
    // second render when the value already matches.
    setMatches((current) => (current === list.matches ? current : list.matches));
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Breakpoints mirror the values used in the stylesheets. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1023px)');
