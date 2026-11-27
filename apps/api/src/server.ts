import { loadConfig } from './config';
import { createContainer } from './container';
import { createApp } from './http/app';
import { createLogger } from './logger';

const config = loadConfig();
const logger = createLogger(config.LOG_LEVEL);
const { catalogue, enquiries } = createContainer(config, logger);

const app = createApp({
  logger,
  corsOrigins: config.CORS_ORIGINS,
  imageTimeoutMs: config.UPSTREAM_TIMEOUT_MS,
  trustProxy: config.TRUST_PROXY,
  catalogue,
  enquiries,
});

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, productSource: config.PRODUCT_SOURCE }, 'API listening');
  // Warm the catalogue cache so the first visitor doesn't wait on the upstream source.
  catalogue.listCategories().catch((err: unknown) => {
    logger.warn({ err }, 'Catalogue warm-up failed; will retry on first request');
  });
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
