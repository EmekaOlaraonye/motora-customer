import type { Garage } from '../types';
import { dataSource } from './dataSource';

export function listGarages(signal?: AbortSignal): Promise<Garage[]> {
  return dataSource.garages.list(signal);
}

export function getGarageBySlug(slug: string, signal?: AbortSignal): Promise<Garage> {
  return dataSource.garages.getBySlug(slug, signal);
}

export function getGarageById(id: string, signal?: AbortSignal): Promise<Garage> {
  return dataSource.garages.getById(id, signal);
}
