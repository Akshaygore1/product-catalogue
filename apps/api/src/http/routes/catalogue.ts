import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import type { ApiData, Category, CategoryPage, Product } from '@catalogue/shared';
import { Router } from 'express';
import { z } from 'zod';
import { UpstreamUnavailableError } from '../../domain/errors';
import type { CatalogueService } from '../../services/catalogue-service';
import { presentProduct } from '../presenters';

const SearchQuerySchema = z.object({
  q: z
    .string({ error: 'A search term is required.' })
    .trim()
    .min(1, 'A search term is required.')
    .max(100),
});

const IdParamSchema = z.object({ id: z.string().min(1).max(64) });
const SlugParamSchema = z.object({ slug: z.string().min(1).max(64) });

export function catalogueRouter(catalogue: CatalogueService, imageTimeoutMs: number): Router {
  const router = Router();

  router.get('/categories', async (_req, res) => {
    const body: ApiData<Category[]> = { data: await catalogue.listCategories() };
    res.json(body);
  });

  router.get('/categories/:slug/products', async (req, res) => {
    const { slug } = SlugParamSchema.parse(req.params);
    const page = await catalogue.getCategoryPage(slug);
    const body: ApiData<CategoryPage> = {
      data: {
        category: page.category,
        topRated: page.topRated.map(presentProduct),
        more: page.more.map(presentProduct),
      },
    };
    res.json(body);
  });

  router.get('/products/featured', async (_req, res) => {
    const body: ApiData<Product[]> = {
      data: (await catalogue.getFeatured()).map(presentProduct),
    };
    res.json(body);
  });

  router.get('/products', async (req, res) => {
    const { q } = SearchQuerySchema.parse(req.query);
    const body: ApiData<Product[]> = { data: (await catalogue.search(q)).map(presentProduct) };
    res.json(body);
  });

  router.get('/products/:id', async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    const body: ApiData<Product> = { data: presentProduct(await catalogue.getProduct(id)) };
    res.json(body);
  });

  /** Streams the product image from the source. The URL comes from the catalogue, never the client. */
  router.get('/products/:id/image', async (req, res) => {
    const { id } = IdParamSchema.parse(req.params);
    const product = await catalogue.getProduct(id);

    let upstream: Response;
    try {
      upstream = await fetch(product.imageUrl, { signal: AbortSignal.timeout(imageTimeoutMs) });
    } catch (error) {
      throw new UpstreamUnavailableError('The product image is temporarily unavailable.', {
        cause: error,
      });
    }
    const contentType = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !upstream.body || !contentType.startsWith('image/')) {
      throw new UpstreamUnavailableError('The product image is temporarily unavailable.');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    Readable.fromWeb(upstream.body as ReadableStream).pipe(res);
  });

  return router;
}
