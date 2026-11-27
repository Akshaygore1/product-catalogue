import type { ApiData, ApiErrorBody, ApiErrorCode } from '@catalogue/shared';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode | 'NETWORK_ERROR',
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = '/api/v1';

/** Typed fetch wrapper: unwraps `{ data }` and turns error envelopes into ApiError. */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { accept: 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection.');
  }

  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const error = (body as ApiErrorBody | undefined)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? 'INTERNAL_ERROR',
      error?.message ?? 'Something went wrong. Please try again.',
      error?.details,
    );
  }
  return (body as ApiData<T>).data;
}
