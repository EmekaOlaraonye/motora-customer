import type {
  FacetBucket,
  Garage,
  SortOption,
  Vehicle,
  VehicleFacets,
  VehicleQuery,
  VehicleWithGarage,
} from '../types';

/**
 * Pure query engine.
 *
 * The mock repository runs this in the browser. When the real backend lands it
 * will run the equivalent logic server-side and this module stays useful for
 * client-side refinements and tests.
 */

export const DEFAULT_PAGE_SIZE = 12;

/** True when the query would narrow the result set in any way. */
export function hasActiveFilters(query: VehicleQuery): boolean {
  return countActiveFilters(query) > 0;
}

/** Number of filter *facets* in play — drives the badge on the mobile filter button. */
export function countActiveFilters(query: VehicleQuery): number {
  let count = 0;

  if (query.q?.trim()) count += 1;
  count += query.make?.length ? 1 : 0;
  count += query.model?.length ? 1 : 0;
  count += query.bodyType?.length ? 1 : 0;
  count += query.fuelType?.length ? 1 : 0;
  count += query.transmission?.length ? 1 : 0;
  count += query.condition?.length ? 1 : 0;
  count += query.area?.length ? 1 : 0;
  count += query.minPrice != null || query.maxPrice != null ? 1 : 0;
  count += query.minYear != null || query.maxYear != null ? 1 : 0;
  count += query.minMileage != null || query.maxMileage != null ? 1 : 0;
  count += query.verifiedOnly ? 1 : 0;

  return count;
}

function matchesAny(value: string, selected?: string[]): boolean {
  if (!selected || selected.length === 0) return true;
  return selected.includes(value);
}

function matchesText(vehicle: VehicleWithGarage, term?: string): boolean {
  const needle = term?.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    vehicle.make,
    vehicle.model,
    vehicle.variant,
    String(vehicle.year),
    vehicle.bodyType,
    vehicle.fuelType,
    vehicle.transmission,
    vehicle.exteriorColour,
    vehicle.location.area,
    vehicle.garage.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Every whitespace-separated token must appear somewhere, so "toyota 4x4"
  // narrows rather than widens.
  return needle.split(/\s+/).every((token) => haystack.includes(token));
}

export function matchesQuery(vehicle: VehicleWithGarage, query: VehicleQuery): boolean {
  if (!matchesText(vehicle, query.q)) return false;
  if (!matchesAny(vehicle.make, query.make)) return false;
  if (!matchesAny(vehicle.model, query.model)) return false;
  if (!matchesAny(vehicle.bodyType, query.bodyType)) return false;
  if (!matchesAny(vehicle.fuelType, query.fuelType)) return false;
  if (!matchesAny(vehicle.transmission, query.transmission)) return false;
  if (!matchesAny(vehicle.condition, query.condition)) return false;
  if (!matchesAny(vehicle.location.area, query.area)) return false;

  if (query.minPrice != null && vehicle.price < query.minPrice) return false;
  if (query.maxPrice != null && vehicle.price > query.maxPrice) return false;
  if (query.minYear != null && vehicle.year < query.minYear) return false;
  if (query.maxYear != null && vehicle.year > query.maxYear) return false;
  if (query.minMileage != null && vehicle.mileage < query.minMileage) return false;
  if (query.maxMileage != null && vehicle.mileage > query.maxMileage) return false;

  if (query.garageId && vehicle.garageId !== query.garageId) return false;
  if (query.verifiedOnly && !vehicle.garage.verified) return false;
  if (query.featuredOnly && !vehicle.featured) return false;

  return true;
}

/**
 * Relevance score. Sold and reserved listings sink, featured and fresh
 * listings rise, and a text search boosts exact make/model hits.
 */
function relevanceScore(vehicle: VehicleWithGarage, query: VehicleQuery): number {
  let score = 0;

  if (vehicle.status === 'sold') score -= 1000;
  if (vehicle.status === 'reserved') score -= 250;

  if (vehicle.featured) score += 120;
  if (vehicle.garage.verified) score += 40;
  if (vehicle.serviceHistory) score += 15;
  if (vehicle.accidentFree) score += 10;

  const ageDays = (Date.now() - new Date(vehicle.listedAt).getTime()) / 86_400_000;
  score += Math.max(0, 60 - ageDays);

  const needle = query.q?.trim().toLowerCase();
  if (needle) {
    if (vehicle.make.toLowerCase() === needle) score += 90;
    if (vehicle.model.toLowerCase() === needle) score += 90;
    if (`${vehicle.make} ${vehicle.model}`.toLowerCase().includes(needle)) score += 60;
  }

  score += Math.min(30, vehicle.views / 100);

  return score;
}

export function sortVehicles(
  vehicles: VehicleWithGarage[],
  sort: SortOption = 'relevance',
  query: VehicleQuery = {},
): VehicleWithGarage[] {
  const sorted = [...vehicles];

  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => Date.parse(b.listedAt) - Date.parse(a.listedAt));
      break;
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'mileage-asc':
      sorted.sort((a, b) => a.mileage - b.mileage);
      break;
    case 'year-desc':
      sorted.sort((a, b) => b.year - a.year);
      break;
    default:
      sorted.sort((a, b) => relevanceScore(b, query) - relevanceScore(a, query));
  }

  return sorted;
}

function bucketise(values: string[]): FacetBucket[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function range(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

/** Facets are computed over the *unfiltered* set so option counts stay stable. */
export function buildFacets(vehicles: VehicleWithGarage[]): VehicleFacets {
  return {
    makes: bucketise(vehicles.map((v) => v.make)),
    bodyTypes: bucketise(vehicles.map((v) => v.bodyType)),
    fuelTypes: bucketise(vehicles.map((v) => v.fuelType)),
    transmissions: bucketise(vehicles.map((v) => v.transmission)),
    areas: bucketise(vehicles.map((v) => v.location.area)),
    priceRange: range(vehicles.map((v) => v.price)),
    yearRange: range(vehicles.map((v) => v.year)),
    mileageRange: range(vehicles.map((v) => v.mileage)),
  };
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

/** Joins each vehicle to its garage so the UI receives one complete object. */
export function withGarages(vehicles: Vehicle[], garages: Garage[]): VehicleWithGarage[] {
  const byId = new Map(garages.map((garage) => [garage.id, garage]));

  return vehicles.flatMap((vehicle) => {
    const garage = byId.get(vehicle.garageId);
    // A listing without a garage is a data integrity problem; drop it rather
    // than render a card with a missing seller.
    return garage ? [{ ...vehicle, garage }] : [];
  });
}
