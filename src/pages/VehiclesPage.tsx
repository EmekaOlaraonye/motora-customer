import { useEffect, useMemo, useState } from 'react';
import { FilterPanel, FilterSidebar } from '../components/search/FilterPanel';
import { SearchAlertForm } from '../components/search/SearchAlertForm';
import {
  ActiveFilterChips,
  ResultsToolbar,
  resultsSummary,
} from '../components/search/ResultsToolbar';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/Field';
import { Drawer, Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, ErrorState } from '../components/ui/StateBlock';
import { VehicleGrid } from '../components/vehicle/VehicleGrid';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePageMeta, siteOrigin } from '../hooks/usePageMeta';
import { useVehicleQuery } from '../hooks/useVehicleQuery';
import { useVehicleSearch } from '../hooks/useVehicles';
import { buildBrowseMeta } from '../utils/meta';
import { searchParamsFromQuery } from '../utils/queryParams';
import { describeQuery } from '../utils/describeQuery';
import { countActiveFilters } from '../utils/vehicleQuery';
import styles from './VehiclesPage.module.css';

export function VehiclesPage() {
  const { query, updateQuery, clearQuery } = useVehicleQuery({ pageSize: 12 });
  const search = useVehicleSearch(query);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // The visible search box is local so typing stays responsive; the URL is
  // updated only once the customer pauses.
  const [keyword, setKeyword] = useState(query.q ?? '');
  const debouncedKeyword = useDebouncedValue(keyword, 350);

  useEffect(() => {
    const next = debouncedKeyword.trim() || undefined;
    if (next !== query.q) updateQuery({ q: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  // Keep the box in step when the query changes from elsewhere (chips, back button).
  useEffect(() => {
    setKeyword(query.q ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.q]);

  const meta = useMemo(
    () =>
      buildBrowseMeta(
        query,
        siteOrigin(),
        searchParamsFromQuery(query).toString(),
        search.data?.total,
      ),
    [query, search.data?.total],
  );
  usePageMeta(meta);

  const result = search.data;
  const vehicles = result?.items ?? [];
  const total = result?.total ?? 0;
  const hasFilters = countActiveFilters(query) > 0;

  function onPageChange(page: number) {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filterProps = {
    query,
    facets: result?.facets,
    onChange: updateQuery,
    onClear: clearQuery,
  };

  return (
    <div className="page-enter">
      <section className={styles.header}>
        <div className="container page-head">
          <span className="page-head-eyebrow">Every listing</span>
          <h1 className={styles.title}>Cars for sale in Gaborone</h1>
          <p className={styles.subtitle}>
            Browse every vehicle currently listed on Motora. Narrow it down by make, budget, body
            type or the part of the city you want to collect from.
          </p>

          <div className={styles.searchRow}>
            <div className={styles.searchField}>
              <TextField
                icon="search"
                placeholder="Search make, model, colour or garage"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                aria-label="Search vehicles"
              />
            </div>
          </div>
        </div>
      </section>

      <div className={`container ${styles.layout}`}>
        <div className={styles.sidebarColumn}>
          <FilterSidebar {...filterProps} />
        </div>

        <div className={styles.results}>
          <ResultsToolbar
            total={total}
            loading={search.loading}
            query={query}
            onSortChange={(sort) => updateQuery({ sort })}
            onOpenFilters={() => setFiltersOpen(true)}
          />

          <ActiveFilterChips query={query} onChange={updateQuery} onClear={clearQuery} />

          {hasFilters && vehicles.length > 0 ? (
            <div className={styles.alertRow}>
              <Button
                variant="ghost"
                size="sm"
                icon="mail"
                onClick={() => setAlertOpen(true)}
              >
                Alert me about new {describeQuery(query)}
              </Button>
            </div>
          ) : null}

          {search.error ? (
            <ErrorState error={search.error} onRetry={search.retry} />
          ) : !search.loading && vehicles.length === 0 ? (
            <EmptyState
              icon="search"
              title="No cars match those filters"
              description={
                hasFilters
                  ? 'Stock changes every week, so this often just means you arrived between deliveries. We can let you know the moment a match is listed.'
                  : 'There are no listings to show right now. Please check back shortly.'
              }
              actions={
                hasFilters ? (
                  <>
                    <Button variant="primary" icon="mail" onClick={() => setAlertOpen(true)}>
                      Tell me when one arrives
                    </Button>
                    <Button variant="secondary" onClick={clearQuery}>
                      Clear all filters
                    </Button>
                  </>
                ) : null
              }
            />
          ) : (
            <>
              <VehicleGrid
                vehicles={vehicles}
                loading={search.loading}
                refreshing={search.refreshing}
                skeletonCount={query.pageSize ?? 12}
                withSidebar
              />

              {result ? (
                <Pagination
                  page={result.page}
                  totalPages={result.totalPages}
                  onPageChange={onPageChange}
                  summary={resultsSummary(result.page, result.pageSize, result.total)}
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      <Modal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Get an alert for this search"
        subtitle="Stock in Gaborone turns over weekly"
      >
        <SearchAlertForm query={query} onDone={() => setAlertOpen(false)} />
      </Modal>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        subtitle={`${total} ${total === 1 ? 'car' : 'cars'} match`}
        footer={
          <div className={styles.drawerFooterButtons}>
            <Button
              variant="secondary"
              onClick={clearQuery}
              disabled={!hasFilters}
              fullWidth
            >
              Clear all
            </Button>
            <Button variant="primary" onClick={() => setFiltersOpen(false)} fullWidth>
              Show {total} {total === 1 ? 'car' : 'cars'}
            </Button>
          </div>
        }
      >
        <FilterPanel {...filterProps} />
      </Drawer>
    </div>
  );
}
