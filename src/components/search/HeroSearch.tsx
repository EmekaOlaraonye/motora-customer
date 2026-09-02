import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BODY_TYPES, GABORONE_AREAS, MAKE_MODELS, MAKES, PRICE_BANDS } from '../../data/taxonomy';
import type { BodyType, VehicleQuery } from '../../types';
import { browseHref } from '../../utils/queryParams';
import { Button } from '../ui/Button';
import { SelectField, TextField } from '../ui/Field';
import styles from './HeroSearch.module.css';

/** Quick-start searches offered under the panel. */
const POPULAR: { label: string; query: VehicleQuery }[] = [
  { label: 'Toyota Hilux', query: { make: ['Toyota'], model: ['Hilux'] } },
  { label: 'Under P100,000', query: { maxPrice: 100_000 } },
  { label: 'Automatic SUVs', query: { bodyType: ['SUV'], transmission: ['Automatic'] } },
  { label: 'Double cabs', query: { bodyType: ['Double Cab'] } },
  { label: 'First cars', query: { bodyType: ['Hatchback'], maxPrice: 120_000 } },
];

type SearchMode = 'all' | 'make' | 'budget';

const MODE_TABS = [
  ['all', 'Search all cars'],
  ['make', 'By make & model'],
  ['budget', 'By budget'],
] as const;

/**
 * The homepage search panel.
 *
 * Everything here composes a `VehicleQuery` and hands it to the browse page as
 * a URL, so the panel holds no result state of its own.
 */
export function HeroSearch({ totalVehicles, totalGarages }: { totalVehicles: number; totalGarages: number }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState<SearchMode>('all');
  const [keyword, setKeyword] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [area, setArea] = useState('');
  const [priceBand, setPriceBand] = useState('');

  const models = useMemo(() => (make ? (MAKE_MODELS[make] ?? []) : []), [make]);

  function buildQuery(): VehicleQuery {
    const query: VehicleQuery = {};

    if (keyword.trim()) query.q = keyword.trim();
    if (make) query.make = [make];
    if (model) query.model = [model];
    if (bodyType) query.bodyType = [bodyType as BodyType];
    if (area) query.area = [area];

    if (priceBand) {
      const band = PRICE_BANDS[Number(priceBand)];
      if (band) {
        if (band.min > 0) query.minPrice = band.min;
        if (band.max != null) query.maxPrice = band.max;
      }
    }

    return query;
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    navigate(browseHref(buildQuery()));
  }

  function resetAll() {
    setKeyword('');
    setMake('');
    setModel('');
    setBodyType('');
    setArea('');
    setPriceBand('');
  }

  const hasInput = Boolean(keyword || make || model || bodyType || area || priceBand);

  const makeOptions = MAKES.map((value) => ({ value, label: value }));
  const areaOptions = GABORONE_AREAS.map((value) => ({ value, label: value }));

  const areaField = (
    <SelectField
      label="Area"
      placeholder="Anywhere in Gaborone"
      value={area}
      options={areaOptions}
      onChange={(event) => setArea(event.target.value)}
    />
  );

  const makeField = (
    <SelectField
      label="Make"
      placeholder="Any make"
      value={make}
      options={makeOptions}
      onChange={(event) => {
        setMake(event.target.value);
        setModel('');
      }}
    />
  );

  return (
    <div>
      <form className={styles.panel} onSubmit={onSubmit} role="search">
        <div className={styles.tabs} role="tablist" aria-label="Search mode">
          {MODE_TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              className={[styles.tab, mode === value ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'all' ? (
          <div className={styles.keywordRow}>
            <div className={styles.keywordField}>
              <TextField
                icon="search"
                placeholder="What are you looking for? Try Toyota Hilux, or automatic SUV"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                aria-label="Search vehicles"
              />
            </div>
            <Button type="submit" size="lg" icon="search">
              Search
            </Button>
          </div>
        ) : null}

        <div className={styles.fields}>
          {mode !== 'budget' ? (
            <>
              {makeField}
              <SelectField
                label="Model"
                placeholder={make ? 'Any model' : 'Select a make first'}
                value={model}
                disabled={!make}
                options={models.map((value) => ({ value, label: value }))}
                onChange={(event) => setModel(event.target.value)}
              />
            </>
          ) : null}

          <SelectField
            label="Body type"
            placeholder="Any body type"
            value={bodyType}
            options={BODY_TYPES.map((value) => ({ value, label: value }))}
            onChange={(event) => setBodyType(event.target.value)}
          />

          <SelectField
            label="Budget"
            placeholder="Any price"
            value={priceBand}
            options={PRICE_BANDS.map((band, index) => ({ value: String(index), label: band.label }))}
            onChange={(event) => setPriceBand(event.target.value)}
          />

          {mode === 'budget' ? makeField : null}
          {areaField}
        </div>

        <div className={styles.footerRow}>
          <p className={styles.resultHint}>
            <span className={styles.resultCount}>{totalVehicles}</span> cars listed by{' '}
            {totalGarages} garages across Gaborone
          </p>

          <div className={styles.footerActions}>
            {hasInput ? (
              <button type="button" className={styles.reset} onClick={resetAll}>
                Clear
              </button>
            ) : null}
            {mode !== 'all' ? (
              <Button type="submit" size="md" icon="search">
                Show cars
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      <div className={styles.popular}>
        <span className={styles.popularLabel}>Popular:</span>
        {POPULAR.map((item) => (
          <button
            key={item.label}
            type="button"
            className={styles.chip}
            onClick={() => navigate(browseHref(item.query))}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
