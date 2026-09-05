import { Link } from 'react-router-dom';
import { MAX_COMPARE, useCompare } from '../../context/CompareContext';
import { useSavedVehicles } from '../../context/SavedVehiclesContext';
import { useToast } from '../../context/ToastContext';
import type { VehicleWithGarage } from '../../types';
import { formatMileage, formatPrice, vehicleName } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';
import { Badge, StatusBadge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import styles from './VehicleCard.module.css';

export interface VehicleCardProps {
  vehicle: VehicleWithGarage;
  /** Horizontal layout for list views on wider screens. */
  compact?: boolean;
  /** First cards in the viewport should not lazy-load. */
  priority?: boolean;
  /** Staggers the entrance animation across a grid. */
  index?: number;
}

export function VehicleCard({ vehicle, compact = false, priority = false, index = 0 }: VehicleCardProps) {
  const { isSaved, toggleSaved } = useSavedVehicles();
  const { isCompared, toggleCompare } = useCompare();
  const { showToast } = useToast();

  const saved = isSaved(vehicle.id);
  const compared = isCompared(vehicle.id);
  const cover = vehicle.images[0];

  function onToggleSave() {
    const nowSaved = toggleSaved(vehicle.id);
    showToast({
      tone: nowSaved ? 'success' : 'info',
      title: nowSaved ? 'Saved to your list' : 'Removed from your list',
      description: `${vehicle.year} ${vehicleName(vehicle)}`,
    });
  }

  function onToggleCompare() {
    const { added, rejected } = toggleCompare(vehicle.id);

    if (rejected) {
      showToast({
        tone: 'info',
        title: `You can compare up to ${MAX_COMPARE} cars`,
        description: 'Remove one from the compare bar to add this instead.',
      });
      return;
    }

    showToast({
      tone: added ? 'success' : 'info',
      title: added ? 'Added to compare' : 'Removed from compare',
      description: `${vehicle.year} ${vehicleName(vehicle)}`,
    });
  }

  return (
    <article
      className={[
        styles.card,
        compact ? styles.compact : '',
        vehicle.status === 'sold' ? styles.sold : '',
      ]
        .filter(Boolean)
        .join(' ')}
      // A short stagger makes a grid of results resolve rather than snap.
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className={styles.media}>
        <SafeImage
          src={cover?.url ?? ''}
          alt={cover?.alt ?? `${vehicle.year} ${vehicleName(vehicle)}`}
          ratio="4 / 3"
          className={styles.image}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <span className={styles.mediaOverlay} aria-hidden="true" />

        <div className={styles.topLeft}>
          <StatusBadge status={vehicle.status} overlay size="sm" />
          {vehicle.featured && vehicle.status === 'available' ? (
            <Badge tone="overlayBrand" pill size="sm">
              Featured
            </Badge>
          ) : null}
        </div>

        <button
          type="button"
          className={styles.saveButton}
          data-saved={saved}
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved cars' : 'Save this car'}
        >
          <Icon name="heart" size={18} />
        </button>

        <button
          type="button"
          className={styles.compareButton}
          data-active={compared}
          onClick={onToggleCompare}
          aria-pressed={compared}
          aria-label={compared ? 'Remove from comparison' : 'Add to comparison'}
        >
          <Icon name="compare" size={17} />
        </button>

        {vehicle.images.length > 1 ? (
          <span className={styles.photoCount}>
            <Icon name="image" size={12} />
            {vehicle.images.length}
          </span>
        ) : null}
      </div>

      <div className={styles.body}>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(vehicle.price)}</span>
          {vehicle.negotiable ? <span className={styles.negotiable}>Negotiable</span> : null}
        </div>

        <div>
          <h3 className={styles.title}>
            <Link to={`/vehicles/${vehicle.slug}`} className={styles.titleLink}>
              {vehicle.year} {vehicleName(vehicle)}
            </Link>
          </h3>
          {vehicle.variant ? <span className={styles.variant}>{vehicle.variant}</span> : null}
        </div>

        <div className={styles.specs}>
          <span className={styles.spec}>
            <Icon name="gauge" size={15} />
            <span className={styles.specValue}>{formatMileage(vehicle.mileage)}</span>
          </span>
          <span className={styles.spec}>
            <Icon name="gearbox" size={15} />
            <span className={styles.specValue}>{vehicle.transmission}</span>
          </span>
          <span className={styles.spec}>
            <Icon name="fuel" size={15} />
            <span className={styles.specValue}>{vehicle.fuelType}</span>
          </span>
          <span className={styles.spec}>
            <Icon name="car" size={15} />
            <span className={styles.specValue}>{vehicle.bodyType}</span>
          </span>
        </div>
      </div>

      <div className={styles.garage}>
        <span className={styles.garageName}>{vehicle.garage.name}</span>
        {vehicle.garage.verified ? (
          <span className={styles.verifiedTick} title="Verified garage">
            <Icon name="shield-check" size={14} title="Verified garage" />
          </span>
        ) : null}
        <span className={styles.garageLocation}>
          <Icon name="map-pin" size={13} />
          {vehicle.location.area}
        </span>
      </div>
    </article>
  );
}
