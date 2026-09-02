import { useState, type ReactNode } from 'react';
import { CONDITIONS, GABORONE_AREAS, MAKE_MODELS } from '../../data/taxonomy';
import type { VehicleFacets, VehicleQuery } from '../../types';
import { countActiveFilters } from '../../utils/vehicleQuery';
import { Checkbox, RangeFields, TextField } from '../ui/Field';
import { Icon } from '../ui/Icon';
import styles from './FilterPanel.module.css';

/** Collapsible section with a count of how many of its options are active. */
function FilterGroup({
  title,
  activeCount = 0,
  defaultOpen = true,
  children,
}: {
  title: string;
  activeCount?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupHeader}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {title}
        {activeCount > 0 ? <span className={styles.groupCount}>{activeCount}</span> : null}
        <Icon
          name="chevron-down"
          size={18}
          className={[styles.groupChevron, open ? styles.groupChevronOpen : '']
            .filter(Boolean)
            .join(' ')}
        />
      </button>

      {open ? <div className={styles.groupBody}>{children}</div> : null}
    </div>
  );
}

/** Checkbox list that collapses past a threshold so the panel stays scannable. */
function FacetList({
  options,
  selected,
  onToggle,
  initialVisible = 6,
}: {
  options: { value: string; count?: number }[];
  selected: string[];
  onToggle: (value: string) => void;
  initialVisible?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? options : options.slice(0, initialVisible);
  const hidden = options.length - visible.length;

  return (
    <>
      <div className={options.length > 8 && expanded ? styles.scrollList : undefined}>
        {visible.map((option) => (
          <Checkbox
            key={option.value}
            label={option.value}
            count={option.count}
            checked={selected.includes(option.value)}
            onChange={() => onToggle(option.value)}
          />
        ))}
      </div>

      {hidden > 0 || expanded ? (
        <button type="button" className={styles.showMore} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show fewer' : `Show ${hidden} more`}
        </button>
      ) : null}
    </>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={styles.switch}
      data-on={on}
      onClick={() => onChange(!on)}
    >
      <span className={styles.switchKnob} />
    </button>
  );
}

export interface FilterPanelProps {
  query: VehicleQuery;
  facets: VehicleFacets | undefined;
  onChange: (patch: Partial<VehicleQuery>) => void;
  onClear: () => void;
  /** Hidden when the panel is already scoped to one garage. */
  showVerifiedToggle?: boolean;
}

/**
 * The filter controls themselves. Rendered inside the desktop sidebar and
 * inside the mobile drawer, so the two stay in step by construction.
 */
export function FilterPanel({
  query,
  facets,
  onChange,
  showVerifiedToggle = true,
}: FilterPanelProps) {
  /** Adds or removes one value from a multi-select filter. */
  function toggleValue(key: 'make' | 'model' | 'bodyType' | 'fuelType' | 'transmission' | 'condition' | 'area', value: string) {
    const current = (query[key] as string[] | undefined) ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    // Changing a make invalidates any model selected under a different make.
    const patch: Partial<VehicleQuery> = { [key]: next.length > 0 ? next : undefined };
    if (key === 'make') patch.model = undefined;

    onChange(patch);
  }

  // Models are only offered once a make narrows the list to something usable.
  const modelOptions = (query.make ?? []).flatMap((make) => MAKE_MODELS[make] ?? []);

  return (
    <div className={styles.panel}>
      <FilterGroup title="Keyword" defaultOpen={Boolean(query.q)} activeCount={query.q ? 1 : 0}>
        <TextField
          icon="search"
          placeholder="Make, model or colour"
          value={query.q ?? ''}
          onChange={(event) => onChange({ q: event.target.value || undefined })}
          aria-label="Keyword search"
        />
      </FilterGroup>

      <FilterGroup title="Make" activeCount={query.make?.length ?? 0}>
        <FacetList
          options={(facets?.makes ?? []).map((bucket) => ({
            value: bucket.value,
            count: bucket.count,
          }))}
          selected={query.make ?? []}
          onToggle={(value) => toggleValue('make', value)}
        />
      </FilterGroup>

      {modelOptions.length > 0 ? (
        <FilterGroup title="Model" activeCount={query.model?.length ?? 0}>
          <FacetList
            options={modelOptions.map((value) => ({ value }))}
            selected={query.model ?? []}
            onToggle={(value) => toggleValue('model', value)}
            initialVisible={8}
          />
        </FilterGroup>
      ) : null}

      <FilterGroup title="Price" activeCount={query.minPrice != null || query.maxPrice != null ? 1 : 0}>
        <RangeFields
          label="Price (Pula)"
          minValue={query.minPrice}
          maxValue={query.maxPrice}
          onMinChange={(value) => onChange({ minPrice: value })}
          onMaxChange={(value) => onChange({ maxPrice: value })}
          minPlaceholder="P min"
          maxPlaceholder="P max"
          step={5000}
          hint={
            facets
              ? `Listings run from P${facets.priceRange.min.toLocaleString()} to P${facets.priceRange.max.toLocaleString()}`
              : undefined
          }
        />
      </FilterGroup>

      <FilterGroup title="Body type" activeCount={query.bodyType?.length ?? 0}>
        <FacetList
          options={(facets?.bodyTypes ?? []).map((bucket) => ({
            value: bucket.value,
            count: bucket.count,
          }))}
          selected={query.bodyType ?? []}
          onToggle={(value) => toggleValue('bodyType', value)}
        />
      </FilterGroup>

      <FilterGroup title="Year" activeCount={query.minYear != null || query.maxYear != null ? 1 : 0} defaultOpen={false}>
        <RangeFields
          label="Model year"
          minValue={query.minYear}
          maxValue={query.maxYear}
          onMinChange={(value) => onChange({ minYear: value })}
          onMaxChange={(value) => onChange({ maxYear: value })}
          minPlaceholder="From"
          maxPlaceholder="To"
        />
      </FilterGroup>

      <FilterGroup
        title="Mileage"
        activeCount={query.minMileage != null || query.maxMileage != null ? 1 : 0}
        defaultOpen={false}
      >
        <RangeFields
          label="Mileage (km)"
          minValue={query.minMileage}
          maxValue={query.maxMileage}
          onMinChange={(value) => onChange({ minMileage: value })}
          onMaxChange={(value) => onChange({ maxMileage: value })}
          step={10000}
        />
      </FilterGroup>

      <FilterGroup title="Transmission" activeCount={query.transmission?.length ?? 0} defaultOpen={false}>
        <FacetList
          options={(facets?.transmissions ?? []).map((bucket) => ({
            value: bucket.value,
            count: bucket.count,
          }))}
          selected={query.transmission ?? []}
          onToggle={(value) => toggleValue('transmission', value)}
        />
      </FilterGroup>

      <FilterGroup title="Fuel type" activeCount={query.fuelType?.length ?? 0} defaultOpen={false}>
        <FacetList
          options={(facets?.fuelTypes ?? []).map((bucket) => ({
            value: bucket.value,
            count: bucket.count,
          }))}
          selected={query.fuelType ?? []}
          onToggle={(value) => toggleValue('fuelType', value)}
        />
      </FilterGroup>

      <FilterGroup title="Area" activeCount={query.area?.length ?? 0} defaultOpen={false}>
        <FacetList
          options={
            facets?.areas.map((bucket) => ({ value: bucket.value, count: bucket.count })) ??
            GABORONE_AREAS.map((value) => ({ value }))
          }
          selected={query.area ?? []}
          onToggle={(value) => toggleValue('area', value)}
        />
      </FilterGroup>

      <FilterGroup title="Condition" activeCount={query.condition?.length ?? 0} defaultOpen={false}>
        <FacetList
          options={CONDITIONS.map((value) => ({ value }))}
          selected={query.condition ?? []}
          onToggle={(value) => toggleValue('condition', value)}
        />
      </FilterGroup>

      {showVerifiedToggle ? (
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>
            Verified garages only
            <span className={styles.toggleHint}>Documents checked by Motora</span>
          </span>
          <Switch
            on={Boolean(query.verifiedOnly)}
            onChange={(on) => onChange({ verifiedOnly: on || undefined })}
            label="Verified garages only"
          />
        </div>
      ) : null}
    </div>
  );
}

/** Desktop presentation: a sticky sidebar beside the results. */
export function FilterSidebar(props: FilterPanelProps) {
  const activeCount = countActiveFilters(props.query);

  return (
    <aside className={styles.sidebar} aria-label="Filters">
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Filters</h2>
        {activeCount > 0 ? (
          <button type="button" className={styles.clearAll} onClick={props.onClear}>
            Clear all
          </button>
        ) : null}
      </div>

      <FilterPanel {...props} />
    </aside>
  );
}
