import { Link } from 'react-router-dom';
import { GarageCard } from '../components/garage/GarageCard';
import { HeroSearch } from '../components/search/HeroSearch';
import { ButtonLink } from '../components/ui/Button';
import { Icon, type IconName } from '../components/ui/Icon';
import { ErrorState } from '../components/ui/StateBlock';
import { VehicleGrid } from '../components/vehicle/VehicleGrid';
import { BODY_TYPES, GABORONE_AREAS } from '../data/taxonomy';
import { useGarages } from '../hooks/useGarages';
import { useFeaturedVehicles, useVehicleSearch } from '../hooks/useVehicles';
import { browseHref } from '../utils/queryParams';
import styles from './HomePage.module.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&crop=focalpoint&fp-x=0.64&fp-y=0.72&fp-z=1.25&w=2000&h=1125&q=80';

const TRUST_POINTS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'shield-check',
    title: 'Verified garages',
    text: 'We check the trading documents of every garage marked as verified, so you know who you are dealing with before you drive across town.',
  },
  {
    icon: 'eye',
    title: 'Honest listings',
    text: 'Mileage, condition, service history and accident status are stated up front on every listing. What you read is what you will find on the forecourt.',
  },
  {
    icon: 'phone',
    title: 'Talk to the seller',
    text: 'No middleman and no lead fees. Call, WhatsApp or email the garage directly, with the vehicle details already attached to your enquiry.',
  },
];

export function HomePage() {
  const featured = useFeaturedVehicles(6);
  const garages = useGarages();

  // A one-item search is the cheapest way to read the live listing total; the
  // items are discarded and only `total` is used.
  const catalogue = useVehicleSearch({ pageSize: 1 });

  const garageCount = garages.data?.length ?? 0;
  const vehicleCount = catalogue.data?.total ?? 0;
  const areaCount = GABORONE_AREAS.length;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true">
          <img src={HERO_IMAGE} alt="" className={styles.heroImage} fetchPriority="high" />
          <span className={styles.heroScrim} />
        </div>

        <div className={`container ${styles.heroInner}`}>
          <span className={styles.eyebrow}>
            <Icon name="map-pin" size={15} />
            Serving Gaborone and surrounds
          </span>

          <h1 className={styles.title}>
            Find your next car from{' '}
            <span className={styles.titleAccent}>garages across Gaborone</span>
          </h1>

          <p className={styles.subtitle}>
            Every listing on Motora comes from a real garage or dealer in the city. Compare what is
            actually available, see the full details, and speak to the seller yourself.
          </p>

          <div className={styles.searchWrap}>
            <HeroSearch totalVehicles={vehicleCount} totalGarages={garageCount} />
          </div>

          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Cars listed</dt>
              <dd className={styles.statValue}>{vehicleCount}</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Garages</dt>
              <dd className={styles.statValue}>{garageCount}</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Areas covered</dt>
              <dd className={styles.statValue}>{areaCount}</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Enquiry fee</dt>
              <dd className={styles.statValue}>P0</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Browse by body type</h2>
              <p className={styles.sectionSubtitle}>
                Whether you need a bakkie for the plot or a small hatch for the commute into town.
              </p>
            </div>
          </div>

          <div className={styles.bodyGrid}>
            {BODY_TYPES.map((bodyType) => (
              <Link
                key={bodyType}
                to={browseHref({ bodyType: [bodyType] })}
                className={styles.bodyTile}
              >
                <span className={styles.bodyIcon}>
                  <Icon name="car" size={22} />
                </span>
                <span className={styles.bodyName}>{bodyType}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Featured this week</h2>
              <p className={styles.sectionSubtitle}>
                Hand-picked listings from garages with a strong track record on Motora.
              </p>
            </div>
            <Link to="/vehicles" className={styles.viewAll}>
              View all cars
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>

          {featured.error ? (
            <ErrorState error={featured.error} onRetry={featured.retry} />
          ) : (
            <VehicleGrid
              vehicles={featured.data ?? []}
              loading={featured.loading}
              skeletonCount={6}
            />
          )}
        </div>
      </section>

      <section className={`section ${styles.trustSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Buying a car should not feel like a gamble</h2>
              <p className={styles.sectionSubtitle}>
                Motora exists to make the Gaborone used-car market easier to read.
              </p>
            </div>
          </div>

          <div className={styles.trustGrid}>
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className={styles.trustItem}>
                <span className={styles.trustIcon}>
                  <Icon name={point.icon} size={22} />
                </span>
                <h3 className={styles.trustTitle}>{point.title}</h3>
                <p className={styles.trustText}>{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Garages on Motora</h2>
              <p className={styles.sectionSubtitle}>
                Established dealers and independent yards from Broadhurst to Mogoditshane.
              </p>
            </div>
            <Link to="/garages" className={styles.viewAll}>
              All garages
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>

          <div className={styles.garageGrid}>
            {(garages.data ?? []).slice(0, 4).map((garage) => (
              <GarageCard key={garage.id} garage={garage} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>The modern way to find cars in Gaborone</h2>
            <p className={styles.ctaText}>
              Start with a search, narrow it down to what actually fits your budget, and contact the
              garage directly. No account needed.
            </p>
            <div className={styles.ctaActions}>
              <ButtonLink to="/vehicles" variant="primary" size="lg" icon="search">
                Browse all cars
              </ButtonLink>
              <ButtonLink to="/garages" variant="onDark" size="lg" icon="garage">
                Explore garages
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
