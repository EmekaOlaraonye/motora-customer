/** Garage / dealer domain model. */

export interface GarageLocation {
  area: string;
  city: string;
  addressLine: string;
  coordinates?: { lat: number; lng: number };
}

export interface GarageContact {
  phone: string;
  /** Digits only, international format, for wa.me links. */
  whatsapp?: string;
  email: string;
  website?: string;
}

export interface OpeningHours {
  day: string;
  /** Display string, or "Closed". */
  hours: string;
}

export interface Garage {
  id: string;
  slug: string;
  name: string;

  /** Square logo. Falls back to an initial monogram when absent. */
  logoUrl?: string;
  coverImageUrl: string;

  description: string;

  /** Set by platform admins once documents have been checked. */
  verified: boolean;

  rating: number;
  reviewCount: number;

  location: GarageLocation;
  contact: GarageContact;
  openingHours: OpeningHours[];

  establishedYear?: number;
  /** e.g. ["Japanese imports", "4x4 specialists"]. */
  specialties: string[];

  /** Denormalised count maintained by the backend for listing cards. */
  listingCount: number;
}
