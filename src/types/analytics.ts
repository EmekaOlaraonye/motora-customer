/**
 * Product analytics.
 *
 * These events exist for one commercial reason: a garage will eventually be
 * asked to pay, and the first thing they will ask is what they got for it.
 * "47 buyers tapped your number last month" is only answerable if the taps
 * were counted at the time.
 *
 * Scope is deliberately narrow. Events are first-party, carry no personal
 * details, and identify a browsing session rather than a person. Anything
 * that identifies a customer belongs on an enquiry, which they chose to send.
 */

export type AnalyticsEventType =
  /** A vehicle listing page was opened. */
  | 'listing_view'
  /** A garage profile page was opened. */
  | 'garage_view'
  /** The call button was tapped. The call itself is not observable. */
  | 'contact_call'
  /** The WhatsApp button was tapped. */
  | 'contact_whatsapp'
  /** The email button was tapped. */
  | 'contact_email'
  /** An enquiry form was submitted successfully. */
  | 'enquiry_sent'
  /** A customer adjusted the finance calculator — a signal of buying intent. */
  | 'finance_estimated'
  /** A search was run with at least one filter applied. */
  | 'search_performed';

/** Values small enough to sit safely in a query or a column. */
export type AnalyticsValue = string | number | boolean;

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  /** ISO 8601, captured client-side at the moment of the action. */
  occurredAt: string;

  /**
   * Random per-session identifier. Lets repeat views inside one visit be
   * collapsed without identifying anyone across visits or sites.
   */
  sessionId: string;

  /** The garage this event should be credited to, where there is one. */
  garageId?: string;
  vehicleId?: string;

  /** Page the event happened on, path only — never the query string. */
  path?: string;

  metadata?: Record<string, AnalyticsValue>;
}

/** What the client sends; the id and timestamp are filled in by the service. */
export type AnalyticsEventInput = Omit<AnalyticsEvent, 'id' | 'occurredAt' | 'sessionId'>;

/**
 * Per-garage rollup. Not consumed by the customer app — this is the shape the
 * admin dashboard needs in order to show a garage what its money bought.
 */
export interface GarageMetrics {
  garageId: string;
  /** Inclusive ISO dates bounding the period. */
  from: string;
  to: string;

  listingViews: number;
  garageViews: number;
  callClicks: number;
  whatsappClicks: number;
  emailClicks: number;
  enquiries: number;

  /** Listing views broken down by vehicle, highest first. */
  topListings: { vehicleId: string; views: number }[];
}
