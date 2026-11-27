import type { Money } from '@catalogue/shared';
import type { Enquiry } from '../../domain/ports';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMoney({ amount, currency }: Money): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
}

/** Renders the sales notification as plain text and simple HTML. */
export function renderEnquiryEmail(enquiry: Enquiry) {
  const { product, customer } = enquiry;
  const price = formatMoney(product.price);
  const rows: [string, string][] = [
    ['Name', customer.name],
    ['Email', customer.email],
    ['Phone', customer.phone || 'Not provided'],
    ['Product', `${product.title} (ID ${product.id})`],
    ['Price', price],
    ['Link', enquiry.productUrl],
    ['Reference', enquiry.id],
    ['Received', enquiry.receivedAt.toISOString()],
  ];

  const subject = `New enquiry: ${product.title}`;

  const text = [
    `New product enquiry from ${customer.name}`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message:',
    enquiry.message,
    '',
    'Reply to this email to respond to the customer directly.',
  ].join('\n');

  const html = `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #5D5D5D;">
    <h1 style="font-size: 18px; font-weight: 500; color: #292929;">New product enquiry</h1>
    <table cellpadding="6" style="border-collapse: collapse;">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="color: #7F7F7F;">${escapeHtml(label)}</td><td style="color: #292929;">${escapeHtml(value)}</td></tr>`,
        )
        .join('\n      ')}
    </table>
    <h2 style="font-size: 14px; font-weight: 500; color: #292929;">Message</h2>
    <p style="white-space: pre-wrap;">${escapeHtml(enquiry.message)}</p>
    <p style="color: #7F7F7F; font-size: 12px;">Reply to this email to respond to the customer directly.</p>
  </body>
</html>`;

  return { subject, text, html };
}
