import type { VehicleQuery } from '../types';
import { formatMileage, formatPrice } from './format';

/**
 * Renders a query back as a phrase a person would recognise.
 *
 * Used for search-alert descriptions and for page titles. Someone agreeing to
 * be emailed needs to see exactly what they signed up for, in their own
 * words — "Toyota bakkies under P300,000 in Tlokweng", not a filter dump.
 *
 * Free of React and the DOM so the server-side metadata build can use it too.
 */

function list(values: string[] | undefined, joiner = 'or'): string | undefined {
  if (!values || values.length === 0) return undefined;
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} ${joiner} ${values[1]}`;
  return `${values.slice(0, -1).join(', ')} ${joiner} ${values[values.length - 1]}`;
}

/**
 * "Bakkie" -> "bakkies", "SUV" -> "SUVs".
 *
 * Acronyms keep their capitals: lowercasing them produces "suvs", which reads
 * as a typo rather than as a category.
 */
function pluraliseBody(bodyType: string): string {
  const isAcronym = bodyType === bodyType.toUpperCase();
  const base = isAcronym ? bodyType : bodyType.toLowerCase();
  return /s$/i.test(base) ? base : `${base}s`;
}

/**
 * The noun phrase: what kind of car. Returns "cars" when nothing narrows it.
 */
export function describeSubject(query: VehicleQuery): string {
  const parts: string[] = [];

  const transmission = list(query.transmission);
  if (transmission) parts.push(transmission.toLowerCase());

  const fuel = list(query.fuelType);
  if (fuel) parts.push(fuel.toLowerCase());

  const make = list(query.make);
  if (make) parts.push(make);

  const model = list(query.model);
  if (model) parts.push(model);

  const bodies = query.bodyType?.map(pluraliseBody);
  const body = list(bodies);

  if (body) {
    // Already cased correctly by pluraliseBody.
    parts.push(body);
  } else if (!make && !model) {
    parts.push('cars');
  } else {
    // "Toyota Hilux" reads better than "Toyota Hilux cars".
    parts.push('');
  }

  return parts.filter(Boolean).join(' ');
}

/** The qualifying clauses: price, year, mileage, area, condition. */
export function describeConstraints(query: VehicleQuery): string[] {
  const clauses: string[] = [];

  if (query.minPrice != null && query.maxPrice != null) {
    clauses.push(`between ${formatPrice(query.minPrice)} and ${formatPrice(query.maxPrice)}`);
  } else if (query.maxPrice != null) {
    clauses.push(`under ${formatPrice(query.maxPrice)}`);
  } else if (query.minPrice != null) {
    clauses.push(`over ${formatPrice(query.minPrice)}`);
  }

  if (query.minYear != null && query.maxYear != null) {
    clauses.push(`from ${query.minYear} to ${query.maxYear}`);
  } else if (query.minYear != null) {
    clauses.push(`${query.minYear} or newer`);
  } else if (query.maxYear != null) {
    clauses.push(`${query.maxYear} or older`);
  }

  // "with under" rather than "under", so it cannot be misread as a second
  // price bound when a price range is also present.
  if (query.maxMileage != null) clauses.push(`with under ${formatMileage(query.maxMileage)}`);

  const area = list(query.area);
  if (area) clauses.push(`in ${area}`);

  const condition = list(query.condition);
  if (condition) clauses.push(`in ${condition.toLowerCase()} condition`);

  if (query.verifiedOnly) clauses.push('from verified garages');

  return clauses;
}

/**
 * The whole query as one sentence fragment, e.g.
 * "Toyota bakkies under P300,000 in Tlokweng".
 */
export function describeQuery(query: VehicleQuery): string {
  const keyword = query.q?.trim();
  const subject = describeSubject(query);
  const constraints = describeConstraints(query);

  const head = keyword ? `"${keyword}"` : subject;
  const described = [head, ...constraints].filter(Boolean).join(' ');

  return described || 'All cars';
}

/** Capitalised for use as a title or heading. */
export function describeQueryTitle(query: VehicleQuery): string {
  const described = describeQuery(query);
  return described.charAt(0).toUpperCase() + described.slice(1);
}
