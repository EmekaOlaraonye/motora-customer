import { Link, useParams } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { FilterPanel } from '../components/search/FilterPanel';
import {
  ActiveFilterChips,
  ResultsToolbar,
  resultsSummary,
} from '../components/search/ResultsToolbar';
import { Badge } from '../components/ui/Badge';
import { Button, ButtonLink } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Drawer } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState, StateBlock } from '../components/ui/StateBlock';
import { VehicleGrid } from '../components/vehicle/VehicleGrid';
import { useGarage } from '../hooks/useGarages';
import { useVehicleQuery } from '../hooks/useVehicleQuery';
import { useVehicleSearch } from '../hooks/useVehicles';
import { pluralise, toTelHref, toWhatsAppHref } from '../utils/format';
import { useState } from 'react';
import styles from './GarageDetailPage.module.css';

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function GarageDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const garage = useGarage(slug);

  const { query, updateQuery, clearQuery } = useVehicleQuery({ pageSize: 9 });
  // Listings are always scoped to this garage, whatever else the customer filters by.
  const scopedQuery = { ...query, garageId: garage.data?.id };
  const search = useVehicleSearch(garage.data ? scopedQuery : {});

  const [filtersOpen, setFiltersOpen] = useState(false);

  if (garage.loading) {
    return (
      <div className="container section">
        <Skeleton shape="rect" height="280px" />
        <div style={{ height: 'var(--space-8)' }} />
        <Skeleton shape="rect" height="320px" />
      </div>
    );
  }

  if (garage.error) {
    return (
      <div className="container section">
        {garage.error.code === 'not_found' ? (
          <StateBlock
            icon="garage"
            tone="neutral"
            title="We could not find that garage"
            description="It may have been removed from Motora. Browse the full list to find another dealer in Gaborone."
            actions={
              <ButtonLink to="/garages" variant="primary">
                All garages
              </ButtonLink>
            }
          />
        ) : (
          <ErrorState error={garage.error} onRetry={garage.retry} />
        )}
      </div>
    );
  }

  const data = garage.data;
  if (!data) return null;

  const result = search.data;
  const vehicles = result?.items ?? [];

  return (
    <div className="page-enter">
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true">
          <SafeImage
            src={data.coverImageUrl}
            alt=""
            ratio="auto"
            className={styles.heroImage}
            loading="eager"
            style={{ position: 'absolute', inset: 0, aspectRatio: 'auto' }}
          />
          <span className={styles.heroScrim} />
        </div>

        <div className={`container ${styles.heroInner}`}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/garages">Garages</Link>
            <span>/</span>
            <span>{data.name}</span>
          </nav>

          <div className={styles.identity}>
            <span className={styles.monogram} aria-hidden="true">
              {monogram(data.name)}
            </span>

            <div className={styles.identityText}>
              <h1 className={styles.name}>{data.name}</h1>

              <div className={styles.metaRow}>
                <span className={styles.rating}>
                  <Icon name="star" size={15} className={styles.ratingStar} />
                  {data.rating.toFixed(1)}
                </span>
                <span>{data.reviewCount} reviews</span>
                <span className={styles.metaItem}>
                  <Icon name="map-pin" size={15} />
                  {data.location.area}, {data.location.city}
                </span>
                <span className={styles.metaItem}>
                  <Icon name="car" size={15} />
                  {pluralise(data.listingCount, 'car')} listed
                </span>
                {data.verified ? (
                  <Badge tone="overlay" icon="shield-check" pill size="sm">
                    Verified by Motora
                  </Badge>
                ) : null}
              </div>

              <p className={styles.description}>{data.description}</p>

              <div className={styles.specialties}>
                {data.specialties.map((specialty) => (
                  <span key={specialty} className={styles.specialty}>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.heroActions}>
            <ButtonLink to={toTelHref(data.contact.phone)} external variant="primary" size="lg" icon="phone">
              Call the garage
            </ButtonLink>

            {data.contact.whatsapp ? (
              <ButtonLink
                to={toWhatsAppHref(
                  data.contact.whatsapp,
                  `Hello ${data.name}, I found you on Motora and would like to ask about your available cars.`,
                )}
                external
                target="_blank"
                rel="noopener noreferrer"
                variant="success"
                size="lg"
                icon="whatsapp"
              >
                WhatsApp
              </ButtonLink>
            ) : null}

            <ButtonLink to={`mailto:${data.contact.email}`} external variant="onDark" size="lg" icon="mail">
              Email
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className={styles.infoStrip}>
        <div className={`container ${styles.infoGrid}`}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <Icon name="map-pin" size={18} />
            </span>
            <span>
              <span className={styles.infoLabel}>Address</span>
              <span className={styles.infoValue}>
                {data.location.addressLine}
                <br />
                {data.location.area}, {data.location.city}
              </span>
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <Icon name="clock" size={18} />
            </span>
            <span>
              <span className={styles.infoLabel}>Opening hours</span>
              <span className={styles.infoValue}>
                <span className={styles.hoursList}>
                  {data.openingHours.map((entry) => (
                    <span key={entry.day} className={styles.hoursRow}>
                      <span className={styles.hoursDay}>{entry.day}</span>
                      <span className={styles.hoursValue}>{entry.hours}</span>
                    </span>
                  ))}
                </span>
              </span>
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>
              <Icon name="phone" size={18} />
            </span>
            <span>
              <span className={styles.infoLabel}>Contact</span>
              <span className={styles.infoValue}>
                <a href={toTelHref(data.contact.phone)}>{data.contact.phone}</a>
                <br />
                <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>
                {data.contact.website ? (
                  <>
                    <br />
                    <a
                      href={`https://${data.contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {data.contact.website}
                    </a>
                  </>
                ) : null}
              </span>
            </span>
          </div>
        </div>
      </section>

      <div className={`container ${styles.listings}`}>
        <div className={styles.listingsHead}>
          <div>
            <h2 className={styles.listingsTitle}>Cars from {data.name}</h2>
            <p className={styles.listingsSubtitle}>
              Everything currently on the floor at {data.location.area}.
            </p>
          </div>
        </div>

        <ResultsToolbar
          total={result?.total ?? 0}
          loading={search.loading}
          query={query}
          onSortChange={(sort) => updateQuery({ sort })}
          onOpenFilters={() => setFiltersOpen(true)}
        />

        <ActiveFilterChips query={query} onChange={updateQuery} onClear={clearQuery} />

        {search.error ? (
          <ErrorState error={search.error} onRetry={search.retry} />
        ) : !search.loading && vehicles.length === 0 ? (
          <EmptyState
            icon="car"
            title="No cars match those filters"
            description={`${data.name} has ${pluralise(data.listingCount, 'car')} listed in total. Try clearing the filters to see everything.`}
            actions={
              <Button variant="primary" onClick={clearQuery}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <VehicleGrid
              vehicles={vehicles}
              loading={search.loading}
              refreshing={search.refreshing}
              skeletonCount={6}
            />

            {result ? (
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                onPageChange={(page) => {
                  updateQuery({ page });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                summary={resultsSummary(result.page, result.pageSize, result.total)}
              />
            ) : null}
          </>
        )}
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        subtitle={`${result?.total ?? 0} cars at ${data.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={clearQuery} fullWidth>
              Clear all
            </Button>
            <Button variant="primary" onClick={() => setFiltersOpen(false)} fullWidth>
              Show results
            </Button>
          </>
        }
      >
        <FilterPanel
          query={query}
          facets={result?.facets}
          onChange={updateQuery}
          onClear={clearQuery}
          showVerifiedToggle={false}
        />
      </Drawer>
    </div>
  );
}
