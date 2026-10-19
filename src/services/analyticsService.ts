import type { AnalyticsEvent, AnalyticsEventInput } from '../types';
import { dataSource } from './dataSource';

/**
 * Event queue.
 *
 * Three properties matter here, in order:
 *
 * 1. It must never break the page. Every failure is swallowed; a dropped
 *    count is a rounding error, a white screen is not.
 * 2. It must not cost the customer money. Mobile data is expensive in
 *    Botswana, so events are batched rather than sent one request per tap.
 * 3. It must not lose the last events of a visit — which are the most
 *    valuable ones, because tapping "call" is usually the last thing someone
 *    does before leaving.
 */

const FLUSH_INTERVAL_MS = 10_000;
/** Flush early once a batch reaches this size, so a busy session stays current. */
const MAX_BATCH = 20;
const SESSION_KEY = 'motora.analytics-session';

let queue: AnalyticsEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let listenersBound = false;

function randomId(): string {
  // crypto.randomUUID is unavailable on older mobile browsers and on
  // insecure origins, both of which are realistic here.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Identifies a browsing session, not a person. Held in sessionStorage so it
 * dies with the tab and cannot be used to recognise a returning visitor.
 */
function sessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    const created = randomId();
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    // Storage blocked; events still group within this page load.
    return 'anonymous';
  }
}

function scheduleFlush() {
  if (timer !== undefined) return;
  timer = setTimeout(() => {
    timer = undefined;
    void flushEvents();
  }, FLUSH_INTERVAL_MS);
}

/** Sends whatever is queued. Safe to call at any time, including with nothing queued. */
export async function flushEvents(): Promise<void> {
  if (queue.length === 0) return;

  const batch = queue;
  queue = [];

  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }

  try {
    await dataSource.analytics.track(batch);
  } catch {
    // Deliberately silent. Re-queueing risks an unbounded retry loop on a
    // persistently failing sink, and these counts are not worth that.
  }
}

/**
 * Browsers do not reliably run async work during unload, so the final flush
 * is bound to the events that fire before a page goes away. `pagehide` covers
 * the mobile case that `beforeunload` misses.
 */
function bindUnloadFlush() {
  if (listenersBound || typeof window === 'undefined') return;
  listenersBound = true;

  const flushNow = () => void flushEvents();

  window.addEventListener('pagehide', flushNow);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushNow();
  });
}

/**
 * Queues an event. Returns immediately and never throws.
 *
 * `immediate` forces a flush for actions that navigate away from the page —
 * tapping a `tel:` or `wa.me` link hands control to another app, and a queued
 * event would otherwise be lost.
 */
export function trackEvent(input: AnalyticsEventInput, immediate = false): void {
  try {
    bindUnloadFlush();

    queue.push({
      ...input,
      id: randomId(),
      occurredAt: new Date().toISOString(),
      sessionId: sessionId(),
    });

    if (immediate || queue.length >= MAX_BATCH) {
      void flushEvents();
    } else {
      scheduleFlush();
    }
  } catch {
    // Instrumentation must never be the reason an interaction fails.
  }
}

/** Test and debugging helper: how many events are waiting to be sent. */
export function pendingEventCount(): number {
  return queue.length;
}
