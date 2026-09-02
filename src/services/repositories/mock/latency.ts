/**
 * Simulated network behaviour for the mock data source.
 *
 * Artificial latency keeps loading skeletons honest during development, and a
 * small failure rate (opt-in) lets error states be exercised without unplugging
 * the network.
 */

const MIN_MS = 180;
const MAX_MS = 520;

/** Set VITE_MOCK_FAILURE_RATE=0.2 to make one request in five fail. */
const FAILURE_RATE = Number(import.meta.env.VITE_MOCK_FAILURE_RATE ?? 0);

export class AbortedError extends Error {
  constructor() {
    super('Request aborted');
    this.name = 'AbortError';
  }
}

export function delay(signal?: AbortSignal): Promise<void> {
  const ms = MIN_MS + Math.random() * (MAX_MS - MIN_MS);

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AbortedError());
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      reject(new AbortedError());
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export function maybeFail(): void {
  if (FAILURE_RATE > 0 && Math.random() < FAILURE_RATE) {
    throw new Error('Simulated network failure');
  }
}

/** Deep clone so callers cannot mutate the in-memory fixtures. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}
