import type { Garage } from '../../../types';
import { ApiError, toApiError } from '../../ApiError';
import type { GarageRepository } from '../types';
import { GARAGE_CATALOGUE as CATALOGUE } from './catalogue';
import { AbortedError, clone, delay, maybeFail } from './latency';

function guard(error: unknown): never {
  if (error instanceof AbortedError) throw error;
  if (error instanceof ApiError) throw error;
  throw toApiError(error);
}

export const mockGarageRepository: GarageRepository = {
  async list(signal?: AbortSignal): Promise<Garage[]> {
    try {
      await delay(signal);
      maybeFail();

      const sorted = [...CATALOGUE].sort(
        (a, b) =>
          Number(b.verified) - Number(a.verified) ||
          b.listingCount - a.listingCount ||
          a.name.localeCompare(b.name),
      );

      return clone(sorted);
    } catch (error) {
      guard(error);
    }
  },

  async getBySlug(slug: string, signal?: AbortSignal): Promise<Garage> {
    try {
      await delay(signal);
      maybeFail();

      const found = CATALOGUE.find((garage) => garage.slug === slug);
      if (!found) throw ApiError.notFound('That garage');

      return clone(found);
    } catch (error) {
      guard(error);
    }
  },

  async getById(id: string, signal?: AbortSignal): Promise<Garage> {
    try {
      await delay(signal);
      maybeFail();

      const found = CATALOGUE.find((garage) => garage.id === id);
      if (!found) throw ApiError.notFound('That garage');

      return clone(found);
    } catch (error) {
      guard(error);
    }
  },
};
