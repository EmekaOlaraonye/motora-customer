/**
 * Normalised error type. Every repository translates its own failures into an
 * ApiError so the UI has one shape to render regardless of the data source.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(code: ApiErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = options?.status;
    this.cause = options?.cause;
  }

  static notFound(what: string) {
    return new ApiError('not_found', `${what} could not be found.`, { status: 404 });
  }

  static network(cause?: unknown) {
    return new ApiError(
      'network',
      'We could not reach the Motora servers. Check your connection and try again.',
      { cause },
    );
  }

  static unknown(cause?: unknown) {
    return new ApiError('unknown', 'Something went wrong on our side. Please try again.', { cause });
  }
}

export type ApiErrorCode = 'not_found' | 'network' | 'validation' | 'rate_limited' | 'unknown';

/** Coerces anything thrown into an ApiError so callers can rely on the shape. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) return ApiError.unknown(error);
  return ApiError.unknown(error);
}
