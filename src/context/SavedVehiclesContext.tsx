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
 * Shortlisted vehicles.
 *
 * Persisted to localStorage for now. Once accounts exist this provider is the
 * only place that needs to start syncing to the backend instead.
 */

const STORAGE_KEY = 'motora.saved-vehicles.v1';

interface SavedVehiclesContextValue {
  savedIds: string[];
  isSaved: (vehicleId: string) => boolean;
  toggleSaved: (vehicleId: string) => boolean;
  clearSaved: () => void;
  count: number;
}

const SavedVehiclesContext = createContext<SavedVehiclesContextValue | undefined>(undefined);

function readStoredIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    // Private browsing or blocked storage — shortlisting simply does not persist.
    return [];
  }
}

export function SavedVehiclesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(readStoredIds);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      /* Storage unavailable; keep the in-memory list working. */
    }
  }, [savedIds]);

  const isSaved = useCallback((vehicleId: string) => savedIds.includes(vehicleId), [savedIds]);

  /** Returns the new saved state so callers can word their toast correctly. */
  const toggleSaved = useCallback(
    (vehicleId: string) => {
      const willSave = !savedIds.includes(vehicleId);

      setSavedIds((current) =>
        current.includes(vehicleId)
          ? current.filter((id) => id !== vehicleId)
          : [vehicleId, ...current],
      );

      return willSave;
    },
    [savedIds],
  );

  const clearSaved = useCallback(() => setSavedIds([]), []);

  const value = useMemo(
    () => ({ savedIds, isSaved, toggleSaved, clearSaved, count: savedIds.length }),
    [savedIds, isSaved, toggleSaved, clearSaved],
  );

  return (
    <SavedVehiclesContext.Provider value={value}>{children}</SavedVehiclesContext.Provider>
  );
}

export function useSavedVehicles(): SavedVehiclesContextValue {
  const context = useContext(SavedVehiclesContext);
  if (!context) throw new Error('useSavedVehicles must be used within a SavedVehiclesProvider');
  return context;
}
