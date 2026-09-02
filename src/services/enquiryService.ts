import type { Enquiry, EnquiryDraft, EnquiryPayload, VehicleWithGarage } from '../types';
import { vehicleTitle } from '../utils/format';
import { dataSource } from './dataSource';

export function submitEnquiry(payload: EnquiryPayload, signal?: AbortSignal): Promise<Enquiry> {
  return dataSource.enquiries.create(payload, signal);
}

/**
 * Attaches the listing context to a customer's draft so the garage receives the
 * enquiry with the vehicle already identified.
 */
export function buildEnquiryPayload(
  draft: EnquiryDraft,
  vehicle: VehicleWithGarage,
): EnquiryPayload {
  return {
    ...draft,
    vehicleId: vehicle.id,
    garageId: vehicle.garageId,
    vehicleSnapshot: {
      title: vehicleTitle(vehicle),
      price: vehicle.price,
      year: vehicle.year,
      slug: vehicle.slug,
    },
  };
}
