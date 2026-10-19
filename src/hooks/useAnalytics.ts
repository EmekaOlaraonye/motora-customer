import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../services';
import type { AnalyticsEventInput, AnalyticsEventType, AnalyticsValue } from '../types';

/**
 * Tracking helpers.
 *
 * `useTrackOnce` exists because React renders more than once per thing a
 * customer actually did — StrictMode alone double-invokes effects in
 * development. A view counted twice is a number a garage can catch you on.
 */

export function useAnalytics() {
  const location = useLocation();

  /** Queued, batched, sent later. */
  const track = useCallback(
    (
      type: AnalyticsEventType,
      details: Omit<AnalyticsEventInput, 'type' | 'path'> = {},
    ) => {
      trackEvent({ type, path: location.pathname, ...details });
    },
    [location.pathname],
  );

  /**
   * Sent straight away, for actions that hand the page over to another app.
   * A `tel:` or `wa.me` tap is exactly that, and is also the single most
   * commercially important event the product records.
   */
  const trackNow = useCallback(
    (
      type: AnalyticsEventType,
      details: Omit<AnalyticsEventInput, 'type' | 'path'> = {},
    ) => {
      trackEvent({ type, path: location.pathname, ...details }, true);
    },
    [location.pathname],
  );

  return { track, trackNow };
}

/**
 * Fires once per distinct `key`, however many times the component renders.
 * Pass `undefined` while the data is still loading; the event fires on the
 * first render where the key is known.
 */
export function useTrackOnce(
  type: AnalyticsEventType,
  key: string | undefined,
  details: Omit<AnalyticsEventInput, 'type' | 'path'> = {},
  metadata?: Record<string, AnalyticsValue>,
): void {
  const seen = useRef<string | undefined>(undefined);
  const location = useLocation();

  // Held in a ref so a freshly built details object does not re-fire the event.
  const payload = useRef({ details, metadata });
  payload.current = { details, metadata };

  useEffect(() => {
    if (!key || seen.current === key) return;
    seen.current = key;

    trackEvent({
      type,
      path: location.pathname,
      ...payload.current.details,
      metadata: payload.current.metadata,
    });
  }, [type, key, location.pathname]);
}
