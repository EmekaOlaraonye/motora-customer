import type { ReviewRating, ReviewSummary } from '../../types';
import { pluralise } from '../../utils/format';
import { Icon } from '../ui/Icon';
import { StarRating } from './StarRating';
import styles from './Reviews.module.css';

const RATINGS: ReviewRating[] = [5, 4, 3, 2, 1];

/**
 * The score and its distribution.
 *
 * The bars are filters, not decoration: the one-star row is usually the first
 * thing a cautious buyer wants to read, so it is reachable in a click.
 */
export function ReviewSummaryPanel({
  summary,
  activeRating,
  onFilterRating,
}: {
  summary: ReviewSummary;
  activeRating?: ReviewRating;
  onFilterRating: (rating: ReviewRating | undefined) => void;
}) {
  return (
    <div className={styles.summary}>
      <div className={styles.score}>
        <span className={styles.scoreValue}>{summary.average.toFixed(1)}</span>
        <StarRating rating={summary.average} size={18} />
        <span className={styles.scoreCount}>{pluralise(summary.total, 'review')}</span>
      </div>

      <div>
        <div className={styles.bars}>
          {RATINGS.map((rating) => {
            const count = summary.breakdown[rating];
            const share = summary.total > 0 ? (count / summary.total) * 100 : 0;
            const isActive = activeRating === rating;

            return (
              <button
                key={rating}
                type="button"
                className={[styles.bar, isActive ? styles.barActive : ''].filter(Boolean).join(' ')}
                onClick={() => onFilterRating(isActive ? undefined : rating)}
                aria-pressed={isActive}
                aria-label={`${count} ${rating}-star reviews`}
                disabled={count === 0}
              >
                <span className={styles.barLabel}>
                  {rating}
                  <Icon name="star" size={11} />
                </span>
                <span className={styles.barTrack}>
                  <span className={styles.barFill} style={{ width: `${share}%` }} />
                </span>
                <span className={styles.barCount}>{count}</span>
              </button>
            );
          })}
        </div>

        {summary.verifiedShare > 0 ? (
          <p className={styles.verifiedNote}>
            <Icon name="shield-check" size={14} />
            {Math.round(summary.verifiedShare * 100)}% from buyers we could match to an enquiry
          </p>
        ) : null}
      </div>
    </div>
  );
}
