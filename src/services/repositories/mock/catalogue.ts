import { GARAGES } from '../../../data/garages';
import { VEHICLES } from '../../../data/vehicles';
import type { Garage, VehicleWithGarage } from '../../../types';
import { withGarages } from '../../../utils/vehicleQuery';

/**
 * The in-memory catalogue, assembled once and shared by every mock repository.
 *
 * Building it in one place keeps derived data consistent: a garage's
 * `listingCount` is the same number whether it is read through the garage
 * repository or reached via a vehicle's `garage` relation.
 */

/** The backend will maintain this on write; here it is derived from the listings. */
const LISTING_COUNTS = VEHICLES.reduce<Record<string, number>>((counts, vehicle) => {
  if (vehicle.status !== 'sold') {
    counts[vehicle.garageId] = (counts[vehicle.garageId] ?? 0) + 1;
  }
  return counts;
}, {});

export const GARAGE_CATALOGUE: Garage[] = GARAGES.map((garage) => ({
  ...garage,
  listingCount: LISTING_COUNTS[garage.id] ?? 0,
}));

export const VEHICLE_CATALOGUE: VehicleWithGarage[] = withGarages(VEHICLES, GARAGE_CATALOGUE);
