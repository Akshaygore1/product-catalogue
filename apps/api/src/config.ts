import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  WEB_BASE_URL: z.url().default('http://localhost:8080'),

  PRODUCT_SOURCE: z.enum(['fakestore']).default('fakestore'),
  FAKESTORE_BASE_URL: z.url().default('https://fakestoreapi.com'),
  CATALOGUE_CACHE_TTL_SECONDS: z.coerce.number().int().nonnegative().default(300),
  UPSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

  FEATURED_PRODUCTS_FILE: z.string().default('./data/featured.json'),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: booleanString,
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Catalogue <no-reply@catalogue.local>'),
  SALES_INBOX: z.email().default('sales@catalogue.local'),
});

export type Config = z.infer<typeof ConfigSchema>;

/** Parses and validates configuration once at startup; fails fast with a readable message. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  // Treat empty strings (common in .env files) as "not set" so defaults apply.
  const cleaned = Object.fromEntries(Object.entries(env).filter(([, value]) => value !== ''));
  const result = ConfigSchema.safeParse(cleaned);
  if (!result.success) {
    throw new Error(`Invalid configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
