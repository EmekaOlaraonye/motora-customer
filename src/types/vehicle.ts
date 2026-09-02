/**
 * Vehicle domain model.
 *
 * This mirrors the shape the backend API is expected to return. Mock data and
 * the eventual Firebase-backed API both resolve to these types, so UI
 * components never need to know where the data came from.
 */

export type Transmission = 'Automatic' | 'Manual';

export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';

export type BodyType =
  | 'Hatchback'
  | 'Sedan'
  | 'SUV'
  | 'Crossover'
  | 'Bakkie'
  | 'Double Cab'
  | 'MPV'
  | 'Coupe'
  | 'Van';

export type Drivetrain = 'FWD' | 'RWD' | 'AWD' | '4x4';

export type VehicleCondition = 'New' | 'Excellent' | 'Good' | 'Fair';

/** Lifecycle of the listing itself, not of the car. */
export type ListingStatus = 'available' | 'reserved' | 'sold';

export interface VehicleImage {
  id: string;
  /** Full-size image URL. Firebase Storage download URL in production. */
  url: string;
  /** Descriptive alt text — required for accessibility. */
  alt: string;
}

export interface VehicleLocation {
  /** Suburb or area, e.g. "Broadhurst". */
  area: string;
  city: string;
}

export interface Vehicle {
  id: string;
  /** URL-safe identifier used for pretty vehicle routes. */
  slug: string;

  make: string;
  model: string;
  /** Trim or variant, e.g. "2.8 GD-6 Raider". */
  variant?: string;
  year: number;

  /** Asking price in Botswana Pula (BWP), stored as a whole number. */
  price: number;
  negotiable: boolean;

  /** Odometer reading in kilometres. */
  mileage: number;

  transmission: Transmission;
  fuelType: FuelType;
  bodyType: BodyType;
  drivetrain: Drivetrain;
  /** Engine displacement in litres. */
  engineSize: number;
  /** Peak power in kilowatts. */
  enginePower?: number;

  exteriorColour: string;
  interiorColour?: string;
  doors: number;
  seats: number;

  condition: VehicleCondition;
  status: ListingStatus;

  description: string;
  features: string[];

  images: VehicleImage[];

  /** Foreign key to the garage that owns this listing. */
  garageId: string;
  location: VehicleLocation;

  /** ISO 8601 timestamps. */
  listedAt: string;
  updatedAt: string;

  views: number;
  featured: boolean;

  serviceHistory: boolean;
  accidentFree: boolean;
  /** Present for imported vehicles; often withheld on public listings. */
  vin?: string;
}

/**
 * A vehicle joined with its garage. Returned by services that resolve the
 * relationship on behalf of the UI so components never fetch twice.
 */
export interface VehicleWithGarage extends Vehicle {
  garage: import('./garage').Garage;
}
