import { Icon } from '../ui/Icon';
import styles from './Reviews.module.css';

/** Five stars, filled to the nearest whole for the given rating. */
export function StarRating({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={[styles.scoreStars, className ?? ''].filter(Boolean).join(' ')}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={size}
          className={star <= Math.round(rating) ? styles.starFilled : styles.star}
        />
      ))}
    </span>
  );
}
