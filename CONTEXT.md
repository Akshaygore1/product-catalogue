# Domain glossary

Shared language for the catalogue. Use these terms in code, docs and conversation.

| Term                 | Meaning                                                                                                                                      | In code                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **Product**          | Something the business sells. Source-agnostic: string ID, price in minor units, optional rating.                                             | `Product` (`packages/shared`)    |
| **Category**         | A grouping of products, addressed by a URL-safe slug (e.g. `mens-clothing`).                                                                 | `Category`                       |
| **Product source**   | Where product data comes from (Fake Store today). Hidden behind a port.                                                                      | `ProductCatalog` port            |
| **Featured product** | A product the entrepreneur has hand-picked as "top rated". Five are shown on the home page, in order.                                        | `FeaturedProducts` port          |
| **Top rated**        | On the home page: the featured products. On a category page: featured products in that category, topped up to at least 3 by customer rating. | `CatalogueService`               |
| **More products**    | Every product in a category that is not top rated.                                                                                           | `CategoryPage.more`              |
| **Rating**           | Customer review score from the product source (average and count). Not the same as "top rated".                                              | `Rating`                         |
| **Search term**      | Text a customer submits; matches products whose title, description or category contains it.                                                  | `matchesSearchTerm`              |
| **Enquiry**          | A customer's request to be contacted about one product, with their contact details and a message.                                            | `EnquiryInput`, `Enquiry`        |
| **Sales inbox**      | The email address that receives enquiries.                                                                                                   | `SALES_INBOX`, `EnquiryNotifier` |
| **Design tokens**    | The named fonts, sizes and colours that define the look and feel.                                                                            | `apps/web/src/styles/theme.css`  |
