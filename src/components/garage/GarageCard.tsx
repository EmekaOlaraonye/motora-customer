import { Link } from 'react-router-dom';
import type { Garage } from '../../types';
import { pluralise } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import styles from './GarageCard.module.css';

export function GarageCard({ garage }: { garage: Garage }) {
  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        <SafeImage
          src={garage.coverImageUrl}
          alt={`${garage.name} forecourt`}
          ratio="16 / 9"
          className={styles.coverImage}
          sizes="(max-width: 640px) 100vw, 320px"
        />
        <span className={styles.coverScrim} aria-hidden="true" />

        {garage.verified ? (
          <span className={styles.coverBadge}>
            <Badge tone="overlay" icon="shield-check" pill size="sm">
              Verified
            </Badge>
          </span>
        ) : null}

        <div className={styles.coverName}>
          <h3 className={styles.name}>
            <Link to={`/garages/${garage.slug}`} className={styles.nameLink}>
              {garage.name}
            </Link>
          </h3>
          <span className={styles.area}>
            <Icon name="map-pin" size={12} />
            {garage.location.area}, {garage.location.city}
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.description}>{garage.description}</p>

        <div className={styles.specialties}>
          {garage.specialties.slice(0, 2).map((specialty) => (
            <Badge key={specialty} tone="neutral" size="sm">
              {specialty}
            </Badge>
          ))}
        </div>

        <div className={styles.meta}>
          <span className={styles.rating}>
            <Icon name="star" size={14} className={styles.ratingStar} />
            {garage.rating.toFixed(1)}
            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
              ({garage.reviewCount})
            </span>
          </span>

          <span className={styles.listings}>{pluralise(garage.listingCount, 'car')}</span>
        </div>
      </div>
    </article>
  );
}
