import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EnquiryForm } from '../components/enquiry/EnquiryForm';
import { GaragePanel, MobileContactBar } from '../components/garage/GaragePanel';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Icon, type IconName } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState, StateBlock } from '../components/ui/StateBlock';
import { VehicleGallery } from '../components/vehicle/VehicleGallery';
import { VehicleGrid } from '../components/vehicle/VehicleGrid';
import { MAX_COMPARE, useCompare } from '../context/CompareContext';
import { useSavedVehicles } from '../context/SavedVehiclesContext';
import { useToast } from '../context/ToastContext';
import { useRelatedVehicles, useVehicle } from '../hooks/useVehicles';
import type { VehicleWithGarage } from '../types';
import {
  formatDate,
  formatEngine,
  formatMileage,
  formatNumber,
  formatPrice,
  formatRelativeDate,
  vehicleName,
  vehicleTitle,
} from '../utils/format';
import { browseHref } from '../utils/queryParams';
import styles from './VehicleDetailPage.module.css';

/** The four figures a buyer checks first. */
function keySpecs(vehicle: VehicleWithGarage): { icon: IconName; value: string; label: string }[] {
  return [
    { icon: 'calendar', value: String(vehicle.year), label: 'Model year' },
    { icon: 'gauge', value: formatMileage(vehicle.mileage), label: 'Mileage' },
    { icon: 'gearbox', value: vehicle.transmission, label: 'Transmission' },
    { icon: 'fuel', value: vehicle.fuelType, label: 'Fuel' },
  ];
}

/** The full specification table, in the order a buyer reads it. */
function fullSpecs(vehicle: VehicleWithGarage): [string, string][] {
  const rows: [string, string][] = [
    ['Make', vehicle.make],
    ['Model', vehicle.model],
    ['Year', String(vehicle.year)],
    ['Body type', vehicle.bodyType],
    ['Condition', vehicle.condition],
    ['Mileage', formatMileage(vehicle.mileage)],
    ['Transmission', vehicle.transmission],
    ['Fuel type', vehicle.fuelType],
    ['Engine size', formatEngine(vehicle.engineSize)],
    ['Drivetrain', vehicle.drivetrain],
    ['Exterior colour', vehicle.exteriorColour],
    ['Doors', String(vehicle.doors)],
    ['Seats', String(vehicle.seats)],
    ['Location', `${vehicle.location.area}, ${vehicle.location.city}`],
  ];

  if (vehicle.variant) rows.splice(2, 0, ['Variant', vehicle.variant]);
  if (vehicle.enginePower) rows.splice(9, 0, ['Power', `${vehicle.enginePower} kW`]);
  if (vehicle.interiorColour) rows.push(['Interior', vehicle.interiorColour]);

  rows.push(['Listed', formatDate(vehicle.listedAt)]);

  return rows;
}

function DetailSkeleton() {
  return (
    <div className={`container ${styles.layout}`} style={{ paddingTop: 'var(--space-6)' }}>
      <div className={styles.skeletonBlock}>
        <Skeleton shape="rect" height="420px" className={styles.skeletonStage} />
        <Skeleton width="60%" height="2.2rem" />
        <Skeleton width="35%" height="2.6rem" />
        <Skeleton shape="rect" height="120px" />
        <Skeleton shape="rect" height="200px" />
      </div>
      <Skeleton shape="rect" height="440px" />
    </div>
  );
}

export function VehicleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: vehicle, loading, error, retry } = useVehicle(slug);
  const related = useRelatedVehicles(vehicle?.id, 4);

  const { isSaved, toggleSaved } = useSavedVehicles();
  const { isCompared, toggleCompare } = useCompare();
  const { showToast } = useToast();

  const [enquiryOpen, setEnquiryOpen] = useState(false);

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="container section">
        {error.code === 'not_found' ? (
          <StateBlock
            icon="car"
            tone="neutral"
            title="This listing is no longer available"
            description="It may have been sold or withdrawn by the garage. There are plenty of other cars listed across Gaborone."
            actions={
              <Button variant="primary" onClick={() => window.location.assign('/vehicles')}>
                Browse all cars
              </Button>
            }
          />
        ) : (
          <ErrorState error={error} onRetry={retry} />
        )}
      </div>
    );
  }

  if (!vehicle) return null;

  const saved = isSaved(vehicle.id);
  const compared = isCompared(vehicle.id);
  const title = vehicleTitle(vehicle);

  function onToggleSave() {
    if (!vehicle) return;
    const nowSaved = toggleSaved(vehicle.id);
    showToast({
      tone: nowSaved ? 'success' : 'info',
      title: nowSaved ? 'Saved to your list' : 'Removed from your list',
      description: title,
    });
  }

  function onToggleCompare() {
    if (!vehicle) return;
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
      description: title,
    });
  }

  async function onShare() {
    const url = window.location.href;

    // Use the platform share sheet on phones; fall back to the clipboard.
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // The customer dismissed the sheet — nothing to report.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast({ tone: 'success', title: 'Link copied', description: 'Share it with anyone.' });
    } catch {
      showToast({ tone: 'error', title: 'Could not copy the link' });
    }
  }

  return (
    <div className={`${styles.page} page-enter`}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to="/vehicles">Cars</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to={browseHref({ make: [vehicle.make] })}>{vehicle.make}</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{vehicleName(vehicle)}</span>
        </nav>
      </div>

      <div className={`container ${styles.layout}`}>
        <div className={styles.main}>
          <VehicleGallery images={vehicle.images} title={title} status={vehicle.status} />

          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              <div>
                <h1 className={styles.title}>
                  {vehicle.year} {vehicleName(vehicle)}
                  {vehicle.variant ? <span className={styles.variant}>{vehicle.variant}</span> : null}
                </h1>
              </div>

              <div className={styles.titleActions}>
                <Button
                  variant="secondary"
                  icon="heart"
                  onClick={onToggleSave}
                  aria-pressed={saved}
                  aria-label={saved ? 'Remove from saved cars' : 'Save this car'}
                >
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="secondary"
                  icon="compare"
                  onClick={onToggleCompare}
                  aria-pressed={compared}
                >
                  {compared ? 'Comparing' : 'Compare'}
                </Button>
                <Button variant="secondary" icon="share" onClick={onShare} aria-label="Share this listing" />
              </div>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.price}>{formatPrice(vehicle.price)}</span>
              {vehicle.negotiable ? <span className={styles.negotiable}>Negotiable</span> : null}
            </div>

            <div className={styles.badges}>
              <StatusBadge status={vehicle.status} />
              <Badge tone="neutral" pill>
                {vehicle.condition} condition
              </Badge>
              {vehicle.garage.verified ? (
                <Badge tone="brand" icon="shield-check" pill>
                  Verified garage
                </Badge>
              ) : null}
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <Icon name="map-pin" size={15} />
                {vehicle.location.area}, {vehicle.location.city}
              </span>
              <span className={styles.metaItem}>
                <Icon name="clock" size={15} />
                Listed {formatRelativeDate(vehicle.listedAt).toLowerCase()}
              </span>
              <span className={styles.metaItem}>
                <Icon name="eye" size={15} />
                {formatNumber(vehicle.views)} views
              </span>
            </div>
          </div>

          <div className={styles.keySpecs}>
            {keySpecs(vehicle).map((spec) => (
              <div key={spec.label} className={styles.keySpec}>
                <Icon name={spec.icon} size={22} className={styles.keySpecIcon} />
                <span className={styles.keySpecValue}>{spec.value}</span>
                <span className={styles.keySpecLabel}>{spec.label}</span>
              </div>
            ))}
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>About this vehicle</h2>
            <p className={styles.description}>{vehicle.description}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What the garage confirms</h2>
            <div className={styles.assurances}>
              <div className={styles.assurance}>
                <span
                  className={[
                    styles.assuranceIcon,
                    vehicle.serviceHistory ? '' : styles.assuranceIconMuted,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Icon name={vehicle.serviceHistory ? 'check' : 'info'} size={18} />
                </span>
                <span className={styles.assuranceText}>
                  <span className={styles.assuranceTitle}>
                    {vehicle.serviceHistory ? 'Full service history' : 'Partial service history'}
                  </span>
                  <span className={styles.assuranceHint}>
                    {vehicle.serviceHistory ? 'Records available on request' : 'Ask the garage for details'}
                  </span>
                </span>
              </div>

              <div className={styles.assurance}>
                <span
                  className={[
                    styles.assuranceIcon,
                    vehicle.accidentFree ? '' : styles.assuranceIconMuted,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Icon name={vehicle.accidentFree ? 'check' : 'info'} size={18} />
                </span>
                <span className={styles.assuranceText}>
                  <span className={styles.assuranceTitle}>
                    {vehicle.accidentFree ? 'No accident history' : 'Previously repaired'}
                  </span>
                  <span className={styles.assuranceHint}>As declared by the garage</span>
                </span>
              </div>

              <div className={styles.assurance}>
                <span
                  className={[
                    styles.assuranceIcon,
                    vehicle.garage.verified ? '' : styles.assuranceIconMuted,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Icon name="shield-check" size={18} />
                </span>
                <span className={styles.assuranceText}>
                  <span className={styles.assuranceTitle}>
                    {vehicle.garage.verified ? 'Verified garage' : 'Garage not yet verified'}
                  </span>
                  <span className={styles.assuranceHint}>
                    {vehicle.garage.verified ? 'Trading documents checked' : 'Verification in progress'}
                  </span>
                </span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Specification</h2>
            <div className={styles.specGrid}>
              {fullSpecs(vehicle).map(([label, value]) => (
                <div key={label} className={styles.specRow}>
                  <span className={styles.specLabel}>{label}</span>
                  <span className={styles.specValue}>{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Features</h2>
            <div className={styles.features}>
              {vehicle.features.map((feature) => (
                <span key={feature} className={styles.feature}>
                  <Icon name="check" size={15} className={styles.featureTick} strokeWidth={2.6} />
                  {feature}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.aside}>
          <GaragePanel
            garage={vehicle.garage}
            vehicle={vehicle}
            onEnquire={() => setEnquiryOpen(true)}
            sticky
          />
        </aside>
      </div>

      {(related.data ?? []).length > 0 ? (
        <section className={`container ${styles.related}`}>
          <h2 className={styles.relatedTitle}>More cars you might like</h2>
          <p className={styles.relatedSubtitle}>
            Other listings from {vehicle.garage.name} and similar vehicles elsewhere in Gaborone.
          </p>
          <VehicleGrid vehicles={related.data ?? []} loading={related.loading} columns="four" />
        </section>
      ) : null}

      <MobileContactBar vehicle={vehicle} onEnquire={() => setEnquiryOpen(true)} />

      <Modal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        title={`Enquire about this ${vehicleName(vehicle)}`}
        subtitle={`Your message goes straight to ${vehicle.garage.name}`}
      >
        <EnquiryForm vehicle={vehicle} onDone={() => setEnquiryOpen(false)} />
      </Modal>
    </div>
  );
}
