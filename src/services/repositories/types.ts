import type {
  AnalyticsEvent,
  Enquiry,
  EnquiryPayload,
  Garage,
  Paginated,
  Review,
  ReviewQuery,
  ReviewSummary,
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

export interface ReviewRepository {
  /** Reviews for one garage, sorted and paged. */
  list(query: ReviewQuery, signal?: AbortSignal): Promise<Paginated<Review>>;
  /** The rating distribution, computed over every review for the garage. */
  summary(garageId: string, signal?: AbortSignal): Promise<ReviewSummary>;
}

export interface AnalyticsRepository {
  /**
   * Records a batch of events. Fire-and-forget by contract: callers must not
   * await it to decide what to render, and a rejection must never surface to
   * the customer. Counting taps is not worth breaking a page over.
   */
  track(events: AnalyticsEvent[], signal?: AbortSignal): Promise<void>;
}

export interface EnquiryRepository {
  create(payload: EnquiryPayload, signal?: AbortSignal): Promise<Enquiry>;
}

export interface DataSource {
  vehicles: VehicleRepository;
  garages: GarageRepository;
  reviews: ReviewRepository;
  enquiries: EnquiryRepository;
  analytics: AnalyticsRepository;
}

/** Convenience alias used by the mock layer. */
export type VehicleRecord = Vehicle;
