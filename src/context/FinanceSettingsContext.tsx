import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_ANNUAL_RATE,
  DEFAULT_DEPOSIT_PERCENT,
  DEFAULT_TERM_MONTHS,
} from '../utils/finance';

/**
 * The customer's finance assumptions.
 *
 * Held in one place rather than per component: the estimate now appears on
 * every vehicle card, and a hook with its own state per card would mean a
 * separate localStorage write for each one on every change.
 *
 * Someone comparing three bakkies should not have to re-enter their deposit
 * and term on each. Stored per device; these are assumptions, not personal
 * financial data, and nothing here is sent anywhere.
 */

const STORAGE_KEY = 'motora.finance.v1';

export interface FinanceSettings {
  depositPercent: number;
  termMonths: number;
  annualRate: number;
  balloonPercent: number;
}

export const DEFAULT_SETTINGS: FinanceSettings = {
  depositPercent: DEFAULT_DEPOSIT_PERCENT,
  termMonths: DEFAULT_TERM_MONTHS,
  annualRate: DEFAULT_ANNUAL_RATE,
  balloonPercent: 0,
};

interface FinanceSettingsContextValue {
  settings: FinanceSettings;
  update: (patch: Partial<FinanceSettings>) => void;
  reset: () => void;
  /** True while the settings are still the untouched defaults. */
  isDefault: boolean;
}

const FinanceSettingsContext = createContext<FinanceSettingsContextValue | undefined>(undefined);

function readStored(): FinanceSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS;

    const candidate = parsed as Partial<FinanceSettings>;
    const pick = (value: unknown, fallback: number) =>
      typeof value === 'number' && Number.isFinite(value) ? value : fallback;

    return {
      depositPercent: pick(candidate.depositPercent, DEFAULT_SETTINGS.depositPercent),
      termMonths: pick(candidate.termMonths, DEFAULT_SETTINGS.termMonths),
      annualRate: pick(candidate.annualRate, DEFAULT_SETTINGS.annualRate),
      balloonPercent: pick(candidate.balloonPercent, DEFAULT_SETTINGS.balloonPercent),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function FinanceSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<FinanceSettings>(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* Storage unavailable; the calculator still works for this session. */
    }
  }, [settings]);

  const update = useCallback((patch: Partial<FinanceSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  const value = useMemo(
    () => ({
      settings,
      update,
      reset,
      isDefault:
        settings.depositPercent === DEFAULT_SETTINGS.depositPercent &&
        settings.termMonths === DEFAULT_SETTINGS.termMonths &&
        settings.annualRate === DEFAULT_SETTINGS.annualRate &&
        settings.balloonPercent === DEFAULT_SETTINGS.balloonPercent,
    }),
    [settings, update, reset],
  );

  return (
    <FinanceSettingsContext.Provider value={value}>{children}</FinanceSettingsContext.Provider>
  );
}

export function useFinanceSettings(): FinanceSettingsContextValue {
  const context = useContext(FinanceSettingsContext);
  if (!context) {
    throw new Error('useFinanceSettings must be used within a FinanceSettingsProvider');
  }
  return context;
}
