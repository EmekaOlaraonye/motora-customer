import type { VehicleQuery, VehicleSearchResult, VehicleWithGarage } from '../types';
import { dataSource } from './dataSource';

/**
 * Public data API consumed by hooks and pages.
 *
 * Keeping this layer between the UI and the repositories means cross-cutting
 * concerns (caching, analytics, retries) have an obvious home later.
 */

export function searchVehicles(
  query: VehicleQuery,
  signal?: AbortSignal,
): Promise<VehicleSearchResult> {
  return dataSource.vehicles.search(query, signal);
}

export function getVehicleBySlug(slug: string, signal?: AbortSignal): Promise<VehicleWithGarage> {
  return dataSource.vehicles.getBySlug(slug, signal);
}

export function getVehicleById(id: string, signal?: AbortSignal): Promise<VehicleWithGarage> {
  return dataSource.vehicles.getById(id, signal);
}

export function getFeaturedVehicles(
  limit = 6,
  signal?: AbortSignal,
): Promise<VehicleWithGarage[]> {
  return dataSource.vehicles.getFeatured(limit, signal);
}

export function getRelatedVehicles(
  vehicleId: string,
  limit = 4,
  signal?: AbortSignal,
): Promise<VehicleWithGarage[]> {
  return dataSource.vehicles.getRelated(vehicleId, limit, signal);
}

export function getVehiclesByIds(
  ids: string[],
  signal?: AbortSignal,
): Promise<VehicleWithGarage[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return dataSource.vehicles.getByIds(ids, signal);
}
