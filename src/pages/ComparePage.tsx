import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { Button, ButtonLink } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/StateBlock';
import { MAX_COMPARE, useCompare } from '../context/CompareContext';
import { useVehiclesByIds } from '../hooks/useVehicles';
import { formatPrice, vehicleName } from '../utils/format';
import { ROW_GROUPS, buildCompareRows, countDifferences } from '../utils/compare';
import styles from './ComparePage.module.css';
import { usePageMeta, siteOrigin } from '../hooks/usePageMeta';
import { buildStaticMeta } from '../utils/meta';

export function ComparePage() {
  const { compareIds, removeCompare, clearCompare, count } = useCompare();
  const { data: vehicles, loading, error, retry } = useVehiclesByIds(compareIds);
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  const rows = useMemo(() => buildCompareRows(vehicles ?? []), [vehicles]);
  const differenceCount = countDifferences(rows);
  const visibleRows = onlyDifferences ? rows.filter((row) => !row.identical) : rows;

  // Label column, one column per vehicle, and an "add another" column while
  // there is still room in the set.
  const showAddColumn = count < MAX_COMPARE;
  const columnTemplate = `minmax(132px, 168px) repeat(${count}, minmax(212px, 1fr))${
    showAddColumn ? ' minmax(150px, 180px)' : ''
  }`;

  usePageMeta(
    buildStaticMeta(siteOrigin(), '/compare', 'Compare cars side by side', "Put up to four cars next to each other and see exactly where they differ on price, mileage, condition and seller.", true),
  );

  return (
    <div className="page-enter">
      <section className={styles.header}>
        <div className="container page-head">
          <span className="page-head-eyebrow">Side by side</span>
          <h1 className={styles.title}>Compare cars</h1>
          <p className={styles.subtitle}>
            Put up to {MAX_COMPARE} cars next to each other and see exactly where they differ.
            Better values are marked, so you can weigh price against mileage and condition without
            scrolling between tabs.
          </p>

          {count > 0 ? (
            <div className={styles.toolbar}>
              <label className={styles.diffToggle}>
                <input
                  type="checkbox"
                  checked={onlyDifferences}
                  onChange={(event) => setOnlyDifferences(event.target.checked)}
                />
                <span className={styles.switch}>
                  <span className={styles.switchKnob} />
                </span>
                Show differences only
              </label>

              <span className={styles.diffCount}>
                <span className={styles.diffCountValue}>{differenceCount}</span> of {rows.length}{' '}
                rows differ
              </span>

              <Button variant="ghost" size="sm" icon="trash" onClick={clearCompare}>
                Clear all
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <div className={`container ${styles.content}`}>
        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : count === 0 ? (
          <EmptyState
            icon="compare"
            title="Nothing to compare yet"
            description={`Tap the compare icon on any listing to add it here. You can line up to ${MAX_COMPARE} cars side by side.`}
            actions={
              <ButtonLink to="/vehicles" variant="primary" icon="search">
                Browse cars
              </ButtonLink>
            }
          />
        ) : loading ? (
          <Skeleton shape="rect" height="520px" />
        ) : (
          <>
            <div className={styles.scroller}>
              <div className={styles.grid} style={{ gridTemplateColumns: columnTemplate }}>
                <div className={styles.headCorner} />

                {(vehicles ?? []).map((vehicle) => (
                  <div key={vehicle.id} className={styles.headCell}>
                    <button
                      type="button"
                      className={styles.headRemove}
                      onClick={() => removeCompare(vehicle.id)}
                      aria-label={`Remove ${vehicle.year} ${vehicleName(vehicle)} from comparison`}
                    >
                      <Icon name="close" size={14} />
                    </button>

                    <SafeImage
                      src={vehicle.images[0]?.url ?? ''}
                      alt={`${vehicle.year} ${vehicleName(vehicle)}`}
                      ratio="4 / 3"
                      className={styles.headImage}
                      sizes="220px"
                    />

                    <span className={styles.headPrice}>{formatPrice(vehicle.price)}</span>

                    <span className={styles.headTitle}>
                      <Link to={`/vehicles/${vehicle.slug}`}>
                        {vehicle.year} {vehicleName(vehicle)}
                      </Link>
                      {vehicle.variant ? (
                        <span className={styles.headVariant}>{vehicle.variant}</span>
                      ) : null}
                    </span>

                    <div className={styles.headActions}>
                      <ButtonLink
                        to={`/vehicles/${vehicle.slug}`}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        View listing
                      </ButtonLink>
                    </div>
                  </div>
                ))}

                {showAddColumn ? (
                  <Link to="/vehicles" className={styles.addCell}>
                    <span className={styles.addIcon}>
                      <Icon name="plus" size={18} />
                    </span>
                    Add another car
                  </Link>
                ) : null}

                {ROW_GROUPS.map((group) => {
                  const groupRows = visibleRows.filter((row) => row.group === group);
                  if (groupRows.length === 0) return null;

                  const spacers = count + (showAddColumn ? 1 : 0);

                  return (
                    <div key={group} style={{ display: 'contents' }}>
                      <div className={styles.groupCell}>{group}</div>
                      {Array.from({ length: spacers }, (_, index) => (
                        <div key={`${group}-spacer-${index}`} className={styles.groupSpacer} />
                      ))}

                      {groupRows.map((row) => (
                        <div key={row.label} style={{ display: 'contents' }}>
                          <div
                            className={[styles.labelCell, row.identical ? styles.identical : '']
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {row.label}
                          </div>

                          {row.values.map((value, index) => {
                            const isBest = row.bestIndices.includes(index);

                            return (
                              <div
                                key={`${row.label}-${index}`}
                                className={[
                                  styles.valueCell,
                                  row.identical ? styles.identicalValue : '',
                                  isBest ? styles.best : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                              >
                                {value}
                                {isBest ? (
                                  <Icon
                                    name="check"
                                    size={14}
                                    className={styles.bestTick}
                                    strokeWidth={3}
                                  />
                                ) : null}
                              </div>
                            );
                          })}

                          {showAddColumn ? <div className={styles.valueCell} /> : null}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className={`${styles.hint} ${styles.scrollHint}`}>
              <Icon name="arrow-right" size={14} />
              Swipe the table sideways to see every car.
            </p>

            <p className={styles.hint}>
              <Icon name="check" size={14} className={styles.bestTick} strokeWidth={3} />
              A green tick marks the better value in that row. It compares the stated figures only,
              not how the car actually drives.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
