import { ApiError, type ApiErrorCode } from '../../ApiError';

/**
 * The HTTP transport for the API-backed repositories.
 *
 * Its whole job is to make a network failure indistinguishable, to everything
 * above it, from the mock's simulated one: same `ApiError` shape, same codes,
 * same abort behaviour. The pages, hooks and components already handle those —
 * this is why swapping the data source touches no component.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/** Error codes the API can return, mapped onto the client's own union. */
const KNOWN_CODES = new Set<ApiErrorCode>([
  'not_found',
  'network',
  'validation',
  'rate_limited',
  'unknown',
]);

interface ErrorBody {
  error?: { code?: string; message?: string; fields?: Record<string, string> };
}

/** Field-level messages from a 422, keyed the way the form's draft is. */
export class ValidationError extends ApiError {
  readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string>) {
    super('validation', message, { status: 422 });
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

async function toError(response: Response): Promise<ApiError> {
  let body: ErrorBody = {};
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    // A non-JSON error body (a proxy's HTML 502 page, say) is still a failure
    // worth reporting — just not one carrying a code.
  }

  const message = body.error?.message ?? 'Something went wrong. Please try again.';
  const rawCode = body.error?.code;

  if (rawCode === 'validation' && body.error?.fields) {
    return new ValidationError(message, body.error.fields);
  }

  const code: ApiErrorCode =
    rawCode && KNOWN_CODES.has(rawCode as ApiErrorCode)
      ? (rawCode as ApiErrorCode)
      : response.status === 404
        ? 'not_found'
        : response.status === 429
          ? 'rate_limited'
          : 'unknown';

  return new ApiError(code, message, { status: response.status });
}

async function request<T>(path: string, init: RequestInit & { signal?: AbortSignal }): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init.headers },
    });
  } catch (error) {
    // An abort is the caller changing its mind, not a failure. It is rethrown
    // untouched so `useAsyncData` can tell the two apart — reporting a
    // cancelled request as a network error is how a filter change flashes an
    // error banner that then disappears on its own.
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw ApiError.network(error);
  }

  if (!response.ok) throw await toError(response);
  if (response.status === 204) return undefined as T;

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw ApiError.unknown(error);
  }
}

export function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, { method: 'GET', signal });
}

export function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}

/**
 * Builds a query string, dropping anything empty.
 *
 * Arrays are comma-joined, matching how `utils/queryParams.ts` already writes
 * the browse URL — so the address bar and the API request carry the same text.
 */
export function queryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      if (value.length > 0) search.set(key, value.join(','));
    } else if (typeof value === 'boolean') {
      if (value) search.set(key, 'true');
    } else {
      search.set(key, String(value));
    }
  }

  const text = search.toString();
  return text ? `?${text}` : '';
}
