import { z } from 'zod';
import { RequestValidationError } from '../domain/errors';

export function parseRequest<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new RequestValidationError(z.flattenError(result.error).fieldErrors);
  return result.data;
}
