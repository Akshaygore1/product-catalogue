import nodemailer, { type Transporter } from 'nodemailer';
import type { Enquiry, EnquiryNotifier } from '../../domain/ports';
import { renderEnquiryEmail } from './enquiry-email';

export interface SmtpOptions {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string;
}

/** Sends enquiries over SMTP. Works with Mailpit locally and AWS SES (SMTP interface) in production. */
export class SmtpEnquiryNotifier implements EnquiryNotifier {
  private readonly transporter: Transporter;

  constructor(private readonly options: SmtpOptions) {
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: options.user ? { user: options.user, pass: options.pass } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });
  }

  async notify(enquiry: Enquiry): Promise<void> {
    const { subject, text, html } = renderEnquiryEmail(enquiry);
    await this.transporter.sendMail({
      from: this.options.from,
      to: this.options.to,
      replyTo: { name: enquiry.customer.name, address: enquiry.customer.email },
      subject,
      text,
      html,
    });
  }
}
