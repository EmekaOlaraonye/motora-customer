import type { VehicleWithGarage } from '../../types';
import { VehicleGridSkeleton } from '../ui/Skeleton';
import { VehicleCard } from './VehicleCard';
import styles from './VehicleGrid.module.css';

export interface VehicleGridProps {
  vehicles: VehicleWithGarage[];
  loading?: boolean;
  refreshing?: boolean;
  skeletonCount?: number;
  /** Tightens the tracks when the grid sits beside a filter sidebar. */
  withSidebar?: boolean;
  columns?: 'auto' | 'four';
  /** Number of leading cards to load eagerly. */
  priorityCount?: number;
}

export function VehicleGrid({
  vehicles,
  loading = false,
  refreshing = false,
  skeletonCount = 6,
  withSidebar = false,
  columns = 'auto',
  priorityCount = 3,
}: VehicleGridProps) {
  const className = [
    styles.grid,
    withSidebar ? styles.withSidebar : '',
    columns === 'four' ? styles.four : '',
    refreshing ? styles.refreshing : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} aria-busy={loading || refreshing}>
      {loading ? (
        <VehicleGridSkeleton count={skeletonCount} />
      ) : (
        vehicles.map((vehicle, index) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            index={index}
            priority={index < priorityCount}
          />
        ))
      )}
    </div>
  );
}
