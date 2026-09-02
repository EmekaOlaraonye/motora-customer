/**
 * Query, sorting and pagination contracts.
 *
 * `VehicleQuery` is deliberately serialisable — every field maps cleanly onto
 * URL search params and onto a future REST query string or Firestore query,
 * so the same object travels from the UI to the data layer unchanged.
 */

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'newest', label: 'Newest listings' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'mileage-asc', label: 'Mileage: lowest first' },
  { value: 'year-desc', label: 'Year: newest first' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export interface VehicleQuery {
  /** Free-text search across make, model, variant and garage name. */
  q?: string;

  make?: string[];
  model?: string[];
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  condition?: string[];
  /** Gaborone areas. */
  area?: string[];

  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;

  garageId?: string;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;

  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Counts used to label filter options and show how much a filter would narrow. */
export interface VehicleFacets {
  makes: FacetBucket[];
  bodyTypes: FacetBucket[];
  fuelTypes: FacetBucket[];
  transmissions: FacetBucket[];
  areas: FacetBucket[];
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
  mileageRange: { min: number; max: number };
}

export interface FacetBucket {
  value: string;
  count: number;
}

export interface VehicleSearchResult extends Paginated<import('./vehicle').VehicleWithGarage> {
  facets: VehicleFacets;
}
