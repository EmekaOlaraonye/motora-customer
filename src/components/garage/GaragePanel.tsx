import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { Garage, VehicleWithGarage } from '../../types';
import {
  formatPrice,
  pluralise,
  toTelHref,
  toWhatsAppHref,
  vehicleTitle,
} from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button, ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import styles from './GaragePanel.module.css';

/** First letters of the garage name, used when no logo has been uploaded. */
function monogram(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

/** The WhatsApp message a customer sends, with the listing already referenced. */
function whatsAppMessage(vehicle: VehicleWithGarage): string {
  return `Hello ${vehicle.garage.name}, I saw the ${vehicleTitle(vehicle)} listed on Motora for ${formatPrice(vehicle.price)}. Is it still available?`;
}

export interface GaragePanelProps {
  garage: Garage;
  /** Present on the vehicle page — enables listing-aware contact actions. */
  vehicle?: VehicleWithGarage;
  onEnquire?: () => void;
  sticky?: boolean;
}

export function GaragePanel({ garage, vehicle, onEnquire, sticky = false }: GaragePanelProps) {
  const message = vehicle ? whatsAppMessage(vehicle) : undefined;

  return (
    <section
      className={[styles.panel, sticky ? styles.sticky : ''].filter(Boolean).join(' ')}
      aria-label="Seller information"
    >
      <header className={styles.header}>
        <span className={styles.monogram} aria-hidden="true">
          {monogram(garage.name)}
        </span>

        <div className={styles.identity}>
          <h2 className={styles.name}>
            <Link to={`/garages/${garage.slug}`} className={styles.nameLink}>
              {garage.name}
            </Link>
          </h2>

          <div className={styles.metaRow}>
            <span className={styles.rating}>
              <Icon name="star" size={13} className={styles.ratingStar} />
              {garage.rating.toFixed(1)}
            </span>
            <span>({garage.reviewCount} reviews)</span>
            {garage.verified ? (
              <Badge tone="brand" icon="shield-check" pill size="sm">
                Verified
              </Badge>
            ) : null}
          </div>
        </div>
      </header>

      <div className={styles.details}>
        <p className={styles.detailRow}>
          <Icon name="map-pin" size={16} />
          <span>
            {garage.location.addressLine}
            <br />
            {garage.location.area}, {garage.location.city}
          </span>
        </p>

        <p className={styles.detailRow}>
          <Icon name="clock" size={16} />
          <span>
            {garage.openingHours[0]?.day}: {garage.openingHours[0]?.hours}
            <br />
            {garage.openingHours[1]?.day}: {garage.openingHours[1]?.hours}
          </span>
        </p>

        <p className={styles.detailRow}>
          <Icon name="garage" size={16} />
          <span>
            {pluralise(garage.listingCount, 'car')} currently listed
            {garage.establishedYear ? ` · Trading since ${garage.establishedYear}` : ''}
          </span>
        </p>
      </div>

      <div className={styles.actions}>
        {onEnquire ? (
          <Button variant="primary" size="lg" icon="mail" onClick={onEnquire} fullWidth>
            Send an enquiry
          </Button>
        ) : null}

        <div className={styles.actionRow}>
          <ButtonLink
            to={toTelHref(garage.contact.phone)}
            external
            variant="secondary"
            icon="phone"
            aria-label={`Call ${garage.name}`}
          >
            Call
          </ButtonLink>

          {garage.contact.whatsapp ? (
            <ButtonLink
              to={toWhatsAppHref(garage.contact.whatsapp, message)}
              external
              target="_blank"
              rel="noopener noreferrer"
              variant="success"
              icon="whatsapp"
              aria-label={`WhatsApp ${garage.name}`}
            >
              WhatsApp
            </ButtonLink>
          ) : (
            <ButtonLink
              to={`mailto:${garage.contact.email}`}
              external
              variant="secondary"
              icon="mail"
            >
              Email
            </ButtonLink>
          )}
        </div>

        <Link to={`/garages/${garage.slug}`} className={styles.viewAll}>
          See all cars from this garage
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>

      <p className={styles.footerNote}>
        Motora lists vehicles on behalf of garages. Always view a vehicle in person and confirm the
        paperwork before paying any deposit.
      </p>
    </section>
  );
}

/**
 * Fixed contact bar shown on phones, where the sidebar is not visible.
 *
 * Rendered through a portal: the page wrapper runs an entrance animation whose
 * final transform keeps a containing block alive, which would otherwise anchor
 * `position: fixed` to the page rather than the viewport.
 */
export function MobileContactBar({
  vehicle,
  onEnquire,
}: {
  vehicle: VehicleWithGarage;
  onEnquire: () => void;
}) {
  return createPortal(
    <div className={styles.mobileBar}>
      <div className={styles.mobileBarPrice}>
        <span className={styles.mobileBarPriceValue}>{formatPrice(vehicle.price)}</span>
        <span className={styles.mobileBarLabel}>
          {vehicle.negotiable ? 'Negotiable' : 'Asking price'}
        </span>
      </div>

      <div className={styles.mobileBarActions}>
        <ButtonLink
          to={toTelHref(vehicle.garage.contact.phone)}
          external
          variant="secondary"
          icon="phone"
          aria-label={`Call ${vehicle.garage.name}`}
        />
        {vehicle.garage.contact.whatsapp ? (
          <ButtonLink
            to={toWhatsAppHref(vehicle.garage.contact.whatsapp, whatsAppMessage(vehicle))}
            external
            target="_blank"
            rel="noopener noreferrer"
            variant="success"
            icon="whatsapp"
            aria-label={`WhatsApp ${vehicle.garage.name}`}
          />
        ) : null}
        <Button variant="primary" icon="mail" onClick={onEnquire}>
          Enquire
        </Button>
      </div>
    </div>,
    document.body,
  );
}
