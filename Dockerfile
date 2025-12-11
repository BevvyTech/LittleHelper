# Multi-stage Dockerfile for LittleHelper

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy source files
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build all packages
RUN pnpm --recursive run build

# Stage 3: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 littlehelper

# Copy built files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/ui/dist ./packages/ui/dist
COPY --from=builder /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p /app/uploads && chown littlehelper:nodejs /app/uploads

USER littlehelper

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "apps/api/dist/server/server.js"]
