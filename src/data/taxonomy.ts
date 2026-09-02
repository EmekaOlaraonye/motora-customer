import type { BodyType, FuelType, Transmission, VehicleCondition } from '../types';

/**
 * Reference data for filter controls. In production this would come from the
 * API (or be derived from search facets) rather than being bundled.
 */

/** Areas around Gaborone where listings are commonly located. */
export const GABORONE_AREAS = [
  'Gaborone CBD',
  'Broadhurst',
  'Block 8',
  'Block 10',
  'Extension 2',
  'Phakalane',
  'Mogoditshane',
  'Tlokweng',
  'Gaborone West',
  'Kgale',
  'Gabane',
  'The Village',
] as const;

export const BODY_TYPES: BodyType[] = [
  'Hatchback',
  'Sedan',
  'SUV',
  'Crossover',
  'Bakkie',
  'Double Cab',
  'MPV',
  'Coupe',
  'Van',
];

export const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

export const TRANSMISSIONS: Transmission[] = ['Automatic', 'Manual'];

export const CONDITIONS: VehicleCondition[] = ['New', 'Excellent', 'Good', 'Fair'];

/** Makes mapped to the models that actually move in the Gaborone market. */
export const MAKE_MODELS: Record<string, string[]> = {
  Toyota: ['Hilux', 'Fortuner', 'Corolla', 'RAV4', 'Vitz', 'Land Cruiser Prado', 'Hiace', 'Quantum'],
  Nissan: ['Navara', 'X-Trail', 'Note', 'Qashqai', 'NP300'],
  Mazda: ['Demio', 'CX-5', 'BT-50', 'Mazda3'],
  Ford: ['Ranger', 'EcoSport', 'Everest'],
  Volkswagen: ['Polo Vivo', 'Golf', 'Amarok', 'Tiguan'],
  Honda: ['Fit', 'CR-V', 'Civic'],
  Isuzu: ['D-Max', 'MU-X'],
  Mitsubishi: ['Pajero', 'Triton', 'Outlander'],
  Subaru: ['Forester', 'Impreza', 'Outback'],
  Suzuki: ['Swift', 'Jimny', 'Vitara'],
  Hyundai: ['i20', 'Tucson', 'Creta'],
  Kia: ['Sportage', 'Rio', 'Seltos'],
  BMW: ['3 Series', 'X3', 'X5'],
  'Mercedes-Benz': ['C-Class', 'GLC', 'ML'],
  'Land Rover': ['Discovery', 'Defender'],
};

export const MAKES = Object.keys(MAKE_MODELS).sort();

/** Price bands used by the homepage quick-browse tiles, in BWP. */
export const PRICE_BANDS = [
  { label: 'Under P80,000', min: 0, max: 80_000 },
  { label: 'P80,000 – P150,000', min: 80_000, max: 150_000 },
  { label: 'P150,000 – P300,000', min: 150_000, max: 300_000 },
  { label: 'P300,000 – P500,000', min: 300_000, max: 500_000 },
  { label: 'Over P500,000', min: 500_000, max: undefined },
];

/** Absolute bounds for the range sliders. */
export const PRICE_BOUNDS = { min: 0, max: 900_000 };
export const YEAR_BOUNDS = { min: 2008, max: new Date().getFullYear() };
export const MILEAGE_BOUNDS = { min: 0, max: 300_000 };
