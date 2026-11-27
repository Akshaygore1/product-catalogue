import type { Category, CategoryPage, Product } from '@catalogue/shared';
import { NotFoundError } from '../domain/errors';
import type { FeaturedProducts, ProductCatalog } from '../domain/ports';
import { normaliseSearchTerm } from '../domain/search';
import type { Logger } from '../logger';

export const HOME_FEATURED_LIMIT = 5;
export const CATEGORY_TOP_RATED_MIN = 3;

/** Use cases for browsing the catalogue. Depends only on ports. */
export class CatalogueService {
  constructor(
    private readonly catalog: ProductCatalog,
    private readonly featured: FeaturedProducts,
    private readonly logger: Logger,
  ) {}

  listCategories(): Promise<Category[]> {
    return this.catalog.listCategories();
  }

  /** The curated products, in the order they were chosen. Unknown IDs are skipped. */
  async getFeatured(): Promise<Product[]> {
    const [ids, products] = await Promise.all([
      this.featured.listFeaturedIds(),
      this.catalog.listProducts(),
    ]);
    const byId = new Map(products.map((p) => [p.id, p]));
    const featured: Product[] = [];
    for (const id of ids) {
      const product = byId.get(id);
      if (product) featured.push(product);
      else this.logger.warn({ productId: id }, 'Featured product not found in catalogue; skipping');
    }
    return featured.slice(0, HOME_FEATURED_LIMIT);
  }

  /**
   * Top rated = curated products in this category, topped up with the highest
   * rated remaining products until there are at least CATEGORY_TOP_RATED_MIN.
   * Everything else in the category is "more".
   */
  async getCategoryPage(slug: string): Promise<CategoryPage> {
    const categories = await this.catalog.listCategories();
    const category = categories.find((c) => c.slug === slug);
    if (!category) throw new NotFoundError(`Category "${slug}" was not found.`);

    const [products, featuredIds] = await Promise.all([
      this.catalog.listByCategory(slug),
      this.featured.listFeaturedIds(),
    ]);

    const byId = new Map(products.map((p) => [p.id, p]));
    const topRated = featuredIds.flatMap((id) => byId.get(id) ?? []);
    const remaining = products
      .filter((p) => !topRated.includes(p))
      .sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0));

    const topUp = Math.max(0, CATEGORY_TOP_RATED_MIN - topRated.length);
    topRated.push(...remaining.filter((p) => p.rating).slice(0, topUp));
    const more = products.filter((p) => !topRated.includes(p));

    return { category, topRated, more };
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.catalog.getProduct(id);
    if (!product) throw new NotFoundError(`Product "${id}" was not found.`);
    return product;
  }

  search(term: string): Promise<Product[]> {
    return this.catalog.search(normaliseSearchTerm(term));
  }
}
