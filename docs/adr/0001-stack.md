# 1. React web client and Node.js (Express) API in a pnpm monorepo

Status: accepted

## Context

The brief allows one client (React web, iOS, Android) and one backend (Node.js, Laravel). The reviewer must run the solution in under 10 minutes, and the look and feel will change once creative work lands.

## Decision

React + TypeScript (Vite) for the client, Node.js + Express + TypeScript for the API, in a pnpm workspace with a `shared` package for Zod schemas and types.

## Consequences

- One command (`docker compose up`) runs everything; no simulator.
- One language end to end; the enquiry form and the API share a single validation schema.
- Express is the most widely known Node framework, which keeps onboarding cheap; its lack of structure is offset by the ports and adapters layout (ADR 2).
