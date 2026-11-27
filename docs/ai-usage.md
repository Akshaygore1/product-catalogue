# How AI was used

## Tools

- **Claude Code** (Claude Opus) in the terminal for planning, implementation, browser checks and documentation.
- **Skills**: a "grilling" skill to stress-test the plan before building, and a browser automation skill (`chrome-devtools-axi`) to check the UI in a real browser.

## Workflow

1. **Plan before code.** The AI was asked to interview me one decision at a time, with a recommendation for each, until the plan was agreed. Nothing was built until I confirmed. This produced the decisions below and the assumptions in the README.
2. **Build in layers.** Shared contracts first, then the API (verified with `curl` against the live Fake Store API), then the web app, then Docker.
3. **Verify in the real thing.** Typecheck, lint and production builds after each layer; the full stack run with `docker compose up`; the enquiry journey clicked through in a browser and the email checked in Mailpit; screenshots reviewed at desktop and mobile widths.
4. **Review.** Every file reviewed by me (see below).

## Decisions

| Area            | Decision                                                     | Rationale                                                                 |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Stack           | React + TypeScript, Node.js + Express                        | One language, shared schemas, one-command setup.                          |
| Package manager | pnpm workspaces                                              | Fast, strict dependency resolution, first-class monorepo support.         |
| Architecture    | Ports and adapters for data source, featured list and email  | Each is expected to change; changes stay in one file.                     |
| Top rated       | Curated list in `featured.json`                              | The criteria say the entrepreneur chooses them.                           |
| Search          | Server-side, case-insensitive, on submit                     | Fake Store has no search; keeps the source swappable.                     |
| Email           | Nodemailer over SMTP, Mailpit locally                        | Provider-neutral, free, visible to the reviewer, SES-ready.               |
| Enquiry form    | Own page, shared Zod schema, honeypot, rate limit            | Linkable, consistent validation, basic abuse protection without accounts. |
| Design system   | My tokens (SF Pro, 12-24px scale, greys), solid colours only | Look and feel swappable from one file.                                    |
| Icons and font  | Lucide in place of Nucleo; system stack for SF Pro           | Licensing: no paid dependency, SF Pro cannot be self-hosted.              |
| Tests           | Not in this iteration                                        | Time-box; architecture keeps them cheap to add.                           |
| Infrastructure  | No infrastructure as code; documented AWS path               | Containers are AWS-ready; untested IaC adds risk.                         |
| Docs for agents | `AGENTS.md`                                                  | Tool-neutral instructions so any agent follows the same rules.            |

## Guardrails that keep AI output consistent

- `AGENTS.md` states the architecture and UI rules for any agent.
- Strict TypeScript (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`) and ESLint (including React hooks rules).
- One Zod schema per contract in `packages/shared`, used by both apps.
- Tailwind theme cleared of defaults, so only design tokens exist.

## Review

_To be completed: what I checked, what I changed, and why._
