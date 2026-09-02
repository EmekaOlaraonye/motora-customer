import type {
  Enquiry,
  EnquiryPayload,
  Garage,
  Vehicle,
  VehicleQuery,
  VehicleSearchResult,
  VehicleWithGarage,
} from '../../types';

/**
 * Repository contracts.
 *
 * The mock repositories below implement these today. A Firebase or REST
 * implementation slots in by satisfying the same interfaces — no page or
 * component needs to change.
 */

export interface VehicleRepository {
  search(query: VehicleQuery, signal?: AbortSignal): Promise<VehicleSearchResult>;
  getBySlug(slug: string, signal?: AbortSignal): Promise<VehicleWithGarage>;
  getById(id: string, signal?: AbortSignal): Promise<VehicleWithGarage>;
  getFeatured(limit: number, signal?: AbortSignal): Promise<VehicleWithGarage[]>;
  /** Other listings from the same garage, excluding the vehicle being viewed. */
  getRelated(vehicleId: string, limit: number, signal?: AbortSignal): Promise<VehicleWithGarage[]>;
  getByIds(ids: string[], signal?: AbortSignal): Promise<VehicleWithGarage[]>;
}

export interface GarageRepository {
  list(signal?: AbortSignal): Promise<Garage[]>;
  getBySlug(slug: string, signal?: AbortSignal): Promise<Garage>;
  getById(id: string, signal?: AbortSignal): Promise<Garage>;
}

export interface EnquiryRepository {
  create(payload: EnquiryPayload, signal?: AbortSignal): Promise<Enquiry>;
}

export interface DataSource {
  vehicles: VehicleRepository;
  garages: GarageRepository;
  enquiries: EnquiryRepository;
}

/** Convenience alias used by the mock layer. */
export type VehicleRecord = Vehicle;
