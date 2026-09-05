import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MAX_COMPARE, useCompare } from '../../context/CompareContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useVehiclesByIds } from '../../hooks/useVehicles';
import { vehicleName } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import styles from './CompareTray.module.css';

/**
 * Persistent bar for building a comparison while browsing.
 *
 * Mounted once in the layout so the set survives navigation between the
 * browse, garage and detail pages — which is exactly when a customer is
 * collecting candidates.
 */
export function CompareTray() {
  const { compareIds, removeCompare, clearCompare, count } = useCompare();
  const { data: vehicles } = useVehiclesByIds(compareIds);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Publishes the tray's height so page content and toasts can clear it.
  // Runs before the early returns so hook order never changes between renders.
  const visible =
    count > 0 &&
    location.pathname !== '/compare' &&
    !(isMobile && /^\/vehicles\/[^/]+$/.test(location.pathname));

  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.removeProperty('--tray-height');
      return;
    }

    root.style.setProperty('--tray-height', isMobile ? '76px' : '104px');
    return () => {
      root.style.removeProperty('--tray-height');
    };
  }, [visible, isMobile]);

  if (count === 0) return null;

  // The compare page shows the set already; a bar over it would be noise.
  if (location.pathname === '/compare') return null;

  // On phones the vehicle page pins its own contact bar to the bottom edge,
  // and contacting the seller outranks building a comparison.
  if (isMobile && /^\/vehicles\/[^/]+$/.test(location.pathname)) return null;

  const emptySlots = Math.max(0, MAX_COMPARE - count);

  return (
    <div className={styles.tray} role="region" aria-label="Comparison">
      <div className={`container ${styles.inner}`}>
        <div className={styles.label}>
          <span className={styles.labelTitle}>Compare</span>
          <span className={styles.labelHint}>
            {count} of {MAX_COMPARE} selected
          </span>
        </div>

        <div className={styles.slots}>
          {compareIds.map((id) => {
            const vehicle = vehicles?.find((v) => v.id === id);

            return (
              <div key={id} className={styles.slot}>
                <SafeImage
                  src={vehicle?.images[0]?.url ?? ''}
                  alt={vehicle ? `${vehicle.year} ${vehicleName(vehicle)}` : ''}
                  ratio="4 / 3"
                  className={styles.slotImage}
                  sizes="80px"
                />
                <button
                  type="button"
                  className={styles.slotRemove}
                  onClick={() => removeCompare(id)}
                  aria-label={
                    vehicle
                      ? `Remove ${vehicle.year} ${vehicleName(vehicle)} from comparison`
                      : 'Remove from comparison'
                  }
                >
                  <Icon name="close" size={12} />
                </button>
              </div>
            );
          })}

          {Array.from({ length: emptySlots }, (_, index) => (
            <span key={`empty-${index}`} className={styles.slotEmpty} aria-hidden="true">
              <Icon name="plus" size={16} />
            </span>
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.clear} onClick={clearCompare}>
            Clear
          </button>
          <Button
            variant="primary"
            icon="compare"
            onClick={() => navigate('/compare')}
            disabled={count < 2}
            title={count < 2 ? 'Add another car to compare' : undefined}
          >
            {count < 2 ? 'Add one more' : `Compare ${count}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
