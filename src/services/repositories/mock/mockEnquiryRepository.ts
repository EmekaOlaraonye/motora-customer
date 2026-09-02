import type { Enquiry, EnquiryPayload } from '../../../types';
import { ApiError } from '../../ApiError';
import type { EnquiryRepository } from '../types';
import { AbortedError, delay } from './latency';

/**
 * Enquiries are held in memory for the session. The real implementation will
 * write to Firestore and trigger a notification to the garage.
 */
const SUBMITTED: Enquiry[] = [];

export const mockEnquiryRepository: EnquiryRepository = {
  async create(payload: EnquiryPayload, signal?: AbortSignal): Promise<Enquiry> {
    try {
      // Slightly longer than a read, so the submitting state is visible.
      await delay(signal);
      await delay(signal);

      // Exercises the form's error path during development.
      if (payload.email.trim().toLowerCase().endsWith('@fail.test')) {
        throw new ApiError('unknown', 'We could not deliver your enquiry. Please try again.');
      }

      const enquiry: Enquiry = {
        ...payload,
        id: `enq-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        status: 'received',
      };

      SUBMITTED.push(enquiry);
      return enquiry;
    } catch (error) {
      if (error instanceof AbortedError) throw error;
      if (error instanceof ApiError) throw error;
      throw ApiError.network(error);
    }
  },
};
