import type { VehicleWithGarage } from '../types';
import {
  formatDate,
  formatEngine,
  formatMileage,
  formatNumber,
  formatPrice,
} from './format';

/**
 * Builds the comparison table.
 *
 * The point of comparing is to see where cars differ, so each row knows
 * whether its values are identical across the set, and which value wins when
 * the attribute has an objectively better direction (cheaper, fewer
 * kilometres, newer).
 */

export type RowGroup = 'Price' | 'Vehicle' | 'Engine & drive' | 'Condition' | 'Seller';

export interface CompareRow {
  label: string;
  group: RowGroup;
  /** Display value per vehicle, index-aligned with the compared list. */
  values: string[];
  /** True when every vehicle shares the same value. */
  identical: boolean;
  /**
   * Indices holding the best value, when the attribute has a better
   * direction. Empty when ranking would be meaningless (fuel type, colour).
   */
  bestIndices: number[];
}

/** Marks the indices holding the minimum or maximum of a numeric attribute. */
function rank(numbers: (number | undefined)[], direction: 'lower' | 'higher'): number[] {
  const valid = numbers.filter((n): n is number => typeof n === 'number');
  if (valid.length < 2) return [];

  const target = direction === 'lower' ? Math.min(...valid) : Math.max(...valid);

  // A tie across every vehicle is not a win worth marking.
  const winners = numbers.flatMap((n, i) => (n === target ? [i] : []));
  return winners.length === numbers.length ? [] : winners;
}

function row(
  label: string,
  group: RowGroup,
  values: string[],
  bestIndices: number[] = [],
): CompareRow {
  return {
    label,
    group,
    values,
    identical: values.every((value) => value === values[0]),
    bestIndices,
  };
}

export function buildCompareRows(vehicles: VehicleWithGarage[]): CompareRow[] {
  if (vehicles.length === 0) return [];

  const yesNo = (flag: boolean) => (flag ? 'Yes' : 'No');

  return [
    row(
      'Price',
      'Price',
      vehicles.map((v) => formatPrice(v.price)),
      rank(vehicles.map((v) => v.price), 'lower'),
    ),
    row(
      'Negotiable',
      'Price',
      vehicles.map((v) => yesNo(v.negotiable)),
      rank(vehicles.map((v) => (v.negotiable ? 1 : 0)), 'higher'),
    ),

    row(
      'Year',
      'Vehicle',
      vehicles.map((v) => String(v.year)),
      rank(vehicles.map((v) => v.year), 'higher'),
    ),
    row(
      'Mileage',
      'Vehicle',
      vehicles.map((v) => formatMileage(v.mileage)),
      rank(vehicles.map((v) => v.mileage), 'lower'),
    ),
    row('Body type', 'Vehicle', vehicles.map((v) => v.bodyType)),
    row('Doors', 'Vehicle', vehicles.map((v) => String(v.doors))),
    row(
      'Seats',
      'Vehicle',
      vehicles.map((v) => String(v.seats)),
      rank(vehicles.map((v) => v.seats), 'higher'),
    ),
    row('Colour', 'Vehicle', vehicles.map((v) => v.exteriorColour)),

    row('Transmission', 'Engine & drive', vehicles.map((v) => v.transmission)),
    row('Fuel', 'Engine & drive', vehicles.map((v) => v.fuelType)),
    row('Engine', 'Engine & drive', vehicles.map((v) => formatEngine(v.engineSize))),
    row(
      'Power',
      'Engine & drive',
      vehicles.map((v) => (v.enginePower ? `${v.enginePower} kW` : '—')),
      rank(vehicles.map((v) => v.enginePower), 'higher'),
    ),
    row('Drivetrain', 'Engine & drive', vehicles.map((v) => v.drivetrain)),

    row('Condition', 'Condition', vehicles.map((v) => v.condition)),
    row(
      'Service history',
      'Condition',
      vehicles.map((v) => yesNo(v.serviceHistory)),
      rank(vehicles.map((v) => (v.serviceHistory ? 1 : 0)), 'higher'),
    ),
    row(
      'Accident free',
      'Condition',
      vehicles.map((v) => yesNo(v.accidentFree)),
      rank(vehicles.map((v) => (v.accidentFree ? 1 : 0)), 'higher'),
    ),
    row('Availability', 'Condition', vehicles.map((v) => (
      v.status === 'available' ? 'Available' : v.status === 'reserved' ? 'Reserved' : 'Sold'
    ))),

    row('Garage', 'Seller', vehicles.map((v) => v.garage.name)),
    row(
      'Verified garage',
      'Seller',
      vehicles.map((v) => yesNo(v.garage.verified)),
      rank(vehicles.map((v) => (v.garage.verified ? 1 : 0)), 'higher'),
    ),
    row(
      'Garage rating',
      'Seller',
      vehicles.map((v) => v.garage.rating.toFixed(1)),
      rank(vehicles.map((v) => v.garage.rating), 'higher'),
    ),
    row('Area', 'Seller', vehicles.map((v) => v.location.area)),
    row('Listed', 'Seller', vehicles.map((v) => formatDate(v.listedAt))),
    row('Views', 'Seller', vehicles.map((v) => formatNumber(v.views))),
  ];
}

export const ROW_GROUPS: RowGroup[] = ['Price', 'Vehicle', 'Engine & drive', 'Condition', 'Seller'];

/** Count of rows whose values are not identical across the set. */
export function countDifferences(rows: CompareRow[]): number {
  return rows.filter((r) => !r.identical).length;
}
