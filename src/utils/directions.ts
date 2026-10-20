import type { GarageLocation } from '../types';

/**
 * Links out to the customer's own maps app for turn-by-turn directions.
 *
 * Deliberately not an embedded map. What someone viewing a listing wants is
 * to drive to the yard, and handing off to the maps app already on their
 * phone does that better than a widget could — with no tile provider, no API
 * key and no per-load bill.
 *
 * Google's universal Maps URL is used because it resolves everywhere that
 * matters: it opens the Google Maps app on Android, the app or Safari on iOS,
 * and the web on desktop. A `geo:` URI would be neater on Android and broken
 * everywhere else.
 */

const MAPS_BASE = 'https://www.google.com/maps/dir/';

export function directionsHref(location: GarageLocation, name?: string): string {
  const params = new URLSearchParams({ api: '1' });

  if (location.coordinates) {
    // Coordinates drop the pin exactly on the yard. An address string is
    // prettier in the maps app but gets geocoded, and plot numbers around
    // Gaborone are not reliably resolvable.
    params.set('destination', `${location.coordinates.lat},${location.coordinates.lng}`);
  } else {
    params.set(
      'destination',
      [name, location.addressLine, location.area, location.city, 'Botswana']
        .filter(Boolean)
        .join(', '),
    );
  }

  return `${MAPS_BASE}?${params.toString()}`;
}

/** "Plot 2841, Lobatse Road, Kgale · Kgale, Gaborone" as two display lines. */
export function formatAddressLines(location: GarageLocation): [string, string] {
  return [location.addressLine, `${location.area}, ${location.city}`];
}
