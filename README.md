# Product Catalogue

A proof of concept product catalogue that customers can browse, search and enquire from. It is built as a foundation to grow, not a throwaway prototype: the product data source, the look and feel, and the email provider can each be replaced without touching the rest of the system.

## Quick start

Requirements: Docker with Docker Compose. Nothing else, no accounts.

```bash
docker compose up --build
```

| What                  | URL                              |
| --------------------- | -------------------------------- |
| Web app               | http://localhost:8080            |
| Sales inbox (Mailpit) | http://localhost:8025            |
| API health            | http://localhost:8080/api/health |

Submit an enquiry from any product page and the email appears in Mailpit.

If a port is already in use, override it: `WEB_PORT=8088 docker compose up --build` (also `MAILPIT_PORT`). Copying `.env.example` to `.env` is optional; every setting has a working default.

### Without Docker

Requires Node 22+ and the pnpm version pinned in `package.json`. See the [pnpm installation guide](https://pnpm.io/installation).

```bash
pnpm install
docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit:v1.27   # local inbox
pnpm dev                                                          # web on :5173, API on :3000
```

The Docker setup serves the API through nginx. The API's direct development server does not trust
forwarded client IPs. Set `TRUST_PROXY=true` only when the API is accessible exclusively through
one trusted reverse proxy.

Other scripts include `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm format` and `pnpm format:check`.

## Unit and API tests

Run `pnpm test` after installing dependencies. Vitest covers catalogue rules, search, enquiry
handling, email escaping and config parsing. Supertest exercises the Express app with in-memory
adapters for catalogue data, featured IDs and email. These tests need no Docker, SMTP server or
upstream credentials. GitHub Actions runs formatting, lint, typecheck, these tests and the build.

## End-to-end tests

With Docker running and Compose 2.24.4 or later, run from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --only-shell chromium
pnpm test:e2e
```

The Chromium suite uses a dedicated Docker Compose stack with a fixed Fake Store catalogue and
Mailpit. Playwright starts and stops the stack as part of the run. The tests exercise the real
browser, API and SMTP integration, with all test email delivered to the local test inbox.

| Acceptance criterion | Browser check                                                            |
| -------------------- | ------------------------------------------------------------------------ |
| Featured products    | Home displays exactly the five curated products in order.                |
| Category browsing    | A category link opens the top-rated and additional products.             |
| Search               | Submitting a term returns matches by title, description or category.     |
| Product details      | Selecting a tile shows its description, price and backend-served image.  |
| Enquiry              | Submitting contact details shows “Thank you” and emails the sales inbox. |

The test stack uses web port `18080` and Mailpit port `18025`. Set `E2E_WEB_PORT` or
`E2E_MAILPIT_PORT` to use another local port.

## Stack and why

| Layer   | Choice                                               | Why                                                                                                                             |
| ------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Client  | React + TypeScript (Vite)                            | Web runs with one command (no simulator), and the look and feel is the part most likely to change, which is easiest on the web. |
| Backend | Node.js + Express + TypeScript                       | One language end to end, so client and server share the same validation schemas and types.                                      |
| Shared  | `packages/shared` (Zod schemas)                      | The enquiry form and the API validate with the same schema; API contracts cannot drift.                                         |
| Email   | Nodemailer over SMTP, Mailpit locally                | Provider-neutral. Works with AWS SES (SMTP interface) in production by changing environment variables only.                     |
| Tooling | pnpm workspaces, strict TypeScript, ESLint, Prettier | Monorepo with one lockfile; strictness catches mistakes early.                                                                  |

## Architecture

```
apps/web (React)  ──/api──▶  nginx  ──▶  apps/api (Express)
                                            │
                    routes ─▶ services ─▶ ports (interfaces)
                                            │
             ┌──────────────────────────────┼──────────────────────────┐
     FakeStoreProductCatalog      JsonFileFeaturedProducts      SmtpEnquiryNotifier
        (fakestoreapi.com)         (data/featured.json)        (Mailpit / SES / any SMTP)
```

The backend uses ports and adapters. Routes and services depend only on three interfaces in `apps/api/src/domain/ports.ts`:

- `ProductCatalog`: categories, products, search.
- `FeaturedProducts`: the hand-picked "top rated" product IDs.
- `EnquiryNotifier`: delivers an enquiry to sales.

`apps/api/src/container.ts` is the only file that knows which adapters are in use.

The client never calls Fake Store. All product data, including images, goes through the API (`/api/v1/products/:id/image` streams the image).

### How to change things

| Change                        | What to do                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Featured / top rated products | Edit `apps/api/data/featured.json` (no rebuild needed with Docker; it is mounted).                                      |
| Product data source           | Add an adapter implementing `ProductCatalog`, add a `PRODUCT_SOURCE` value in `config.ts` and a case in `container.ts`. |
| Email provider                | Point `SMTP_*` at the provider (e.g. SES SMTP), or add an adapter implementing `EnquiryNotifier`.                       |
| Look and feel                 | Edit the design tokens in `apps/web/src/styles/theme.css`. Components only use these tokens.                            |
| Icons                         | Edit the map in `apps/web/src/components/ui/Icon.tsx`.                                                                  |

### API

All responses are `{ "data": ... }` or `{ "error": { "code", "message", "details?" } }`.

| Method | Path                                | Purpose                                                   |
| ------ | ----------------------------------- | --------------------------------------------------------- |
| GET    | `/api/health`                       | Health check for Docker / load balancers                  |
| GET    | `/api/v1/categories`                | All categories                                            |
| GET    | `/api/v1/categories/:slug/products` | `{ category, topRated, more }`                            |
| GET    | `/api/v1/products/featured`         | The 5 curated products, in order                          |
| GET    | `/api/v1/products?q=term`           | Search                                                    |
| GET    | `/api/v1/products/:id`              | Product details                                           |
| GET    | `/api/v1/products/:id/image`        | Product image, proxied                                    |
| POST   | `/api/v1/enquiries`                 | Submit an enquiry; `201` on success, `502` if email fails |

## Assumptions

The acceptance criteria leave gaps. These are the decisions made to fill them.

1. **"Top rated" is curated, not computed.** "I have chosen 5 products" means the entrepreneur picks them. They live in `featured.json`, in display order. Unknown IDs are logged and skipped.
2. **Category top rated** = curated products in that category, topped up to at least 3 with the highest rated (by Fake Store rating) products. The rest of the category is shown below as "More in ...".
3. **Search** is a case-insensitive substring match on title, description and category name. It runs on button click or Enter, not while typing. An empty term is not submitted (button disabled; API returns 400). The term is in the URL so results can be shared and the back button works.
4. **Enquiry form** asks for name and email (required), phone and message (optional). An empty message gets a sensible default. The server looks up the product itself and ignores any product details from the client.
5. **"Thank you" only after real delivery.** If the email cannot be sent the customer sees an error and can retry, rather than a false success.
6. **Enquiries are not stored**, only emailed. A database is the obvious next step (an `EnquiryRepository` port).
7. **Spam protection** is a honeypot field plus rate limiting (10 enquiries per 15 minutes per IP). No CAPTCHA, as it would need an account.
8. **Prices** are stored in minor units (cents) and shown in USD, which is what Fake Store provides.
9. **Product images** count as product data, so they are proxied through the API too.
10. **The enquiry form is its own page** (`/products/:id/enquire`) rather than a modal, so it can be linked to and works with the back button.

## Dropped or simplified

| Item                   | Decision and reason                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| SF Pro font            | My starter design system used SF Pro. A system font stack gives Apple devices their native font and uses a system fallback elsewhere.           |
| Nucleo icons           | My starter design system used Nucleo. I used Lucide (MIT) at 1px stroke behind a single `Icon` component so the reviewer needs no icon licence. |
| Enquiry persistence    | See assumption 6.                                                                                                                               |
| Infrastructure as code | Not included; see "Path to AWS".                                                                                                                |

## How it grows

The ports allow a new catalogue source, featured-products store or email provider to be wired in
at the composition root. The design tokens and presentational components provide a starting
point for the agency's redesign. The shared schemas keep the web and API contracts aligned.

### Path to AWS

The existing containers can be used as the starting point for an AWS deployment.

- **API**: push the image to ECR and run on ECS Fargate (or App Runner) behind an ALB, using `/api/health` as the target health check. Restrict API ingress to the trusted proxy before enabling `TRUST_PROXY`.
- **Web**: either run the nginx container the same way, or upload the static build to S3 behind CloudFront with `/api/*` routed to the ALB.
- **Email**: Amazon SES via its SMTP interface. Set `SMTP_HOST`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS` from Secrets Manager.
- **Config**: environment variables (validated at startup) from ECS task definitions and Secrets Manager.
- **Logs**: structured JSON (pino) goes to CloudWatch with request IDs.

## Next day

1. Add browser coverage for recovering from an email failure and include the browser suite in CI.
2. Persist enquiries so sales can recover and retry delivery after an SMTP outage.
3. Configure a shared rate-limit store before running multiple API replicas.

## Repository layout

```
apps/
  api/            Express API (ports, adapters, services, routes)
  web/            React app (pages, components, design tokens)
packages/
  shared/         Zod schemas and types shared by both apps
e2e/              Browser acceptance tests and their Docker fixtures
docs/
  adr/            Architecture decision records
  plan.md         Feature and verification plan
AI_USAGE.md       How AI was used to plan and build this
CONTEXT.md        Domain glossary
AGENTS.md         Instructions for AI coding agents working in this repo
```

## Time spent

About 1 hour 30 minutes total. I did not track planning, building, testing and reviewing separately.
