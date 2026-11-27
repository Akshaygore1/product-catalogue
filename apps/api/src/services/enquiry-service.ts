import { randomUUID } from 'node:crypto';
import { DEFAULT_ENQUIRY_MESSAGE, type EnquiryInput, type EnquiryReceipt } from '@catalogue/shared';
import { EmailDeliveryError } from '../domain/errors';
import type { Enquiry, EnquiryNotifier } from '../domain/ports';
import type { Logger } from '../logger';
import type { CatalogueService } from './catalogue-service';

export class EnquiryService {
  constructor(
    private readonly catalogue: CatalogueService,
    private readonly notifier: EnquiryNotifier,
    private readonly webBaseUrl: string,
    private readonly logger: Logger,
  ) {}

  async submit(input: EnquiryInput): Promise<EnquiryReceipt> {
    const enquiryId = randomUUID();

    if (input.website) {
      // Honeypot tripped: pretend success so bots learn nothing.
      this.logger.info({ enquiryId }, 'Enquiry dropped by honeypot');
      return { enquiryId };
    }

    // Look the product up ourselves; never trust product details sent by the client.
    const product = await this.catalogue.getProduct(input.productId);

    const enquiry: Enquiry = {
      id: enquiryId,
      product,
      productUrl: new URL(
        `/products/${encodeURIComponent(product.id)}`,
        this.webBaseUrl,
      ).toString(),
      customer: {
        name: input.name,
        email: input.email,
        phone: input.phone || undefined,
      },
      message: input.message || DEFAULT_ENQUIRY_MESSAGE,
      receivedAt: new Date(),
    };

    try {
      await this.notifier.notify(enquiry);
    } catch (error) {
      this.logger.error({ err: error, enquiryId }, 'Failed to deliver enquiry email');
      throw new EmailDeliveryError({ cause: error });
    }

    this.logger.info({ enquiryId, productId: product.id }, 'Enquiry delivered');
    return { enquiryId };
  }
}
