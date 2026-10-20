import type { SearchAlert, SearchAlertPayload } from '../../../types';
import { ApiError } from '../../ApiError';
import type { SearchAlertRepository } from '../types';
import { AbortedError, delay } from './latency';

/**
 * Saved searches held in memory for the session.
 *
 * The real implementation stores the query and runs it against new listings
 * as they are published. Nothing here sends anything.
 */
const REGISTERED: SearchAlert[] = [];

export const mockAlertRepository: SearchAlertRepository = {
  async create(payload: SearchAlertPayload, signal?: AbortSignal): Promise<SearchAlert> {
    try {
      await delay(signal);
      await delay(signal);

      // Exercises the form's failure path during development.
      if (payload.email.trim().toLowerCase().endsWith('@fail.test')) {
        throw new ApiError('unknown', 'We could not set up that alert. Please try again.');
      }

      const alert: SearchAlert = {
        ...payload,
        id: `alert-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        status: 'active',
        unsubscribeToken: Math.random().toString(36).slice(2),
      };

      REGISTERED.push(alert);
      return alert;
    } catch (error) {
      if (error instanceof AbortedError) throw error;
      if (error instanceof ApiError) throw error;
      throw ApiError.network(error);
    }
  },
};

/** Everything registered this session. Exposed for development only. */
export function registeredAlerts(): SearchAlert[] {
  return [...REGISTERED];
}
