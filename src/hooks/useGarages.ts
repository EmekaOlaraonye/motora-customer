import { getGarageBySlug, listGarages } from '../services';
import { useAsyncData } from './useAsyncData';

export function useGarages() {
  return useAsyncData((signal) => listGarages(signal), []);
}

export function useGarage(slug: string | undefined) {
  return useAsyncData(
    (signal) => {
      if (!slug) return Promise.reject(new Error('Missing garage slug'));
      return getGarageBySlug(slug, signal);
    },
    [slug],
  );
}
