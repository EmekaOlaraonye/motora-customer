import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Recently viewed vehicles.
 *
 * Buying a car takes days and several sittings. Someone who looked at four
 * bakkies on Tuesday should not have to find them again on Thursday, and the
 * browse page is not where they left off.
 *
 * Distinct from the shortlist: saving is a decision, viewing is not. Plenty of
 * cars are worth returning to without being worth a heart.
 */

const STORAGE_KEY = 'motora.recently-viewed.v1';

/** Enough to cover a browsing session without becoming a second catalogue. */
export const MAX_RECENT = 12;

interface RecentlyViewedContextValue {
  recentIds: string[];
  /** Records a view, moving an already-seen vehicle back to the front. */
  recordView: (vehicleId: string) => void;
  /** Recent vehicles excluding one — the page you are currently on. */
  recentExcluding: (vehicleId: string | undefined) => string[];
  clearRecent: () => void;
  count: number;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | undefined>(undefined);

function readStored(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX_RECENT);
  } catch {
    // Private browsing or blocked storage — history simply does not persist.
    return [];
  }
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds));
    } catch {
      /* Storage unavailable; the list still works for this session. */
    }
  }, [recentIds]);

  const recordView = useCallback((vehicleId: string) => {
    setRecentIds((current) => {
      // Already at the front: nothing changes, and returning the same array
      // avoids a pointless write to storage.
      if (current[0] === vehicleId) return current;

      return [vehicleId, ...current.filter((id) => id !== vehicleId)].slice(0, MAX_RECENT);
    });
  }, []);

  const recentExcluding = useCallback(
    (vehicleId: string | undefined) =>
      vehicleId ? recentIds.filter((id) => id !== vehicleId) : recentIds,
    [recentIds],
  );

  const clearRecent = useCallback(() => setRecentIds([]), []);

  const value = useMemo(
    () => ({
      recentIds,
      recordView,
      recentExcluding,
      clearRecent,
      count: recentIds.length,
    }),
    [recentIds, recordView, recentExcluding, clearRecent],
  );

  return (
    <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
