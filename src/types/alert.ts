import type { VehicleQuery } from './query';

/**
 * A saved search that notifies the customer when matching stock is listed.
 *
 * Stock in Gaborone turns over weekly, so a search that finds nothing today
 * is not a dead end — it is a customer who is in the market right now and
 * simply arrived between deliveries. This is how that is captured.
 */

export type AlertFrequency = 'instant' | 'daily';

export type AlertChannel = 'email' | 'whatsapp';

export interface SearchAlertDraft {
  /** Email is required: it is the one channel that works without a paid API. */
  email: string;
  /** Optional, and by far the more likely to be read here. */
  whatsapp?: string;
  channels: AlertChannel[];
  frequency: AlertFrequency;
}

export interface SearchAlertPayload extends SearchAlertDraft {
  /** The search being watched, in the same shape the browse page uses. */
  query: VehicleQuery;
  /**
   * The query written out in plain language, stored alongside it. The
   * notification has to tell someone what they signed up for, and recomputing
   * a description months later risks it drifting from what they agreed to.
   */
  description: string;
}

export interface SearchAlert extends SearchAlertPayload {
  id: string;
  createdAt: string;
  status: 'active' | 'paused' | 'unsubscribed';
  /** Server-issued token backing the one-click unsubscribe in every message. */
  unsubscribeToken: string;
}

export type SearchAlertFieldErrors = Partial<Record<keyof SearchAlertDraft, string>>;
