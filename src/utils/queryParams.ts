import { SORT_OPTIONS, type SortOption, type VehicleQuery } from '../types';

/**
 * Two-way mapping between a `VehicleQuery` and the URL search string.
 *
 * Keeping search state in the URL means results are shareable, the back button
 * behaves, and a page refresh preserves what the customer was looking at.
 */

/** Multi-value filters are stored comma-separated: `?make=Toyota,Ford`. */
const LIST_KEYS = [
  'make',
  'model',
  'bodyType',
  'fuelType',
  'transmission',
  'condition',
  'area',
] as const;

const NUMBER_KEYS = [
  'minPrice',
  'maxPrice',
  'minYear',
  'maxYear',
  'minMileage',
  'maxMileage',
  'page',
  'pageSize',
] as const;

type ListKey = (typeof LIST_KEYS)[number];
type NumberKey = (typeof NUMBER_KEYS)[number];

const VALID_SORTS = new Set<string>(SORT_OPTIONS.map((option) => option.value));

function parseList(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function parseNumber(value: string | null): number | undefined {
  if (value == null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function queryFromSearchParams(params: URLSearchParams): VehicleQuery {
  const query: VehicleQuery = {};

  const q = params.get('q')?.trim();
  if (q) query.q = q;

  for (const key of LIST_KEYS) {
    const value = parseList(params.get(key));
    if (value) query[key as ListKey] = value;
  }

  for (const key of NUMBER_KEYS) {
    const value = parseNumber(params.get(key));
    if (value != null) query[key as NumberKey] = value;
  }

  const garageId = params.get('garageId');
  if (garageId) query.garageId = garageId;

  if (params.get('verified') === 'true') query.verifiedOnly = true;
  if (params.get('featured') === 'true') query.featuredOnly = true;

  const sort = params.get('sort');
  if (sort && VALID_SORTS.has(sort)) query.sort = sort as SortOption;

  return query;
}

/** Only non-default values are written, so tidy URLs stay tidy. */
export function searchParamsFromQuery(query: VehicleQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set('q', query.q.trim());

  for (const key of LIST_KEYS) {
    const value = query[key as ListKey];
    if (value && value.length > 0) params.set(key, value.join(','));
  }

  for (const key of NUMBER_KEYS) {
    const value = query[key as NumberKey];
    if (value != null && !(key === 'page' && value === 1)) params.set(key, String(value));
  }

  if (query.garageId) params.set('garageId', query.garageId);
  if (query.verifiedOnly) params.set('verified', 'true');
  if (query.featuredOnly) params.set('featured', 'true');
  if (query.sort && query.sort !== 'relevance') params.set('sort', query.sort);

  return params;
}

/** Builds an href for the browse page from a partial query. */
export function browseHref(query: VehicleQuery): string {
  const params = searchParamsFromQuery(query);
  const search = params.toString();
  return search ? `/vehicles?${search}` : '/vehicles';
}

/** Stable key for memoising and for React effect dependencies. */
export function queryKey(query: VehicleQuery): string {
  return searchParamsFromQuery(query).toString();
}
