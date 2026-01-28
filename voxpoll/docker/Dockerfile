# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - MULTI-STAGE DOCKERFILE
# ══════════════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────────────
# Base Stage
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# ─────────────────────────────────────────────────────────────────────────────
# Dependencies Stage
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/validators/package.json ./packages/validators/
COPY packages/ui/package.json ./packages/ui/
COPY packages/algorithms/package.json ./packages/algorithms/
COPY packages/actions/package.json ./packages/actions/
COPY packages/config/package.json ./packages/config/
COPY packages/api/package.json ./packages/api/
COPY apps/web/package.json ./apps/web/
COPY apps/platform/package.json ./apps/platform/

RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────────────────────────────────────
# Builder Stage
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY --from=deps /app/apps/*/node_modules ./apps/*/node_modules

COPY . .

# Generate Drizzle Migrations
RUN pnpm --filter @voxpoll/database db:generate

# Build all packages
RUN pnpm turbo build

# ─────────────────────────────────────────────────────────────────────────────
# Web Application Runner
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS web

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]

# ─────────────────────────────────────────────────────────────────────────────
# Platform Admin Runner
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS platform

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/platform/public ./apps/platform/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/static ./apps/platform/.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/platform/server.js"]

# ─────────────────────────────────────────────────────────────────────────────
# API Server Runner
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS api

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

WORKDIR /app

# Copy built API and required packages
COPY --from=builder --chown=apiuser:nodejs /app/packages/api/dist ./packages/api/dist
COPY --from=builder --chown=apiuser:nodejs /app/packages/api/package.json ./packages/api/
COPY --from=builder --chown=apiuser:nodejs /app/packages/database ./packages/database
COPY --from=builder --chown=apiuser:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=apiuser:nodejs /app/packages/validators ./packages/validators
COPY --from=builder --chown=apiuser:nodejs /app/packages/algorithms ./packages/algorithms
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/package.json ./

USER apiuser

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "packages/api/dist/server.js"]
