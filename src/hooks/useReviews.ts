import { getReviewSummary, listReviews } from '../services';
import type { ReviewQuery } from '../types';
import { useAsyncData } from './useAsyncData';

export function useReviews(query: ReviewQuery | undefined) {
  const key = query ? JSON.stringify(query) : '';

  return useAsyncData(
    (signal) => {
      if (!query) return Promise.resolve(undefined);
      return listReviews(query, signal);
    },
    [key],
    { keepPreviousData: true },
  );
}

export function useReviewSummary(garageId: string | undefined) {
  return useAsyncData(
    (signal) => (garageId ? getReviewSummary(garageId, signal) : Promise.resolve(undefined)),
    [garageId],
  );
}
