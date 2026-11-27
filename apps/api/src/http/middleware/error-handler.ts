import type { ApiErrorBody } from '@catalogue/shared';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, NotFoundError } from '../../domain/errors';
import { RequestValidationError } from '../request-validation';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path} was not found.`));
};

/** Single place that turns errors into the consistent `{ error: { code, message } }` shape. */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.destroyed || res.headersSent) {
    req.log.error({ err }, 'Response interrupted');
    if (!res.destroyed) next(err);
    return;
  }

  let status = 500;
  let body: ApiErrorBody = {
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  };

  if (err instanceof RequestValidationError) {
    status = 400;
    body = {
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details,
      },
    };
  } else if (err instanceof AppError) {
    status = err.status;
    body = { error: { code: err.code, message: err.message } };
  } else if (isBodyParserError(err)) {
    status = err.status;
    body = { error: { code: 'VALIDATION_ERROR', message: 'The request body was invalid.' } };
  }

  if (status >= 500) req.log.error({ err }, 'Request failed');
  else req.log.warn({ code: body.error.code }, body.error.message);

  res.status(status).json(body);
};

function isBodyParserError(err: unknown): err is { status: number } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    'status' in err &&
    typeof err.status === 'number' &&
    err.status >= 400 &&
    err.status < 500
  );
}
