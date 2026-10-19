import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { useToast } from '../../context/ToastContext';
import { useVehiclesByIds } from '../../hooks/useVehicles';
import { VehicleGrid } from './VehicleGrid';
import styles from './RecentlyViewed.module.css';

export interface RecentlyViewedProps {
  /** The listing currently being viewed, so it is not offered back. */
  excludeId?: string;
  /** How many to show. Fewer on a detail page than on the homepage. */
  limit?: number;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  /** Hidden below this many; one card is not a section worth a heading. */
  minimum?: number;
}

/**
 * Picks up a browsing session where it was left.
 *
 * Renders nothing when there is too little history to be useful, so it never
 * appears as an empty shell on a first visit.
 */
export function RecentlyViewed({
  excludeId,
  limit = 4,
  title = 'Pick up where you left off',
  eyebrow = 'Recently viewed',
  subtitle,
  minimum = 2,
}: RecentlyViewedProps) {
  const { recentExcluding, clearRecent, count } = useRecentlyViewed();
  const { showToast } = useToast();

  const ids = recentExcluding(excludeId).slice(0, limit);
  const { data: vehicles, loading } = useVehiclesByIds(ids);

  if (ids.length < minimum) return null;

  // A listing that has since been withdrawn resolves to nothing; if that
  // leaves too few to be worth a section, step aside quietly.
  if (!loading && (vehicles?.length ?? 0) < minimum) return null;

  function onClear() {
    clearRecent();
    showToast({ tone: 'info', title: 'Viewing history cleared' });
  }

  return (
    <section className={styles.section} aria-label="Recently viewed vehicles">
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2 className={styles.title}>{title}</h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>

        {count > 0 ? (
          <button type="button" className={styles.clear} onClick={onClear}>
            Clear history
          </button>
        ) : null}
      </div>

      <VehicleGrid
        vehicles={vehicles ?? []}
        loading={loading}
        skeletonCount={ids.length}
        columns="four"
        priorityCount={0}
      />
    </section>
  );
}
