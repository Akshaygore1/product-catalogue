import type { ApiErrorCode } from '@catalogue/shared';

/** Base class for errors that map to a known HTTP response. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
  }
}

export class UpstreamUnavailableError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(503, 'UPSTREAM_UNAVAILABLE', message, options);
  }
}

export class EmailDeliveryError extends AppError {
  constructor(options?: ErrorOptions) {
    super(
      502,
      'EMAIL_DELIVERY_FAILED',
      'We could not send your enquiry. Please try again.',
      options,
    );
  }
}
