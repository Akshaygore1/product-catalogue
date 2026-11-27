import type { Product } from '@catalogue/shared';

/**
 * Maps a domain product to its public representation. Images are served through
 * our own API so the client never talks to the upstream data source directly.
 */
export function presentProduct(product: Product): Product {
  return { ...product, imageUrl: `/api/v1/products/${encodeURIComponent(product.id)}/image` };
}
