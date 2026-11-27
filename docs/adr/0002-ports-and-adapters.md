# 2. Ports and adapters in the API

Status: accepted

## Context

The product data source, email provider and look and feel are all expected to change. The entrepreneur does not want a throwaway prototype.

## Decision

Services depend only on interfaces (`ProductCatalog`, `FeaturedProducts`, `EnquiryNotifier`) in `domain/ports.ts`. Adapters implement them. A single composition root (`container.ts`) chooses adapters from validated environment config. No DI framework; constructor injection only.

Our own domain types (`Product`, `Category`) are the contract. Upstream data is validated and mapped at the adapter boundary, so the Fake Store shape never leaks to routes or the client. IDs are strings and prices are integers in minor units, so other sources fit without changes.

## Consequences

- Replacing Fake Store, adding a CMS for featured products, or switching to SES is one new file plus one line in `container.ts`.
- Services can be tested against in-memory adapters without network access.
- A small amount of extra indirection compared with calling Fake Store from route handlers.
