# syntax=docker/dockerfile:1
# Build context: repository root (needed for the pnpm workspace).

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @catalogue/api...
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @catalogue/api build

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --prod --filter @catalogue/api... \
  && pnpm store prune
COPY --from=build /app/apps/api/dist apps/api/dist
COPY apps/api/data apps/api/data
WORKDIR /app/apps/api
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "--enable-source-maps", "dist/server.js"]
