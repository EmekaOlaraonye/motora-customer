import { useState } from 'react';
import { useReviewSummary, useReviews } from '../../hooks/useReviews';
import type { Review, ReviewRating, ReviewSort } from '../../types';
import { formatRelativeDate, pluralise } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/StateBlock';
import { ReviewSummaryPanel } from './ReviewSummaryPanel';
import { StarRating } from './StarRating';
import styles from './Reviews.module.css';

const SORTS: { value: ReviewSort; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'helpful', label: 'Most useful' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
];

const PAGE_SIZE = 5;

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className={styles.review}>
      <div className={styles.reviewHead}>
        <div>
          <StarRating rating={review.rating} size={15} className={styles.reviewStars} />
          <h3 className={styles.reviewTitle}>{review.title}</h3>
          <p className={styles.reviewMeta}>
            <span>{review.authorName}</span>
            <span aria-hidden="true">·</span>
            <span>{formatRelativeDate(review.createdAt)}</span>
            {review.vehicleSummary ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{review.vehicleSummary}</span>
              </>
            ) : null}
          </p>
        </div>

        {review.verifiedBuyer ? (
          <Badge tone="brand" icon="shield-check" pill size="sm">
            Verified buyer
          </Badge>
        ) : null}
      </div>

      <p className={styles.reviewBody}>{review.body}</p>

      {review.response ? (
        <div className={styles.response}>
          <p className={styles.responseHead}>
            <Icon name="garage" size={14} />
            Reply from the garage
            <span className={styles.responseDate}>
              · {formatRelativeDate(review.response.respondedAt)}
            </span>
          </p>
          <p className={styles.responseBody}>{review.response.body}</p>
        </div>
      ) : null}
    </article>
  );
}

/**
 * Reviews for one garage.
 *
 * Paged rather than infinite: a buyer reading reviews is weighing a decision,
 * not browsing, and a page boundary is a natural place to stop.
 */
export function GarageReviews({ garageId, garageName }: { garageId: string; garageName: string }) {
  const [sort, setSort] = useState<ReviewSort>('recent');
  const [rating, setRating] = useState<ReviewRating | undefined>();

  // "Show more" grows the window rather than stepping through pages, so the
  // reviews already read stay on screen instead of being swapped out.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const summary = useReviewSummary(garageId);
  const reviews = useReviews({ garageId, sort, rating, page: 1, pageSize: visibleCount });

  function changeFilter(next: ReviewRating | undefined) {
    setRating(next);
    setVisibleCount(PAGE_SIZE);
  }

  function changeSort(next: ReviewSort) {
    setSort(next);
    setVisibleCount(PAGE_SIZE);
  }

  if (summary.error) return <ErrorState error={summary.error} onRetry={summary.retry} />;

  if (summary.loading) {
    return (
      <div className={styles.section}>
        <Skeleton shape="rect" height="160px" />
        <Skeleton shape="rect" height="320px" />
      </div>
    );
  }

  if (!summary.data || summary.data.total === 0) {
    return (
      <EmptyState
        icon="star"
        title="No reviews yet"
        description={`${garageName} has not been reviewed on Motora yet. Reviews appear here once customers who enquired through the platform have left them.`}
      />
    );
  }

  const result = reviews.data;
  const shown = result?.items ?? [];

  return (
    <div className={styles.section}>
      <ReviewSummaryPanel
        summary={summary.data}
        activeRating={rating}
        onFilterRating={changeFilter}
      />

      <div className={styles.toolbar}>
        <p className={styles.toolbarCount}>
          {rating ? (
            <>
              <strong>{result?.total ?? 0}</strong> {rating}-star{' '}
              {(result?.total ?? 0) === 1 ? 'review' : 'reviews'}
            </>
          ) : (
            <>
              Showing <strong>{shown.length}</strong> of {pluralise(result?.total ?? 0, 'review')}
            </>
          )}
        </p>

        {rating ? (
          <button type="button" className={styles.clearFilter} onClick={() => changeFilter(undefined)}>
            Show all
          </button>
        ) : null}

        <span className={styles.sortWrap}>
          <select
            value={sort}
            onChange={(event) => changeSort(event.target.value as ReviewSort)}
            aria-label="Sort reviews"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.sortChevron}>
            <Icon name="chevron-down" size={16} />
          </span>
        </span>
      </div>

      {reviews.error ? (
        <ErrorState error={reviews.error} onRetry={reviews.retry} variant="compact" />
      ) : shown.length === 0 && !reviews.loading ? (
        <EmptyState
          icon="star"
          title="No reviews at that rating"
          description="Try another rating, or show all reviews."
          variant="compact"
        />
      ) : (
        <div className={styles.list} aria-busy={reviews.loading || reviews.refreshing}>
          {reviews.loading
            ? Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} shape="rect" height="150px" />
              ))
            : shown.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      )}

      {result && shown.length < result.total ? (
        <div className={styles.loadMore}>
          <Button
            variant="secondary"
            icon="chevron-down"
            iconPosition="end"
            onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
            loading={reviews.refreshing}
          >
            Show {Math.min(PAGE_SIZE, result.total - shown.length)} more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
