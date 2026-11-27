# How AI was used

## Tools

- **Claude Code** (Claude Opus) in the terminal for planning, implementation, browser checks and documentation.
- **Codex** (GPT-6.2) to review the project against the brief and implement and verify end-to-end tests in a follow-up pass.
- I used a grilling skill to stress-test the plan and `chrome-devtools-axi` to check the UI in a real browser.

## Workflow

1. **Grill the feature.** I ask the AI to interview me one decision at a time and recommend a choice for each open question. We go through requirements, edge cases and trade-offs before I approve the plan. The [README assumptions](README.md#assumptions) record the decisions from that process.
2. **Break the plan into tickets.** A larger feature typically becomes about four tickets. Each ticket specifies the outcome, decisions it depends on and how to verify it.
3. **Implement one ticket at a time.** I give the AI the context it needs for the current ticket. This keeps the context focused and gives me a checkpoint to review the result before moving on.

An example of how I would split the enquiry feature is the form and shared validation, the API endpoint, email delivery through SMTP, and browser verification that submitting the form sends an email to Mailpit.

## Key moments

1. **Agreed the plan before building.** I asked Claude Code to interview me one decision at a time. One decision was to let the entrepreneur curate the five featured products, then use ratings to fill the remaining top-rated slots on category pages.
2. **Rechecked the project against the challenge.** I asked Codex to use the PDF as the rubric. The review confirmed that the five customer flows were implemented and surfaced the gap in repeatable tests.
3. **Set the testing scope and approved the dependency.** I asked Codex to plan and implement browser tests for the five acceptance criteria. Codex ran a draft suite with an isolated runner, and I approved Playwright as a dev dependency so reviewers could run the suite with `pnpm test:e2e`.
4. **Checked what a reviewer would receive.** I asked for a second review after the tests passed. It confirmed the local results and identified that the tests and an open pull request still needed to be included in the GitHub submission.

## Decisions

| Area            | Decision                                                     | Rationale                                                                  |
| --------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Stack           | React + TypeScript, Node.js + Express                        | One language, shared schemas, one-command setup.                           |
| Package manager | pnpm workspaces                                              | Fast, strict dependency resolution, first-class monorepo support.          |
| Architecture    | Ports and adapters for data source, featured list and email  | Each is expected to change; changes stay in one file.                      |
| Top rated       | Curated list in `featured.json`                              | The criteria say the entrepreneur chooses them.                            |
| Search          | Server-side, case-insensitive, on submit                     | Fake Store has no search; keeps the source swappable.                      |
| Email           | Nodemailer over SMTP, Mailpit locally                        | Provider-neutral, free, visible to the reviewer, SES-ready.                |
| Enquiry form    | Own page, shared Zod schema, honeypot, rate limit            | Linkable, consistent validation, basic abuse protection without accounts.  |
| Design system   | My tokens (SF Pro, 12-24px scale, greys), solid colours only | Look and feel swappable from one file.                                     |
| Icons and font  | Lucide in place of Nucleo; system stack for SF Pro           | Licensing: no paid dependency, SF Pro cannot be self-hosted.               |
| Tests           | Playwright browser tests in the follow-up pass               | Covers all five acceptance criteria, including email delivered to Mailpit. |
| Infrastructure  | No infrastructure as code; documented AWS path               | Containers are AWS-ready; untested IaC adds risk.                          |
| Docs for agents | `AGENTS.md`                                                  | Tool-neutral instructions so any agent follows the same rules.             |

## Guardrails that keep AI output consistent

- [`AGENTS.md`](AGENTS.md) states the architecture and UI rules for any agent.
- Strict TypeScript (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`) and ESLint (including React hooks rules).
- One Zod schema per contract in `packages/shared`, used by both apps.
- Tailwind theme cleared of defaults, so only design tokens exist.

## What the AI got wrong

Codex's first draft of the test catalogue fixture referenced `Buffer` without importing it. The repository's ESLint check flagged the reference. Codex added an explicit import from `node:buffer` and reran lint and all five browser tests. Both checks passed.
