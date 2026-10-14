/**
 * Customer reviews of a garage.
 *
 * The rating on a garage record is a denormalised summary of these; the
 * backend recalculates it on write. Showing a rating without the reviews
 * behind it is a weak trust signal at best, which is what this model fixes.
 */

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  garageId: string;

  /** Display name of the reviewer. Full names are not required or shown. */
  authorName: string;
  rating: ReviewRating;
  /** Short headline, e.g. "Straight talk, no games". */
  title: string;
  body: string;

  /** ISO 8601. */
  createdAt: string;

  /**
   * Set by the platform when the reviewer can be matched to an enquiry on a
   * listing from this garage. An unverified review still shows, labelled.
   */
  verifiedBuyer: boolean;

  /** The vehicle the review relates to, where it is known. */
  vehicleSummary?: string;

  /** The garage's own reply, where it has made one. */
  response?: {
    body: string;
    respondedAt: string;
  };
}

/** Counts per star, used to draw the distribution bars. */
export type RatingBreakdown = Record<ReviewRating, number>;

export interface ReviewSummary {
  average: number;
  total: number;
  breakdown: RatingBreakdown;
  /** Share of reviewers who could be matched to an enquiry. */
  verifiedShare: number;
}

export type ReviewSort = 'recent' | 'highest' | 'lowest' | 'helpful';

export interface ReviewQuery {
  garageId: string;
  sort?: ReviewSort;
  /** Narrow to a single star rating when a distribution bar is clicked. */
  rating?: ReviewRating;
  page?: number;
  pageSize?: number;
}
