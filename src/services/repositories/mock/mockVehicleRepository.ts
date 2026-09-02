import type { VehicleQuery, VehicleSearchResult, VehicleWithGarage } from '../../../types';
import {
  DEFAULT_PAGE_SIZE,
  buildFacets,
  matchesQuery,
  paginate,
  sortVehicles,
} from '../../../utils/vehicleQuery';
import { ApiError, toApiError } from '../../ApiError';
import type { VehicleRepository } from '../types';
import { VEHICLE_CATALOGUE as CATALOGUE } from './catalogue';
import { AbortedError, clone, delay, maybeFail } from './latency';

function guard(error: unknown): never {
  if (error instanceof AbortedError) throw error;
  if (error instanceof ApiError) throw error;
  throw toApiError(error);
}

export const mockVehicleRepository: VehicleRepository = {
  async search(query: VehicleQuery, signal?: AbortSignal): Promise<VehicleSearchResult> {
    try {
      await delay(signal);
      maybeFail();

      const matched = CATALOGUE.filter((vehicle) => matchesQuery(vehicle, query));
      const sorted = sortVehicles(matched, query.sort ?? 'relevance', query);
      const page = paginate(sorted, query.page ?? 1, query.pageSize ?? DEFAULT_PAGE_SIZE);

      // Facets describe the catalogue a garage-scoped or unscoped search draws
      // from, so filter counts do not collapse as the customer narrows.
      const facetScope = query.garageId
        ? CATALOGUE.filter((vehicle) => vehicle.garageId === query.garageId)
        : CATALOGUE;

      return { ...page, items: clone(page.items), facets: buildFacets(facetScope) };
    } catch (error) {
      guard(error);
    }
  },

  async getBySlug(slug: string, signal?: AbortSignal): Promise<VehicleWithGarage> {
    try {
      await delay(signal);
      maybeFail();

      const found = CATALOGUE.find((vehicle) => vehicle.slug === slug);
      if (!found) throw ApiError.notFound('That vehicle listing');

      return clone(found);
    } catch (error) {
      guard(error);
    }
  },

  async getById(id: string, signal?: AbortSignal): Promise<VehicleWithGarage> {
    try {
      await delay(signal);
      maybeFail();

      const found = CATALOGUE.find((vehicle) => vehicle.id === id);
      if (!found) throw ApiError.notFound('That vehicle listing');

      return clone(found);
    } catch (error) {
      guard(error);
    }
  },

  async getFeatured(limit: number, signal?: AbortSignal): Promise<VehicleWithGarage[]> {
    try {
      await delay(signal);
      maybeFail();

      const featured = CATALOGUE.filter(
        (vehicle) => vehicle.featured && vehicle.status === 'available',
      );

      return clone(sortVehicles(featured, 'relevance').slice(0, limit));
    } catch (error) {
      guard(error);
    }
  },

  async getRelated(vehicleId: string, limit: number, signal?: AbortSignal) {
    try {
      await delay(signal);
      maybeFail();

      const source = CATALOGUE.find((vehicle) => vehicle.id === vehicleId);
      if (!source) return [];

      // Same garage first, then the same body type elsewhere in Gaborone.
      const sameGarage = CATALOGUE.filter(
        (vehicle) =>
          vehicle.id !== vehicleId &&
          vehicle.garageId === source.garageId &&
          vehicle.status === 'available',
      );

      const similar = CATALOGUE.filter(
        (vehicle) =>
          vehicle.id !== vehicleId &&
          vehicle.garageId !== source.garageId &&
          vehicle.bodyType === source.bodyType &&
          vehicle.status === 'available',
      );

      return clone([...sameGarage, ...similar].slice(0, limit));
    } catch (error) {
      guard(error);
    }
  },

  async getByIds(ids: string[], signal?: AbortSignal): Promise<VehicleWithGarage[]> {
    try {
      await delay(signal);
      maybeFail();

      const wanted = new Set(ids);
      // Preserve the caller's ordering — saved lists read newest-first.
      const found = CATALOGUE.filter((vehicle) => wanted.has(vehicle.id));
      const byId = new Map(found.map((vehicle) => [vehicle.id, vehicle]));

      return clone(ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])));
    } catch (error) {
      guard(error);
    }
  },
};
