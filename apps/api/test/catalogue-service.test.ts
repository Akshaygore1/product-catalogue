import { describe, expect, it } from 'vitest';
import { NotFoundError } from '../src/domain/errors';
import { createLogger } from '../src/logger';
import { CatalogueService } from '../src/services/catalogue-service';
import { electronics, featuredProducts, product, productCatalog } from './fixtures';

const logger = createLogger('silent');

describe('CatalogueService', () => {
  it('preserves curated order, skips unknown IDs and caps the home list at five', async () => {
    const products = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => product(id));
    const catalogue = new CatalogueService(
      productCatalog(products),
      featuredProducts('c', 'missing', 'b', 'a', 'd', 'e', 'f'),
      logger,
    );

    expect((await catalogue.getFeatured()).map(({ id }) => id)).toEqual(['c', 'b', 'a', 'd', 'e']);
  });

  it('tops up the curated category selection by rating and preserves the remaining order', async () => {
    const low = product('low', 1);
    const curated = product('curated', 2);
    const unrated = product('unrated');
    const high = product('high', 4.8);
    const second = product('second', 4.1);
    const other = { ...product('other', 5), categorySlug: 'clothing' };
    const catalogue = new CatalogueService(
      productCatalog([low, curated, unrated, second, high, other]),
      featuredProducts(other.id, curated.id),
      logger,
    );

    await expect(catalogue.getCategoryPage(electronics.slug)).resolves.toEqual({
      category: electronics,
      topRated: [curated, high, second],
      more: [low, unrated],
    });
  });

  it('reports an unknown category as not found', async () => {
    const catalogue = new CatalogueService(productCatalog([]), featuredProducts(), logger);

    const result = catalogue.getCategoryPage('missing');

    await expect(result).rejects.toBeInstanceOf(NotFoundError);
    await expect(result).rejects.toMatchObject({ status: 404 });
  });
});
