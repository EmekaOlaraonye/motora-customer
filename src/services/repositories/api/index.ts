import type {
  AnalyticsEvent,
  Enquiry,
  EnquiryPayload,
  Garage,
  Paginated,
  Review,
  ReviewQuery,
  ReviewSummary,
  SearchAlert,
  SearchAlertPayload,
  VehicleQuery,
  VehicleSearchResult,
  VehicleWithGarage,
} from '../../../types';
import type {
  AnalyticsRepository,
  DataSource,
  EnquiryRepository,
  GarageRepository,
  ReviewRepository,
  SearchAlertRepository,
  VehicleRepository,
} from '../types';
import { get, post, queryString } from './httpClient';

/**
 * API-backed repositories.
 *
 * One method per interface member, each a single request. The API was built to
 * these interfaces, so there is no translation layer here — `VehicleQuery` is
 * already flat and serialisable, which is exactly why it maps onto a query
 * string unchanged.
 *
 * Every read forwards its `AbortSignal`. The browse page re-queries on each
 * keystroke, and an unbounded pile of in-flight requests is how a results grid
 * starts rendering the answer to a question the customer has moved on from.
 */

const apiVehicleRepository: VehicleRepository = {
  search(query: VehicleQuery, signal?: AbortSignal): Promise<VehicleSearchResult> {
    return get<VehicleSearchResult>(
      `/vehicles${queryString({
        q: query.q,
        make: query.make,
        model: query.model,
        bodyType: query.bodyType,
        fuelType: query.fuelType,
        transmission: query.transmission,
        condition: query.condition,
        area: query.area,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        minYear: query.minYear,
        maxYear: query.maxYear,
        minMileage: query.minMileage,
        maxMileage: query.maxMileage,
        garageId: query.garageId,
        verified: query.verifiedOnly,
        featured: query.featuredOnly,
        sort: query.sort,
        page: query.page,
        pageSize: query.pageSize,
      })}`,
      signal,
    );
  },

  getBySlug(slug: string, signal?: AbortSignal): Promise<VehicleWithGarage> {
    return get<VehicleWithGarage>(`/vehicles/${encodeURIComponent(slug)}`, signal);
  },

  // The API resolves a slug first and falls back to an id, so both reach the
  // same endpoint and a link built from either still works.
  getById(id: string, signal?: AbortSignal): Promise<VehicleWithGarage> {
    return get<VehicleWithGarage>(`/vehicles/${encodeURIComponent(id)}`, signal);
  },

  getFeatured(limit: number, signal?: AbortSignal): Promise<VehicleWithGarage[]> {
    return get<VehicleWithGarage[]>(`/vehicles/featured${queryString({ limit })}`, signal);
  },

  getRelated(vehicleId: string, limit: number, signal?: AbortSignal): Promise<VehicleWithGarage[]> {
    return get<VehicleWithGarage[]>(
      `/vehicles/${encodeURIComponent(vehicleId)}/related${queryString({ limit })}`,
      signal,
    );
  },

  getByIds(ids: string[], signal?: AbortSignal): Promise<VehicleWithGarage[]> {
    // An empty shortlist is an empty answer, not a request.
    if (ids.length === 0) return Promise.resolve([]);
    return get<VehicleWithGarage[]>(`/vehicles/by-ids${queryString({ ids })}`, signal);
  },
};

const apiGarageRepository: GarageRepository = {
  list(signal?: AbortSignal): Promise<Garage[]> {
    return get<Garage[]>('/garages', signal);
  },

  getBySlug(slug: string, signal?: AbortSignal): Promise<Garage> {
    return get<Garage>(`/garages/${encodeURIComponent(slug)}`, signal);
  },

  getById(id: string, signal?: AbortSignal): Promise<Garage> {
    return get<Garage>(`/garages/${encodeURIComponent(id)}`, signal);
  },
};

const apiReviewRepository: ReviewRepository = {
  list(query: ReviewQuery, signal?: AbortSignal): Promise<Paginated<Review>> {
    return get<Paginated<Review>>(
      `/garages/${encodeURIComponent(query.garageId)}/reviews${queryString({
        sort: query.sort,
        rating: query.rating,
        page: query.page,
        pageSize: query.pageSize,
      })}`,
      signal,
    );
  },

  summary(garageId: string, signal?: AbortSignal): Promise<ReviewSummary> {
    return get<ReviewSummary>(
      `/garages/${encodeURIComponent(garageId)}/reviews/summary`,
      signal,
    );
  },
};

const apiEnquiryRepository: EnquiryRepository = {
  create(payload: EnquiryPayload, signal?: AbortSignal): Promise<Enquiry> {
    return post<Enquiry>('/enquiries', payload, signal);
  },
};

const apiAlertRepository: SearchAlertRepository = {
  create(payload: SearchAlertPayload, signal?: AbortSignal): Promise<SearchAlert> {
    return post<SearchAlert>('/alerts', payload, signal);
  },
};

const apiAnalyticsRepository: AnalyticsRepository = {
  track(events: AnalyticsEvent[], signal?: AbortSignal): Promise<void> {
    return post<void>('/events', { events }, signal);
  },
};

export const apiDataSource: DataSource = {
  vehicles: apiVehicleRepository,
  garages: apiGarageRepository,
  reviews: apiReviewRepository,
  enquiries: apiEnquiryRepository,
  alerts: apiAlertRepository,
  analytics: apiAnalyticsRepository,
};

export { ValidationError } from './httpClient';
