import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { EnquiryNotifier, FeaturedProducts } from '../src/domain/ports';
import { createApp } from '../src/http/app';
import { createLogger } from '../src/logger';
import { CatalogueService } from '../src/services/catalogue-service';
import { EnquiryService } from '../src/services/enquiry-service';
import { featuredProducts, product, productCatalog } from './fixtures';

const item = product('1');
const baseUrl = 'http://localhost:8080';
const input = { productId: item.id, name: 'Sam Reviewer', email: 'sam@example.test' };

function app({
  notify = async () => {},
  featured = featuredProducts(item.id),
}: { notify?: EnquiryNotifier['notify']; featured?: FeaturedProducts } = {}) {
  const logger = createLogger('silent');
  const catalogue = new CatalogueService(productCatalog([item]), featured, logger);
  return createApp({
    logger,
    corsOrigins: [],
    imageTimeoutMs: 1000,
    catalogue,
    enquiries: new EnquiryService(catalogue, { notify }, baseUrl, logger),
  });
}

describe('catalogue API', () => {
  it('returns field details for an invalid enquiry', async () => {
    const response = await request(app())
      .post('/api/v1/enquiries')
      .send({ ...input, name: '', email: 'invalid' })
      .expect(400);

    expect(response.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        details: {
          name: ['Please enter your name'],
          email: ['Please enter a valid email address'],
        },
      },
    });
  });

  it('returns 502 when email delivery fails', async () => {
    const notify = vi
      .fn<EnquiryNotifier['notify']>()
      .mockRejectedValue(new Error('SMTP unavailable'));
    const response = await request(app({ notify }))
      .post('/api/v1/enquiries')
      .send(input)
      .expect(502);

    expect(response.body).toMatchObject({ error: { code: 'EMAIL_DELIVERY_FAILED' } });
    expect(notify).toHaveBeenCalledOnce();
  });

  it('returns 404 for a missing product', async () => {
    const response = await request(app()).get('/api/v1/products/missing').expect(404);

    expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });

  it('returns 400 for a blank search', async () => {
    const response = await request(app()).get('/api/v1/products').query({ q: '  ' }).expect(400);

    expect(response.body).toMatchObject({
      error: { code: 'VALIDATION_ERROR', details: { q: ['A search term is required.'] } },
    });
  });

  it('returns a generic 500 when an adapter exposes a schema error', async () => {
    const featured = { listFeaturedIds: async () => z.array(z.string()).parse(null) };
    const response = await request(app({ featured })).get('/api/v1/products/featured').expect(500);

    expect(response.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
    });
  });

  it('keeps serving requests when an upstream image stream breaks', async () => {
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error('Upstream image disconnected'));
      },
    });
    const fetchImage = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(body, { headers: { 'content-type': 'image/png' } }));
    const server = request(app());

    try {
      await expect(server.get('/api/v1/products/1/image')).rejects.toThrow(
        /socket hang up|aborted/,
      );
      await server.get('/api/health').expect(200);
    } finally {
      fetchImage.mockRestore();
    }
  });

  it('keeps only valid request IDs', async () => {
    const server = request(app());
    await server
      .get('/api/health')
      .set('x-request-id', 'review_123-abc')
      .expect('x-request-id', 'review_123-abc');
    await server
      .get('/api/health')
      .set('x-request-id', 'invalid id')
      .expect('x-request-id', /^[0-9a-f-]{36}$/);
  });
});
