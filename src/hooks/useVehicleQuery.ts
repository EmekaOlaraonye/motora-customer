import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { VehicleQuery } from '../types';
import { queryFromSearchParams, searchParamsFromQuery } from '../utils/queryParams';

/**
 * The browse page's query, stored in the URL.
 *
 * The URL is the single source of truth: results are shareable, the back button
 * steps through filter changes, and a refresh restores exactly what was shown.
 */
export function useVehicleQuery(defaults: Partial<VehicleQuery> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo<VehicleQuery>(
    () => ({ ...defaults, ...queryFromSearchParams(searchParams) }),
    // `defaults` is a literal at every call site; the params string is what changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString()],
  );

  /**
   * Applies a partial change. Any filter change resets to page one, since
   * staying on page 7 of a result set that just shrank is never what was meant.
   */
  const updateQuery = useCallback(
    (patch: Partial<VehicleQuery>) => {
      const next: VehicleQuery = { ...query, ...patch };

      const changedFilter = Object.keys(patch).some((key) => key !== 'page');
      if (changedFilter) next.page = 1;

      // Drop empty arrays so they do not linger in the URL.
      for (const key of Object.keys(next) as (keyof VehicleQuery)[]) {
        const value = next[key];
        if (Array.isArray(value) && value.length === 0) delete next[key];
      }

      setSearchParams(searchParamsFromQuery(next), { replace: !changedFilter });
    },
    [query, setSearchParams],
  );

  const clearQuery = useCallback(() => {
    setSearchParams(searchParamsFromQuery({ sort: query.sort }));
  }, [query.sort, setSearchParams]);

  return { query, updateQuery, clearQuery };
}
