# 5. Design tokens with Tailwind CSS, no component library

Status: accepted

## Context

Creative work is in progress and will replace the look and feel. I started with my own design system. It uses SF Pro (regular and medium), sizes 12, 13 (base), 14, 16, 18 and 24px, five greys, Nucleo icons at 1px stroke and solid colours.

## Decision

- All tokens are defined once in `apps/web/src/styles/theme.css` using Tailwind v4 `@theme`. Tailwind's default fonts, sizes, weights and colours are cleared, so only design system values can be used.
- One accent colour (`#1F3A5F`) for primary actions and one danger colour (`#B42318`) for errors were added, as the palette had none.
- Presentational components (`ProductCard`, `Button`, `EnquiryForm`) are separate from pages that fetch data.
- No component library such as MUI, which would impose its own visual style.
- Use the system font stack for native rendering and avoid distributing a font file.
- Icons go through one `Icon` component. Lucide (MIT) stands in for Nucleo, which needs a paid licence.

## Consequences

- A rebrand is mostly a token change. Off-system classes such as `text-sm` or `bg-red-500` generate no CSS, so they are caught in review.
- Swapping in Nucleo is a change to one file.
