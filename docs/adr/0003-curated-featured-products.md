# 3. "Top rated" products are curated, stored in a JSON file

Status: accepted

## Context

The acceptance criteria say "GIVEN I have chosen 5 products to be top rated". That is a human choice, not a computed ranking.

## Decision

The curated product IDs live in `apps/api/data/featured.json`, read through the `FeaturedProducts` port. The home page shows them in order. A category page shows the curated products in that category, topped up to at least 3 with the highest rated remaining products, then the rest.

## Consequences

- The entrepreneur can change featured products by editing one file, without a deploy when the file is mounted.
- A CMS or admin screen can replace the file later as a new adapter.
- Invalid IDs are skipped and logged rather than breaking the page.
