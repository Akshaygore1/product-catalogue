import { z } from 'zod';

export const DEFAULT_ENQUIRY_MESSAGE = "I'm interested in this product. Please get in touch.";

/** Single source of truth for enquiry validation, used by the web form and the API. */
export const EnquiryInputSchema = z.object({
  productId: z.string().trim().min(1),
  name: z.string().trim().min(1, 'Please enter your name').max(100, 'Name is too long'),
  email: z.email('Please enter a valid email address').max(254),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number is too long')
    .regex(/^[+\d\s().-]*$/, 'Please enter a valid phone number')
    .optional(),
  message: z.string().trim().max(2000, 'Message is too long').optional(),
  /**
   * Honeypot: hidden from humans, bots tend to fill it in. Not rejected by validation
   * (that would tip the bot off); the API silently drops enquiries where it is set.
   */
  website: z.string().max(500).optional(),
});
export type EnquiryInput = z.infer<typeof EnquiryInputSchema>;

export const EnquiryReceiptSchema = z.object({
  enquiryId: z.string(),
});
export type EnquiryReceipt = z.infer<typeof EnquiryReceiptSchema>;
