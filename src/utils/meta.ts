import type { Garage, VehicleQuery, VehicleWithGarage } from '../types';
import { formatMileage, formatPrice, pluralise, vehicleTitle } from './format';

/**
 * Page metadata.
 *
 * This module is deliberately free of React, the DOM and Vite globals so the
 * same functions can run in the browser and in the server-side injector that
 * rewrites index.html for crawlers. WhatsApp, Facebook and LinkedIn do not
 * execute JavaScript, so whatever they see has to be in the served HTML.
 */

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute URL of the page. */
  canonical: string;
  /** Absolute URL of the preview image. */
  image?: string;
  imageAlt?: string;
  ogType: 'website' | 'article' | 'product';
  /** Extra Open Graph pairs, e.g. product price. */
  extra?: Record<string, string>;
  /** JSON-LD, serialised into a script tag. */
  structuredData?: Record<string, unknown>;
  /** Listings that are sold or withdrawn should not be indexed. */
  noIndex?: boolean;
}

export const SITE_NAME = 'Motora';
export const DEFAULT_DESCRIPTION =
  'Motora is the modern way to find cars in Gaborone. Browse used vehicles from verified garages and dealers across Botswana, compare listings and contact the seller directly.';

/** Preview images render best at 1.91:1; this is the size crawlers expect. */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

function absolute(origin: string, path: string): string {
  return `${origin.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Keeps a description within the length a preview card will actually show. */
function trim(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,.;:—-]+$/, '')}…`;
}

/**
 * Re-crops an image to preview proportions.
 *
 * Listing photos are stored at gallery sizes and aspect ratios; a crawler
 * given one of those either letterboxes it or refuses it for being too large.
 * Unsplash accepts crop parameters, so the variant is derived rather than
 * stored. Anything else is passed through untouched.
 */
export function previewImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  if (url.includes('images.unsplash.com')) {
    const [base, query = ''] = url.split('?');
    const params = new URLSearchParams(query);
    params.set('auto', 'format');
    params.set('fit', 'crop');
    params.set('w', String(OG_IMAGE_WIDTH));
    params.set('h', String(OG_IMAGE_HEIGHT));
    params.set('q', '75');
    return `${base}?${params.toString()}`;
  }

  return url;
}

/** The site-wide default, used for pages with nothing more specific to say. */
export function buildDefaultMeta(origin: string, pathname = '/'): PageMeta {
  return {
    title: `${SITE_NAME} — Find your next car in Gaborone`,
    description: DEFAULT_DESCRIPTION,
    canonical: absolute(origin, pathname),
    image: absolute(origin, '/motora-icon.png'),
    imageAlt: 'Motora',
    ogType: 'website',
  };
}

/**
 * A vehicle listing.
 *
 * The description leads with the facts a buyer scans for — price, mileage,
 * transmission, fuel, area — because a preview card in a WhatsApp group is
 * often the only thing a recipient reads before deciding to tap.
 */
export function buildVehicleMeta(vehicle: VehicleWithGarage, origin: string): PageMeta {
  const title = vehicleTitle(vehicle);
  const price = formatPrice(vehicle.price);

  const facts = [
    formatMileage(vehicle.mileage),
    vehicle.transmission,
    vehicle.fuelType,
  ].join(' · ');

  const sold = vehicle.status === 'sold';
  const statusPrefix = sold ? 'Sold — ' : vehicle.status === 'reserved' ? 'Reserved — ' : '';

  return {
    title: `${statusPrefix}${title} — ${price} | ${SITE_NAME}`,
    description: trim(
      `${facts}. For sale at ${vehicle.garage.name} in ${vehicle.location.area}, ${vehicle.location.city}. ${vehicle.condition} condition${vehicle.serviceHistory ? ', full service history' : ''}.`,
    ),
    canonical: absolute(origin, `/vehicles/${vehicle.slug}`),
    image: previewImageUrl(vehicle.images[0]?.url),
    imageAlt: vehicle.images[0]?.alt ?? title,
    ogType: 'product',
    extra: {
      'product:price:amount': String(vehicle.price),
      'product:price:currency': 'BWP',
      'product:availability': vehicle.status === 'available' ? 'in stock' : 'out of stock',
    },
    noIndex: sold,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Car',
      name: title,
      brand: { '@type': 'Brand', name: vehicle.make },
      model: vehicle.model,
      vehicleModelDate: String(vehicle.year),
      productionDate: String(vehicle.year),
      color: vehicle.exteriorColour,
      bodyType: vehicle.bodyType,
      fuelType: vehicle.fuelType,
      vehicleTransmission: vehicle.transmission,
      numberOfDoors: vehicle.doors,
      seatingCapacity: vehicle.seats,
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        value: vehicle.mileage,
        unitCode: 'KMT',
      },
      image: vehicle.images.map((image) => image.url),
      description: vehicle.description,
      offers: {
        '@type': 'Offer',
        price: vehicle.price,
        priceCurrency: 'BWP',
        availability:
          vehicle.status === 'available'
            ? 'https://schema.org/InStock'
            : vehicle.status === 'reserved'
              ? 'https://schema.org/PreOrder'
              : 'https://schema.org/SoldOut',
        url: absolute(origin, `/vehicles/${vehicle.slug}`),
        seller: {
          '@type': 'AutoDealer',
          name: vehicle.garage.name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: vehicle.garage.location.addressLine,
            addressLocality: vehicle.garage.location.area,
            addressRegion: vehicle.garage.location.city,
            addressCountry: 'BW',
          },
        },
      },
    },
  };
}

/** A garage profile. */
export function buildGarageMeta(garage: Garage, origin: string): PageMeta {
  return {
    title: `${garage.name} — ${pluralise(garage.listingCount, 'car')} for sale in ${garage.location.area} | ${SITE_NAME}`,
    description: trim(garage.description),
    canonical: absolute(origin, `/garages/${garage.slug}`),
    image: previewImageUrl(garage.coverImageUrl),
    imageAlt: `${garage.name} forecourt`,
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      name: garage.name,
      description: garage.description,
      image: garage.coverImageUrl,
      telephone: garage.contact.phone,
      email: garage.contact.email,
      url: absolute(origin, `/garages/${garage.slug}`),
      address: {
        '@type': 'PostalAddress',
        streetAddress: garage.location.addressLine,
        addressLocality: garage.location.area,
        addressRegion: garage.location.city,
        addressCountry: 'BW',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: garage.rating,
        reviewCount: garage.reviewCount,
      },
    },
  };
}

/**
 * The browse page.
 *
 * Filtered searches get a title describing what is being shown, so a shared
 * "Toyota bakkies under P300,000" link reads as that rather than as a generic
 * listings page.
 */
export function buildBrowseMeta(
  query: VehicleQuery,
  origin: string,
  search: string,
  total?: number,
): PageMeta {
  const makes = query.make?.join(' & ');
  const bodies = query.bodyType?.join(' & ');

  const subject = [makes, bodies ? `${bodies}s`.replace(/ss$/, 's') : undefined]
    .filter(Boolean)
    .join(' ');

  const budget =
    query.maxPrice != null ? ` under ${formatPrice(query.maxPrice)}` : '';

  const headline = subject
    ? `${subject} for sale in Gaborone${budget}`
    : `Cars for sale in Gaborone${budget}`;

  return {
    title: `${headline} | ${SITE_NAME}`,
    description: trim(
      total != null
        ? `${pluralise(total, 'car')} matching this search, listed by garages and dealers across Gaborone. Compare listings and contact the seller directly on Motora.`
        : DEFAULT_DESCRIPTION,
    ),
    canonical: absolute(origin, `/vehicles${search ? `?${search}` : ''}`),
    image: absolute(origin, '/motora-icon.png'),
    imageAlt: SITE_NAME,
    ogType: 'website',
    // Filter permutations are near-infinite; only the bare listing page is
    // worth having in an index.
    noIndex: Boolean(search),
  };
}

/** A simple page with a fixed title and blurb. */
export function buildStaticMeta(
  origin: string,
  pathname: string,
  title: string,
  description: string,
  noIndex = false,
): PageMeta {
  return {
    title: `${title} | ${SITE_NAME}`,
    description: trim(description),
    canonical: absolute(origin, pathname),
    image: absolute(origin, '/motora-icon.png'),
    imageAlt: SITE_NAME,
    ogType: 'website',
    noIndex,
  };
}

/**
 * Flattens a PageMeta into the tags a crawler reads.
 *
 * Shared by the client (which applies them to the live document) and the
 * server injector (which writes them into the HTML shell), so the two can
 * never drift apart.
 */
export function metaTags(meta: PageMeta): { name?: string; property?: string; content: string }[] {
  const tags: { name?: string; property?: string; content: string }[] = [
    { name: 'description', content: meta.description },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.description },
    { property: 'og:type', content: meta.ogType },
    { property: 'og:url', content: meta.canonical },
    { property: 'og:locale', content: 'en_BW' },
    { name: 'twitter:card', content: meta.image ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: meta.title },
    { name: 'twitter:description', content: meta.description },
  ];

  if (meta.image) {
    tags.push(
      { property: 'og:image', content: meta.image },
      { property: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
      { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
      { property: 'og:image:alt', content: meta.imageAlt ?? meta.title },
      { name: 'twitter:image', content: meta.image },
    );
  }

  for (const [property, content] of Object.entries(meta.extra ?? {})) {
    tags.push({ property, content });
  }

  if (meta.noIndex) tags.push({ name: 'robots', content: 'noindex, follow' });

  return tags;
}
