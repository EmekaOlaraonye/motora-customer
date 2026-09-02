import { ButtonLink, Button } from '../components/ui/Button';
import { EmptyState, ErrorState } from '../components/ui/StateBlock';
import { VehicleGrid } from '../components/vehicle/VehicleGrid';
import { useSavedVehicles } from '../context/SavedVehiclesContext';
import { useToast } from '../context/ToastContext';
import { useVehiclesByIds } from '../hooks/useVehicles';
import { pluralise } from '../utils/format';
import styles from './SimplePage.module.css';

export function SavedPage() {
  const { savedIds, clearSaved, count } = useSavedVehicles();
  const { data: vehicles, loading, error, retry } = useVehiclesByIds(savedIds);
  const { showToast } = useToast();

  function onClear() {
    clearSaved();
    showToast({ tone: 'info', title: 'Saved list cleared' });
  }

  return (
    <div className="page-enter">
      <section className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Your saved cars</h1>
          <p className={styles.subtitle}>
            {count > 0
              ? `${pluralise(count, 'car')} shortlisted. Saved cars stay on this device, so you can come back to them later.`
              : 'Shortlist the cars you like as you browse, and compare them here side by side.'}
          </p>
        </div>
      </section>

      <div className={`container ${styles.content}`}>
        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : count === 0 ? (
          <EmptyState
            icon="heart"
            title="You have not saved any cars yet"
            description="Tap the heart on any listing to add it here. Your shortlist is kept on this device and does not need an account."
            actions={
              <ButtonLink to="/vehicles" variant="primary" icon="search">
                Start browsing
              </ButtonLink>
            }
          />
        ) : (
          <>
            <div className={styles.toolbar}>
              <p className={styles.count}>
                <span className={styles.countValue}>{count}</span>{' '}
                {count === 1 ? 'car saved' : 'cars saved'}
              </p>
              <Button variant="ghost" icon="trash" size="sm" onClick={onClear}>
                Clear list
              </Button>
            </div>

            <VehicleGrid vehicles={vehicles ?? []} loading={loading} skeletonCount={count} />
          </>
        )}
      </div>
    </div>
  );
}
