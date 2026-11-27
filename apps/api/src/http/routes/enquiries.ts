import { EnquiryInputSchema, type ApiData, type EnquiryReceipt } from '@catalogue/shared';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { EnquiryService } from '../../services/enquiry-service';
import { parseRequest } from '../request-validation';

export function enquiriesRouter(enquiries: EnquiryService): Router {
  const router = Router();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Too many enquiries. Please try again later.' },
      });
    },
  });

  router.post('/enquiries', limiter, async (req, res) => {
    const input = parseRequest(EnquiryInputSchema, req.body);
    const body: ApiData<EnquiryReceipt> = { data: await enquiries.submit(input) };
    res.status(201).json(body);
  });

  return router;
}
