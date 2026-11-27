import path from 'node:path';
import { FakeStoreProductCatalog } from './adapters/fakestore/fakestore-product-catalog';
import { JsonFileFeaturedProducts } from './adapters/featured/json-file-featured-products';
import { SmtpEnquiryNotifier } from './adapters/email/smtp-enquiry-notifier';
import type { Config } from './config';
import type { ProductCatalog } from './domain/ports';
import type { Logger } from './logger';
import { CatalogueService } from './services/catalogue-service';
import { EnquiryService } from './services/enquiry-service';

/**
 * Composition root: the only place that knows which adapters are in use.
 * Swapping the data source or email provider means adding an adapter and a case here.
 */
export function createContainer(config: Config, logger: Logger) {
  const catalog = createProductCatalog(config, logger);
  const featured = new JsonFileFeaturedProducts(path.resolve(config.FEATURED_PRODUCTS_FILE));
  const notifier = new SmtpEnquiryNotifier({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
    from: config.MAIL_FROM,
    to: config.SALES_INBOX,
  });

  const catalogue = new CatalogueService(catalog, featured, logger);
  const enquiries = new EnquiryService(catalogue, notifier, config.WEB_BASE_URL, logger);

  return { catalogue, enquiries };
}

function createProductCatalog(config: Config, logger: Logger): ProductCatalog {
  switch (config.PRODUCT_SOURCE) {
    case 'fakestore':
      return new FakeStoreProductCatalog({
        baseUrl: config.FAKESTORE_BASE_URL,
        cacheTtlMs: config.CATALOGUE_CACHE_TTL_SECONDS * 1000,
        timeoutMs: config.UPSTREAM_TIMEOUT_MS,
        logger,
      });
  }
}
