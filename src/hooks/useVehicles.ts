import { useMemo } from 'react';
import {
  getFeaturedVehicles,
  getRelatedVehicles,
  getVehicleBySlug,
  getVehiclesByIds,
  searchVehicles,
} from '../services';
import type { VehicleQuery } from '../types';
import { queryKey } from '../utils/queryParams';
import { useAsyncData } from './useAsyncData';

/** Paged, filtered vehicle search. Keeps previous results visible while refetching. */
export function useVehicleSearch(query: VehicleQuery) {
  const key = queryKey(query);

  // The query object is rebuilt each render; the serialised key is what matters.
  const stableQuery = useMemo(() => query, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return useAsyncData(
    (signal) => searchVehicles(stableQuery, signal),
    [key],
    { keepPreviousData: true },
  );
}

export function useVehicle(slug: string | undefined) {
  return useAsyncData(
    (signal) => {
      if (!slug) return Promise.reject(new Error('Missing vehicle slug'));
      return getVehicleBySlug(slug, signal);
    },
    [slug],
  );
}

export function useFeaturedVehicles(limit = 6) {
  return useAsyncData((signal) => getFeaturedVehicles(limit, signal), [limit]);
}

export function useRelatedVehicles(vehicleId: string | undefined, limit = 4) {
  return useAsyncData(
    (signal) => (vehicleId ? getRelatedVehicles(vehicleId, limit, signal) : Promise.resolve([])),
    [vehicleId, limit],
  );
}

export function useVehiclesByIds(ids: string[]) {
  const key = ids.join(',');

  return useAsyncData(
    (signal) => getVehiclesByIds(key ? key.split(',') : [], signal),
    [key],
  );
}
