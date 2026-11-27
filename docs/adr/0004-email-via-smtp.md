# 4. Enquiry email via SMTP (Nodemailer), Mailpit locally

Status: accepted

## Context

The sales inbox must receive an email, the reviewer must be able to see it, and nothing may depend on paid services or accounts. The email provider is expected to change.

## Decision

`SmtpEnquiryNotifier` sends with Nodemailer to any SMTP server. Docker Compose runs Mailpit, which captures every email and shows it at http://localhost:8025. The email has HTML and plain text versions, and `Reply-To` is the customer, so sales can reply directly.

The customer only sees "Thank you" after the email is accepted by the SMTP server. On failure the API returns `502` and the form shows a retryable error.

## Consequences

- Production can use AWS SES (SMTP interface) or any provider by changing environment variables.
- Sending is synchronous. At higher volume, a queue (e.g. SQS) between the API and the notifier would decouple delivery from the request.
