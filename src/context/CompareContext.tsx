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
 * The compare set.
 *
 * Deliberately separate from the saved shortlist: saving means "keep this for
 * later", comparing means "weigh these against each other now". A customer
 * routinely saves eight cars and compares three of them.
 *
 * Persisted to localStorage today; when accounts land, this provider is the
 * only file that needs to sync to the backend.
 */

const STORAGE_KEY = 'motora.compare.v1';

/** Four columns is the most that stays readable, even on a wide screen. */
export const MAX_COMPARE = 4;

export interface ToggleCompareResult {
  /** True when the vehicle was added, false when it was removed. */
  added: boolean;
  /** True when the set was already full, so nothing changed. */
  rejected: boolean;
}

interface CompareContextValue {
  compareIds: string[];
  isCompared: (vehicleId: string) => boolean;
  toggleCompare: (vehicleId: string) => ToggleCompareResult;
  removeCompare: (vehicleId: string) => void;
  /** Replaces the whole set, trimmed to the cap. Used by "compare my shortlist". */
  setCompare: (vehicleIds: string[]) => void;
  clearCompare: () => void;
  count: number;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

function readStoredIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX_COMPARE);
  } catch {
    // Private browsing or blocked storage — comparison still works in memory.
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>(readStoredIds);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
    } catch {
      /* Storage unavailable; keep the in-memory set working. */
    }
  }, [compareIds]);

  const isCompared = useCallback(
    (vehicleId: string) => compareIds.includes(vehicleId),
    [compareIds],
  );

  const toggleCompare = useCallback(
    (vehicleId: string): ToggleCompareResult => {
      const alreadyIn = compareIds.includes(vehicleId);

      if (alreadyIn) {
        setCompareIds((current) => current.filter((id) => id !== vehicleId));
        return { added: false, rejected: false };
      }

      // Refuse silently at the cap; the caller explains why.
      if (compareIds.length >= MAX_COMPARE) {
        return { added: false, rejected: true };
      }

      // Appended rather than prepended, so columns stay in the order chosen.
      setCompareIds((current) => [...current, vehicleId]);
      return { added: true, rejected: false };
    },
    [compareIds],
  );

  const removeCompare = useCallback((vehicleId: string) => {
    setCompareIds((current) => current.filter((id) => id !== vehicleId));
  }, []);

  const setCompare = useCallback((vehicleIds: string[]) => {
    setCompareIds(vehicleIds.slice(0, MAX_COMPARE));
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const value = useMemo(
    () => ({
      compareIds,
      isCompared,
      toggleCompare,
      removeCompare,
      setCompare,
      clearCompare,
      count: compareIds.length,
      isFull: compareIds.length >= MAX_COMPARE,
    }),
    [compareIds, isCompared, toggleCompare, removeCompare, setCompare, clearCompare],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
}
