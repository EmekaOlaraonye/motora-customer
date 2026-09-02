import { SORT_OPTIONS, type SortOption, type VehicleQuery } from '../../types';
import { formatMileage, formatPrice, pluralise } from '../../utils/format';
import { countActiveFilters } from '../../utils/vehicleQuery';
import { Icon } from '../ui/Icon';
import styles from './ResultsToolbar.module.css';

export interface ResultsToolbarProps {
  total: number;
  loading: boolean;
  query: VehicleQuery;
  onSortChange: (sort: SortOption) => void;
  onOpenFilters: () => void;
}

export function ResultsToolbar({
  total,
  loading,
  query,
  onSortChange,
  onOpenFilters,
}: ResultsToolbarProps) {
  const activeCount = countActiveFilters(query);

  return (
    <div className={styles.toolbar}>
      <p className={styles.count}>
        {loading ? (
          'Searching…'
        ) : (
          <>
            <span className={styles.countValue}>{total}</span>{' '}
            {total === 1 ? 'car found' : 'cars found'}
          </>
        )}
      </p>

      <span className={styles.spacer} />

      <button type="button" className={styles.filterButton} onClick={onOpenFilters}>
        <Icon name="filter" size={16} />
        Filters
        {activeCount > 0 ? <span className={styles.filterBadge}>{activeCount}</span> : null}
      </button>

      <div className={styles.sort}>
        <label className={styles.sortLabel} htmlFor="sort-select">
          Sort by
        </label>
        <span className={styles.sortSelect}>
          <select
            id="sort-select"
            value={query.sort ?? 'relevance'}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
          >
            {SORT_OPTIONS.map((option) => (
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
    </div>
  );
}

interface Chip {
  key: string;
  label: string;
  /** The patch that removes just this chip. */
  remove: Partial<VehicleQuery>;
}

/** Flattens the active query into individually removable chips. */
function buildChips(query: VehicleQuery): Chip[] {
  const chips: Chip[] = [];

  if (query.q?.trim()) {
    chips.push({ key: 'q', label: `“${query.q.trim()}”`, remove: { q: undefined } });
  }

  const listKeys = [
    ['make', ''],
    ['model', ''],
    ['bodyType', ''],
    ['fuelType', ''],
    ['transmission', ''],
    ['condition', 'Condition: '],
    ['area', ''],
  ] as const;

  for (const [key, prefix] of listKeys) {
    const values = query[key];
    if (!values) continue;

    for (const value of values) {
      chips.push({
        key: `${key}-${value}`,
        label: `${prefix}${value}`,
        remove: { [key]: values.filter((item) => item !== value) } as Partial<VehicleQuery>,
      });
    }
  }

  if (query.minPrice != null || query.maxPrice != null) {
    const from = query.minPrice != null ? formatPrice(query.minPrice) : 'Any';
    const to = query.maxPrice != null ? formatPrice(query.maxPrice) : 'Any';
    chips.push({
      key: 'price',
      label: `${from} – ${to}`,
      remove: { minPrice: undefined, maxPrice: undefined },
    });
  }

  if (query.minYear != null || query.maxYear != null) {
    chips.push({
      key: 'year',
      label: `${query.minYear ?? 'Any'} – ${query.maxYear ?? 'Any'}`,
      remove: { minYear: undefined, maxYear: undefined },
    });
  }

  if (query.minMileage != null || query.maxMileage != null) {
    const from = query.minMileage != null ? formatMileage(query.minMileage) : 'Any';
    const to = query.maxMileage != null ? formatMileage(query.maxMileage) : 'Any';
    chips.push({
      key: 'mileage',
      label: `${from} – ${to}`,
      remove: { minMileage: undefined, maxMileage: undefined },
    });
  }

  if (query.verifiedOnly) {
    chips.push({
      key: 'verified',
      label: 'Verified garages',
      remove: { verifiedOnly: undefined },
    });
  }

  return chips;
}

export function ActiveFilterChips({
  query,
  onChange,
  onClear,
}: {
  query: VehicleQuery;
  onChange: (patch: Partial<VehicleQuery>) => void;
  onClear: () => void;
}) {
  const chips = buildChips(query);
  if (chips.length === 0) return null;

  return (
    <div className={styles.chips}>
      {chips.map((chip) => (
        <span key={chip.key} className={styles.chip}>
          {chip.label}
          <button
            type="button"
            className={styles.chipRemove}
            onClick={() => onChange(chip.remove)}
            aria-label={`Remove filter ${chip.label}`}
          >
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}

      {chips.length > 1 ? (
        <button type="button" className={styles.clearChips} onClick={onClear}>
          Clear all
        </button>
      ) : null}
    </div>
  );
}

/** Small helper so pages can describe the current page of results. */
export function resultsSummary(page: number, pageSize: number, total: number): string {
  if (total === 0) return 'No results';
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `Showing ${from}–${to} of ${pluralise(total, 'car')}`;
}
