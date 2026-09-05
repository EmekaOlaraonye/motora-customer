import { getGarageBySlug, getVehicleBySlug } from '../services';
import { queryFromSearchParams } from '../utils/queryParams';
import {
  buildBrowseMeta,
  buildDefaultMeta,
  buildGarageMeta,
  buildStaticMeta,
  buildVehicleMeta,
  metaTags,
  type PageMeta,
} from '../utils/meta';

/**
 * Server entry for link previews.
 *
 * Built separately (`npm run build:meta`) and consumed by
 * `server/meta-injector.mjs`. It reuses the same services and the same meta
 * builders as the browser, so a preview card can never describe a listing
 * differently from the page itself.
 */

export { metaTags };
export type { PageMeta };

const STATIC_PAGES: Record<string, { title: string; description: string; noIndex?: boolean }> = {
  '/garages': {
    title: 'Garages and dealers in Gaborone',
    description:
      'Every car on Motora is sold by one of these garages. Browse a dealer to see its full floor, opening hours and contact details.',
  },
  '/about': {
    title: 'How Motora works',
    description:
      'Motora is a marketplace, not a dealership. We bring the stock of garages across Gaborone into one place so you can find the right car without driving from yard to yard.',
  },
  '/saved': {
    title: 'Your saved cars',
    description: 'The cars you have shortlisted on Motora, kept on this device.',
    noIndex: true,
  },
  '/compare': {
    title: 'Compare cars side by side',
    description:
      'Put up to four cars next to each other and see exactly where they differ on price, mileage, condition and seller.',
    noIndex: true,
  },
};

/**
 * Resolves the metadata for a URL. Never throws: a preview that cannot be
 * built falls back to the site default rather than failing the request.
 */
export async function resolveMeta(url: string, origin: string): Promise<PageMeta> {
  let pathname = url;
  let search = '';

  const queryIndex = url.indexOf('?');
  if (queryIndex >= 0) {
    pathname = url.slice(0, queryIndex);
    search = url.slice(queryIndex + 1);
  }

  // Trailing slashes are equivalent, except at the root.
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '');

  try {
    const vehicleMatch = /^\/vehicles\/([^/]+)$/.exec(pathname);
    if (vehicleMatch) {
      const vehicle = await getVehicleBySlug(decodeURIComponent(vehicleMatch[1]));
      return buildVehicleMeta(vehicle, origin);
    }

    const garageMatch = /^\/garages\/([^/]+)$/.exec(pathname);
    if (garageMatch) {
      const garage = await getGarageBySlug(decodeURIComponent(garageMatch[1]));
      return buildGarageMeta(garage, origin);
    }

    if (pathname === '/vehicles') {
      const query = queryFromSearchParams(new URLSearchParams(search));
      return buildBrowseMeta(query, origin, search);
    }

    const staticPage = STATIC_PAGES[pathname];
    if (staticPage) {
      return buildStaticMeta(
        origin,
        pathname,
        staticPage.title,
        staticPage.description,
        staticPage.noIndex,
      );
    }

    if (pathname === '/') return buildDefaultMeta(origin, '/');

    // Unknown route: the SPA will render its 404.
    return buildStaticMeta(
      origin,
      pathname,
      'Page not found',
      'The page you were looking for is not here. Everything currently for sale is still one click away.',
      true,
    );
  } catch {
    // A missing listing or an unreachable data source must not break the page.
    return buildDefaultMeta(origin, pathname);
  }
}
