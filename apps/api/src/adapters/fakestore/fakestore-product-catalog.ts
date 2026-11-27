import type { Category, Product } from '@catalogue/shared';
import { z } from 'zod';
import { UpstreamUnavailableError } from '../../domain/errors';
import type { ProductCatalog } from '../../domain/ports';
import type { Logger } from '../../logger';
import { matchesSearchTerm } from '../../domain/search';

/** Upstream shape, validated at the boundary so bad data never leaks inward. */
const FakeStoreProductSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  price: z.number().nonnegative(),
  description: z.string(),
  category: z.string(),
  image: z.string(),
  rating: z.object({ rate: z.number(), count: z.number().int() }).optional(),
});
type FakeStoreProduct = z.infer<typeof FakeStoreProductSchema>;

interface Snapshot {
  products: Product[];
  categories: Category[];
  fetchedAt: number;
}

export interface FakeStoreOptions {
  baseUrl: string;
  cacheTtlMs: number;
  timeoutMs: number;
  logger: Logger;
}

/** "men's clothing" -> "mens-clothing" */
export function toCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toCategoryName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function toProduct(source: FakeStoreProduct): Product {
  return {
    id: String(source.id),
    title: source.title,
    description: source.description,
    price: { amount: Math.round(source.price * 100), currency: 'USD' },
    imageUrl: source.image,
    categorySlug: toCategorySlug(source.category),
    rating: source.rating ? { average: source.rating.rate, count: source.rating.count } : undefined,
  };
}

/**
 * Fake Store API adapter. The whole catalogue is small, so it is fetched once and
 * cached in memory; search and category filtering run against the cache.
 * On refresh failure the last good snapshot is served (stale-while-error).
 */
export class FakeStoreProductCatalog implements ProductCatalog {
  private snapshot: Snapshot | undefined;
  private inFlight: Promise<Snapshot> | undefined;

  constructor(private readonly options: FakeStoreOptions) {}

  async listCategories(): Promise<Category[]> {
    return (await this.load()).categories;
  }

  async listProducts(): Promise<Product[]> {
    return (await this.load()).products;
  }

  async listByCategory(categorySlug: string): Promise<Product[]> {
    return (await this.load()).products.filter((p) => p.categorySlug === categorySlug);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return (await this.load()).products.find((p) => p.id === id);
  }

  async search(term: string): Promise<Product[]> {
    const { products, categories } = await this.load();
    const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));
    return products.filter((p) =>
      matchesSearchTerm(term, [p.title, p.description, categoryNames.get(p.categorySlug) ?? '']),
    );
  }

  private async load(): Promise<Snapshot> {
    const { snapshot } = this;
    if (snapshot && Date.now() - snapshot.fetchedAt < this.options.cacheTtlMs) {
      return snapshot;
    }
    // De-duplicate concurrent refreshes.
    this.inFlight ??= this.refresh().finally(() => {
      this.inFlight = undefined;
    });
    try {
      return await this.inFlight;
    } catch (error) {
      if (snapshot) {
        this.options.logger.warn({ err: error }, 'Catalogue refresh failed; serving stale data');
        return snapshot;
      }
      throw new UpstreamUnavailableError('The product catalogue is temporarily unavailable.', {
        cause: error,
      });
    }
  }

  private async refresh(): Promise<Snapshot> {
    const raw = await this.fetchJson('/products');
    const sourceProducts = z.array(FakeStoreProductSchema).parse(raw);

    const categoryNames = [...new Set(sourceProducts.map((p) => p.category))].sort();
    const snapshot: Snapshot = {
      products: sourceProducts.map(toProduct),
      categories: categoryNames.map((name) => ({
        slug: toCategorySlug(name),
        name: toCategoryName(name),
      })),
      fetchedAt: Date.now(),
    };
    this.snapshot = snapshot;
    this.options.logger.info(
      { products: snapshot.products.length, categories: snapshot.categories.length },
      'Catalogue refreshed from Fake Store',
    );
    return snapshot;
  }

  private async fetchJson(path: string): Promise<unknown> {
    const response = await fetch(new URL(path, this.options.baseUrl), {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });
    if (!response.ok) {
      throw new Error(`Fake Store responded ${response.status} for ${path}`);
    }
    return response.json();
  }
}
