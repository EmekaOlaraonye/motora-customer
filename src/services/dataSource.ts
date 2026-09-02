import { mockEnquiryRepository } from './repositories/mock/mockEnquiryRepository';
import { mockGarageRepository } from './repositories/mock/mockGarageRepository';
import { mockVehicleRepository } from './repositories/mock/mockVehicleRepository';
import type { DataSource } from './repositories/types';

/**
 * Single place where the application decides where its data comes from.
 *
 * To move onto the real backend, add a `firebase/` (or `http/`) repository set
 * implementing the same interfaces and select it here via
 * `VITE_DATA_SOURCE=api` — nothing above this file changes.
 */

const mockDataSource: DataSource = {
  vehicles: mockVehicleRepository,
  garages: mockGarageRepository,
  enquiries: mockEnquiryRepository,
};

function resolveDataSource(): DataSource {
  const configured = import.meta.env.VITE_DATA_SOURCE ?? 'mock';

  switch (configured) {
    case 'mock':
      return mockDataSource;
    default:
      console.warn(
        `[motora] Unknown VITE_DATA_SOURCE "${configured}". Falling back to mock data.`,
      );
      return mockDataSource;
  }
}

export const dataSource = resolveDataSource();
