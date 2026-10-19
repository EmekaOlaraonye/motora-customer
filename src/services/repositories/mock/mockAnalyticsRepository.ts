import type { AnalyticsEvent, GarageMetrics } from '../../../types';
import type { AnalyticsRepository } from '../types';

/**
 * In-memory event sink.
 *
 * Keeps events for the session so the rollup below can be exercised without a
 * backend, and logs them in development so wiring mistakes are obvious while
 * the instrumentation is being added. Nothing leaves the browser.
 */

const RECORDED: AnalyticsEvent[] = [];

/** Bounded so a long session cannot grow the array without limit. */
const MAX_RETAINED = 500;

const DEBUG = import.meta.env.DEV && import.meta.env.VITE_DEBUG_ANALYTICS === 'true';

export const mockAnalyticsRepository: AnalyticsRepository = {
  async track(events: AnalyticsEvent[]): Promise<void> {
    RECORDED.push(...events);
    if (RECORDED.length > MAX_RETAINED) RECORDED.splice(0, RECORDED.length - MAX_RETAINED);

    if (DEBUG) {
      for (const event of events) {
        console.debug(
          `[motora:analytics] ${event.type}`,
          { garageId: event.garageId, vehicleId: event.vehicleId, ...event.metadata },
        );
      }
    }
  },
};

/** Everything recorded this session, newest last. Exposed for debugging. */
export function recordedEvents(): AnalyticsEvent[] {
  return [...RECORDED];
}

/**
 * The rollup the admin dashboard will need, computed over this session's
 * events. The real implementation aggregates server-side over a date range;
 * this exists so the shape can be designed against something real.
 */
export function rollUpGarageMetrics(garageId: string): GarageMetrics {
  const forGarage = RECORDED.filter((event) => event.garageId === garageId);

  const count = (type: AnalyticsEvent['type']) =>
    forGarage.filter((event) => event.type === type).length;

  const viewsByVehicle = new Map<string, number>();
  for (const event of forGarage) {
    if (event.type !== 'listing_view' || !event.vehicleId) continue;
    viewsByVehicle.set(event.vehicleId, (viewsByVehicle.get(event.vehicleId) ?? 0) + 1);
  }

  const times = forGarage.map((event) => Date.parse(event.occurredAt)).filter(Number.isFinite);

  return {
    garageId,
    from: new Date(times.length > 0 ? Math.min(...times) : Date.now()).toISOString(),
    to: new Date(times.length > 0 ? Math.max(...times) : Date.now()).toISOString(),
    listingViews: count('listing_view'),
    garageViews: count('garage_view'),
    callClicks: count('contact_call'),
    whatsappClicks: count('contact_whatsapp'),
    emailClicks: count('contact_email'),
    enquiries: count('enquiry_sent'),
    topListings: [...viewsByVehicle.entries()]
      .map(([vehicleId, views]) => ({ vehicleId, views }))
      .sort((a, b) => b.views - a.views),
  };
}

/**
 * Development handle.
 *
 * Exposes the session's events and the per-garage rollup on `window` so the
 * instrumentation can be checked while it is being added, and so whoever
 * builds the garage dashboard has a real `GarageMetrics` object to design
 * against. Only present when analytics debugging is explicitly turned on.
 */
if (DEBUG && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__motoraAnalytics = {
    events: recordedEvents,
    metrics: rollUpGarageMetrics,
  };
}
