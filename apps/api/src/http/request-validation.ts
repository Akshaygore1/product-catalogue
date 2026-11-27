import { z } from 'zod';
import { AppError } from '../domain/errors';

export class RequestValidationError extends AppError {
  constructor(readonly details: Record<string, string[] | undefined>) {
    super(400, 'VALIDATION_ERROR', 'The request was invalid.');
  }
}

export function parseRequest<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new RequestValidationError(z.flattenError(result.error).fieldErrors);
  return result.data;
}
