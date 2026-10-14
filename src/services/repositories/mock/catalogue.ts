import { GARAGES } from '../../../data/garages';
import { VEHICLES } from '../../../data/vehicles';
import type { Garage, VehicleWithGarage } from '../../../types';
import { withGarages } from '../../../utils/vehicleQuery';
import { summariseGarageReviews } from './mockReviewRepository';

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

/**
 * `rating` and `reviewCount` are derived from the reviews that actually exist
 * rather than carried on the fixture. A star rating with no reviewable
 * substance behind it is the kind of trust signal that quietly erodes trust.
 */
export const GARAGE_CATALOGUE: Garage[] = GARAGES.map((garage) => {
  const reviews = summariseGarageReviews(garage.id);

  return {
    ...garage,
    listingCount: LISTING_COUNTS[garage.id] ?? 0,
    rating: reviews.total > 0 ? Number(reviews.average.toFixed(1)) : 0,
    reviewCount: reviews.total,
  };
});

export const VEHICLE_CATALOGUE: VehicleWithGarage[] = withGarages(VEHICLES, GARAGE_CATALOGUE);
