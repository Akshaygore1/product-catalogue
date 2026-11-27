/** Envelope for successful responses. */
export interface ApiData<T> {
  data: T;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'EMAIL_DELIVERY_FAILED'
  | 'INTERNAL_ERROR';

/** Envelope for every error response. */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}
