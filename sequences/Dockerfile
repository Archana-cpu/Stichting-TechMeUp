FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache wget
WORKDIR /app

# ============================================================================
# DEPENDENCIES
# ============================================================================

FROM base AS deps
# Copy workspace configuration
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY pnpm-lock.yaml ./

# Copy all package.json files
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
COPY packages/auth/package.json packages/auth/
COPY packages/i18n/package.json packages/i18n/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/

# Install all dependencies (including workspace dependencies)
RUN pnpm install --frozen-lockfile

# ============================================================================
# BUILDER
# ============================================================================

FROM base AS builder
# Copy all installed dependencies (including workspace node_modules)
COPY --from=deps /app ./

# Copy source code (will overwrite package.json files but keep node_modules)
COPY packages ./packages
COPY apps/web ./apps/web
COPY tsconfig.json ./

# Ensure public directory exists
RUN mkdir -p /app/apps/web/public

# Generate Prisma Client and build
RUN pnpm db:generate
RUN pnpm build --filter=@seq/web

# ============================================================================
# RUNNER (Production)
# ============================================================================

FROM base AS runner
ENV NODE_ENV=production
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

# ============================================================================
# DEVELOPMENT
# ============================================================================

FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm db:generate
EXPOSE 3000
ENV PORT=3000
CMD ["pnpm", "dev:web"]
