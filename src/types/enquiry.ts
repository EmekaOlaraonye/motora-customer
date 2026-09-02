/** Customer enquiry sent to a garage about a specific listing. */

export type PreferredContactMethod = 'phone' | 'whatsapp' | 'email';

export interface EnquiryDraft {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContact: PreferredContactMethod;
}

/** What the client sends to the API. */
export interface EnquiryPayload extends EnquiryDraft {
  vehicleId: string;
  garageId: string;
  /** Snapshot of the listing at enquiry time so the record stays meaningful
   *  even if the listing is later edited or removed. */
  vehicleSnapshot: {
    title: string;
    price: number;
    year: number;
    slug: string;
  };
}

/** What the API returns once the enquiry is stored. */
export interface Enquiry extends EnquiryPayload {
  id: string;
  createdAt: string;
  status: 'received' | 'read' | 'responded';
}

export type EnquiryFieldErrors = Partial<Record<keyof EnquiryDraft, string>>;
