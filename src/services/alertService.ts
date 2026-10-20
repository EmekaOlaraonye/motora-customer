import type { SearchAlert, SearchAlertDraft, SearchAlertPayload, VehicleQuery } from '../types';
import { describeQueryTitle } from '../utils/describeQuery';
import { dataSource } from './dataSource';

export function createSearchAlert(
  payload: SearchAlertPayload,
  signal?: AbortSignal,
): Promise<SearchAlert> {
  return dataSource.alerts.create(payload, signal);
}

/**
 * Attaches the search being watched to the customer's details.
 *
 * Paging and sorting are stripped: they describe how results were being
 * displayed, not what the customer is looking for, and "page 3" has no
 * meaning in an alert sent next week.
 */
export function buildAlertPayload(
  draft: SearchAlertDraft,
  query: VehicleQuery,
): SearchAlertPayload {
  const { page: _page, pageSize: _pageSize, sort: _sort, ...watched } = query;

  return {
    ...draft,
    query: watched,
    description: describeQueryTitle(watched),
  };
}
