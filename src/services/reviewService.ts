import type { Paginated, Review, ReviewQuery, ReviewSummary } from '../types';
import { dataSource } from './dataSource';

export function listReviews(
  query: ReviewQuery,
  signal?: AbortSignal,
): Promise<Paginated<Review>> {
  return dataSource.reviews.list(query, signal);
}

export function getReviewSummary(
  garageId: string,
  signal?: AbortSignal,
): Promise<ReviewSummary> {
  return dataSource.reviews.summary(garageId, signal);
}
