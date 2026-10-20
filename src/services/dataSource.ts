import { apiDataSource } from './repositories/api';
import { mockAlertRepository } from './repositories/mock/mockAlertRepository';
import { mockAnalyticsRepository } from './repositories/mock/mockAnalyticsRepository';
import { mockEnquiryRepository } from './repositories/mock/mockEnquiryRepository';
import { mockGarageRepository } from './repositories/mock/mockGarageRepository';
import { mockReviewRepository } from './repositories/mock/mockReviewRepository';
import { mockVehicleRepository } from './repositories/mock/mockVehicleRepository';
import type { DataSource } from './repositories/types';

/**
 * Single place where the application decides where its data comes from.
 *
 * `VITE_DATA_SOURCE=api` points the app at the Motora backend; anything else
 * uses the bundled fixtures. Nothing above this file changes either way — both
 * repository sets satisfy the same interfaces and return the same shapes.
 */

const mockDataSource: DataSource = {
  vehicles: mockVehicleRepository,
  garages: mockGarageRepository,
  reviews: mockReviewRepository,
  enquiries: mockEnquiryRepository,
  alerts: mockAlertRepository,
  analytics: mockAnalyticsRepository,
};

function resolveDataSource(): DataSource {
  const configured = import.meta.env.VITE_DATA_SOURCE ?? 'mock';

  switch (configured) {
    case 'mock':
      return mockDataSource;
    case 'api':
      return apiDataSource;
    default:
      console.warn(
        `[motora] Unknown VITE_DATA_SOURCE "${configured}". Falling back to mock data.`,
      );
      return mockDataSource;
  }
}

export const dataSource = resolveDataSource();
