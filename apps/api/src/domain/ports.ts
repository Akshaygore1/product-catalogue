import type { Category, Product } from '@catalogue/shared';

/**
 * Ports: the only things the services depend on. Each has one adapter today and
 * can be swapped (Shopify, a CMS, a database, SES, ...) without touching routes or services.
 */

/** Read access to the product catalogue, whatever the underlying source. */
export interface ProductCatalog {
  listCategories(): Promise<Category[]>;
  listProducts(): Promise<Product[]>;
  listByCategory(categorySlug: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  /** Products with text matching the term. Sources with native search should use it. */
  search(term: string): Promise<Product[]>;
}

/** The entrepreneur's hand-picked "top rated" products, in display order. */
export interface FeaturedProducts {
  listFeaturedIds(): Promise<string[]>;
}

export interface Enquiry {
  id: string;
  product: Product;
  productUrl: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  message: string;
  receivedAt: Date;
}

/** Delivers an enquiry to the sales team. */
export interface EnquiryNotifier {
  notify(enquiry: Enquiry): Promise<void>;
}
