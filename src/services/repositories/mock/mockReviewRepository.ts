import { REVIEWS } from '../../../data/reviews';
import type {
  Paginated,
  RatingBreakdown,
  Review,
  ReviewQuery,
  ReviewRating,
  ReviewSummary,
} from '../../../types';
import { paginate } from '../../../utils/vehicleQuery';
import { ApiError, toApiError } from '../../ApiError';
import type { ReviewRepository } from '../types';
import { AbortedError, clone, delay, maybeFail } from './latency';

const EMPTY_BREAKDOWN: RatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

function guard(error: unknown): never {
  if (error instanceof AbortedError) throw error;
  if (error instanceof ApiError) throw error;
  throw toApiError(error);
}

function sortReviews(reviews: Review[], sort: ReviewQuery['sort']): Review[] {
  const sorted = [...reviews];

  switch (sort) {
    case 'highest':
      sorted.sort((a, b) => b.rating - a.rating || Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    case 'lowest':
      sorted.sort((a, b) => a.rating - b.rating || Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    case 'helpful':
      // Longer reviews from verified buyers tend to be the ones worth reading,
      // and a garage reply is a signal the exchange went somewhere.
      sorted.sort((a, b) => {
        const score = (review: Review) =>
          (review.verifiedBuyer ? 400 : 0) +
          (review.response ? 200 : 0) +
          Math.min(300, review.body.length);
        return score(b) - score(a);
      });
      break;
    default:
      sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  return sorted;
}

/** Computed over every review for the garage, not just the current page. */
function summarise(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) {
    return { average: 0, total: 0, breakdown: { ...EMPTY_BREAKDOWN }, verifiedShare: 0 };
  }

  const breakdown: RatingBreakdown = { ...EMPTY_BREAKDOWN };
  let sum = 0;
  let verified = 0;

  for (const review of reviews) {
    breakdown[review.rating] += 1;
    sum += review.rating;
    if (review.verifiedBuyer) verified += 1;
  }

  return {
    average: sum / reviews.length,
    total: reviews.length,
    breakdown,
    verifiedShare: verified / reviews.length,
  };
}

export const mockReviewRepository: ReviewRepository = {
  async list(query: ReviewQuery, signal?: AbortSignal): Promise<Paginated<Review>> {
    try {
      await delay(signal);
      maybeFail();

      const forGarage = REVIEWS.filter((review) => review.garageId === query.garageId);
      const filtered = query.rating
        ? forGarage.filter((review) => review.rating === query.rating)
        : forGarage;

      const page = paginate(sortReviews(filtered, query.sort), query.page ?? 1, query.pageSize ?? 5);

      return { ...page, items: clone(page.items) };
    } catch (error) {
      guard(error);
    }
  },

  async summary(garageId: string, signal?: AbortSignal): Promise<ReviewSummary> {
    try {
      await delay(signal);
      maybeFail();

      return summarise(REVIEWS.filter((review) => review.garageId === garageId));
    } catch (error) {
      guard(error);
    }
  },
};

/** Exported for the catalogue, which keeps garage rating summaries consistent. */
export function summariseGarageReviews(garageId: string): ReviewSummary {
  return summarise(REVIEWS.filter((review) => review.garageId === garageId));
}

export type { ReviewRating };
