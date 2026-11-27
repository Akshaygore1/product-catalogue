# Agent instructions

Guidance for AI coding agents working in this repository. Read `README.md` for setup and `CONTEXT.md` for domain terms.

## Commands

- `pnpm install` - install using the pnpm version in `package.json`
- `pnpm dev` - API on :3000, web on :5173
- `pnpm typecheck && pnpm lint` - must pass before any change is done
- `pnpm test` - unit and API tests
- `pnpm format` - Prettier
- `docker compose up --build` - full stack with Mailpit

## Architecture rules

- **API layering**: `http/routes` -> `services` -> `domain/ports`. Routes and services never import adapters. Only `container.ts` wires adapters.
- **New data source or email provider**: implement the port in `adapters/`, add a config value in `config.ts`, add a case in `container.ts`. Do not change services or routes.
- **Validate at boundaries**: request input with Zod schemas from `@catalogue/shared`; upstream data with Zod in the adapter.
- **Shared contracts** live in `packages/shared`. Change a schema there, not in one app.
- **Errors**: throw `AppError` subclasses from `domain/errors.ts`. The error middleware formats every response as `{ error: { code, message } }`.
- **The client never calls external services**. All data, images included, goes through the API.
- **Config** comes only from environment variables validated in `config.ts`. Add new keys to `.env.example` and `docker-compose.yml` with a safe default.

## UI rules

- Use only design tokens from `apps/web/src/styles/theme.css`: font sizes `text-xs|base|md|lg|xl|2xl` (12/13/14/16/18/24px), weights `font-regular|medium`, colours `subtle|default|strong|selected|border|surface|accent|danger`.
- Solid colours only. No gradients.
- Icons only through `components/ui/Icon.tsx` (1px stroke).
- Pages fetch data with `catalogueQueries` (TanStack Query); components are presentational.
- Every data view handles loading (skeleton), error (retry) and empty states.
- Accessibility: labelled inputs, semantic elements, visible focus.

## Conventions

- TypeScript strict; no `any`. Type-only imports use `import type`.
- Do not use em dashes in docs or UI copy.
- Do not commit `.env` or secrets.
