import type { Category, Product } from '@catalogue/shared';
import type { FeaturedProducts, ProductCatalog } from '../src/domain/ports';

export const electronics: Category = { slug: 'electronics', name: 'Electronics' };

export function product(id: string, average?: number): Product {
  return {
    id,
    title: `Product ${id}`,
    description: 'A product for testing',
    price: { amount: 2999, currency: 'USD' },
    imageUrl: 'https://catalogue.example.test/image.png',
    categorySlug: electronics.slug,
    rating: average === undefined ? undefined : { average, count: 1 },
  };
}

export function productCatalog(products: Product[]): ProductCatalog {
  return {
    listCategories: async () => [electronics],
    listProducts: async () => products,
    listByCategory: async (slug) => products.filter((item) => item.categorySlug === slug),
    getProduct: async (id) => products.find((item) => item.id === id),
    search: async () => [],
  };
}

export function featuredProducts(...ids: string[]): FeaturedProducts {
  return { listFeaturedIds: async () => ids };
}
