import { DEFAULT_ENQUIRY_MESSAGE } from '@catalogue/shared';
import { describe, expect, it, vi } from 'vitest';
import { renderEnquiryEmail } from '../src/adapters/email/enquiry-email';
import { EmailDeliveryError } from '../src/domain/errors';
import type { EnquiryNotifier } from '../src/domain/ports';
import { createLogger } from '../src/logger';
import { CatalogueService } from '../src/services/catalogue-service';
import { EnquiryService } from '../src/services/enquiry-service';
import { featuredProducts, product, productCatalog } from './fixtures';

const logger = createLogger('silent');
const item = product('1');
const baseUrl = 'http://localhost:8080';
const input = { productId: item.id, name: 'Sam Reviewer', email: 'sam@example.test' };

function createService(notify: EnquiryNotifier['notify']) {
  const catalogue = new CatalogueService(productCatalog([item]), featuredProducts(), logger);
  return new EnquiryService(catalogue, { notify }, baseUrl, logger);
}

describe('EnquiryService', () => {
  it('returns a receipt for a honeypot submission without looking up the product or sending mail', async () => {
    const notify = vi.fn<EnquiryNotifier['notify']>();
    const enquiries = createService(notify);

    await expect(
      enquiries.submit({ ...input, productId: 'missing', website: 'filled' }),
    ).resolves.toEqual({ enquiryId: expect.any(String) });
    expect(notify).not.toHaveBeenCalled();
  });

  it('wraps notifier failures in an EmailDeliveryError', async () => {
    const cause = new Error('SMTP unavailable');
    const enquiries = createService(vi.fn<EnquiryNotifier['notify']>().mockRejectedValue(cause));
    const result = enquiries.submit(input);

    await expect(result).rejects.toBeInstanceOf(EmailDeliveryError);
    await expect(result).rejects.toHaveProperty('cause', cause);
  });

  it('uses server-side product details and a default message', async () => {
    const notify = vi.fn<EnquiryNotifier['notify']>().mockResolvedValue(undefined);
    const enquiries = createService(notify);
    const submission = { ...input, product: { ...item, title: 'Client title' } };

    const receipt = await enquiries.submit(submission);

    expect(notify).toHaveBeenCalledExactlyOnceWith({
      id: receipt.enquiryId,
      product: item,
      productUrl: `${baseUrl}/products/${item.id}`,
      customer: { name: input.name, email: input.email, phone: undefined },
      message: DEFAULT_ENQUIRY_MESSAGE,
      receivedAt: expect.any(Date),
    });
  });
});

it('escapes HTML in enquiry email fields while preserving plain text', () => {
  const message = `<p title="quoted">Tom & Jerry's</p>`;
  const { html, text } = renderEnquiryEmail({
    id: 'reference',
    product: { ...item, title: 'A < B' },
    productUrl: `${baseUrl}/products/${item.id}`,
    customer: { name: '<Sam>', email: input.email },
    message,
    receivedAt: new Date('2026-01-01T00:00:00Z'),
  });

  expect(html).toContain('&lt;p title=&quot;quoted&quot;&gt;Tom &amp; Jerry&#39;s&lt;/p&gt;');
  expect(html).toContain('&lt;Sam&gt;');
  expect(html).toContain('A &lt; B');
  expect(html).not.toContain(message);
  expect(text).toContain(message);
});
