import { useMemo, useState } from 'react';
import { GarageCard } from '../components/garage/GarageCard';
import { TextField } from '../components/ui/Field';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/StateBlock';
import { useGarages } from '../hooks/useGarages';
import styles from './GaragesPage.module.css';
import { usePageMeta, siteOrigin } from '../hooks/usePageMeta';
import { buildStaticMeta } from '../utils/meta';

export function GaragesPage() {
  const { data: garages, loading, error, retry } = useGarages();
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    if (!needle || !garages) return garages ?? [];

    return garages.filter((garage) =>
      [garage.name, garage.location.area, ...garage.specialties]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [garages, keyword]);

  const totalListings = (garages ?? []).reduce((sum, garage) => sum + garage.listingCount, 0);
  const verifiedCount = (garages ?? []).filter((garage) => garage.verified).length;

  usePageMeta(
    buildStaticMeta(siteOrigin(), '/garages', 'Garages and dealers in Gaborone', "Every car on Motora is sold by one of these garages. Browse a dealer to see its full floor, opening hours and contact details.", false),
  );

  return (
    <div className="page-enter">
      <section className={styles.header}>
        <div className="container page-head page-head-dark">
          <span className="page-head-eyebrow">Who is selling</span>
          <h1 className={styles.title}>Garages and dealers in Gaborone</h1>
          <p className={styles.subtitle}>
            Every car on Motora is sold by one of these businesses. Browse a garage to see its full
            floor, opening hours and contact details before you make the trip.
          </p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{garages?.length ?? '—'}</span>
              <span className={styles.statLabel}>Garages listed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{verifiedCount}</span>
              <span className={styles.statLabel}>Verified by Motora</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{totalListings}</span>
              <span className={styles.statLabel}>Cars available</span>
            </div>
          </div>
        </div>
      </section>

      <div className={`container ${styles.content}`}>
        <div className={styles.toolbar}>
          <p className={styles.count}>
            <span className={styles.countValue}>{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'garage' : 'garages'}
          </p>

          <div className={styles.searchBox}>
            <TextField
              icon="search"
              placeholder="Search by name, area or speciality"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              aria-label="Search garages"
            />
          </div>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} shape="rect" className={styles.skeletonCard} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="garage"
            title="No garages match that search"
            description="Try a different name, or search by an area such as Broadhurst or Phakalane."
          />
        ) : (
          <div className={styles.grid}>
            {filtered.map((garage) => (
              <GarageCard key={garage.id} garage={garage} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
