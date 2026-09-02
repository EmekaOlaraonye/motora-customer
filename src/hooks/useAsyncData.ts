import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError, type ApiError } from '../services/ApiError';

export interface AsyncState<T> {
  data: T | undefined;
  /** True on first load only — use for skeletons. */
  loading: boolean;
  /** True while refreshing with data already on screen — use for subtle dimming. */
  refreshing: boolean;
  error: ApiError | undefined;
  retry: () => void;
}

/**
 * Runs an async loader, cancels in-flight work when dependencies change or the
 * component unmounts, and exposes a retry handle for error states.
 *
 * `deps` should be a stable serialised key (see `queryKey`) rather than an
 * object, so a new object identity does not trigger a refetch.
 */
export function useAsyncData<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  options: { keepPreviousData?: boolean } = {},
): AsyncState<T> {
  const { keepPreviousData = false } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);

  // Held in a ref so changing the loader identity on every render does not refetch.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const hasData = data !== undefined;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    if (hasData && keepPreviousData) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(undefined);

    loaderRef
      .current(controller.signal)
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((caught: unknown) => {
        if (!active || controller.signal.aborted) return;
        if (caught instanceof Error && caught.name === 'AbortError') return;
        setError(toApiError(caught));
        if (!keepPreviousData) setData(undefined);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setRefreshing(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { data, loading, refreshing, error, retry };
}
