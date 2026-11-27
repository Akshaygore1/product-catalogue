# Product catalogue plan

Reconstructed for submission from the README assumptions, architecture decisions and review
sessions. The initial Claude Code planning transcript was unavailable during submission prep.

## Scope

Build a React and TypeScript web app backed by a Node.js and Express API. Use Fake Store for
product data and Mailpit for local email. A reviewer should be able to start the stack with
Docker Compose and submit an enquiry without setting up an account.

## Build order and verification

1. **Set up the catalogue API.** Define shared schemas and the catalogue, featured-products
   and enquiry-notifier ports. Wire the selected adapters in the composition root. Serve product
   images through the API and keep the browser on the same origin in Docker.
2. **Build browsing and search.** Show the five curated products in order on the home page.
   In a category, show its curated products, fill up to three slots with rated products and
   show the remainder underneath. Search title, description and category on submit. Verify that
   clicking a tile opens the details and loads the proxied image.
3. **Build the enquiry flow.** Share form validation between the UI and API, look up product
   details on the server, and send the enquiry through SMTP. Verify the sales email in Mailpit
   and show the thank-you screen after SMTP accepts the message.
4. **Review and verify.** Test each customer flow against a fixed catalogue and exercise service
   rules and HTTP failures independently. Follow the README from a fresh checkout. Document the
   assumptions, decisions, time and AI workflow, then leave the feature PR open for assessment.

See the [README assumptions](../README.md#assumptions) and [architecture decisions](adr) for the
trade-offs behind this plan.
