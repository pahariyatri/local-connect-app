# syntax=docker/dockerfile:1
# Production image for the Next.js frontend (standalone output).
# Build:  docker build -t local-connect-frontend .
# Run:    docker run -p 3000:3000 local-connect-frontend
# Override for staging/local: --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
# Enable GTM tracking:         --build-arg NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
#   (must be passed at BUILD time — see the ARG below for why)

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Dependencies (cached unless package*.json change) ---
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# --- Builder ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are baked in at build time. Defaults to the live API —
# override with --build-arg for staging/local image builds.
ARG NEXT_PUBLIC_API_BASE_URL=https://api.pahariyatri.com
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
# 'otp' | 'pin' — see utils/constants.ts. Defaults to 'otp' (unchanged
# behavior) unless explicitly overridden at build time.
ARG NEXT_PUBLIC_AUTH_MODE=otp
ENV NEXT_PUBLIC_AUTH_MODE=$NEXT_PUBLIC_AUTH_MODE
# GTM container ID for portal tracking (see lib/analytics.ts, app/layout.tsx).
# No default — GTM stays off unless explicitly passed. NEXT_PUBLIC_* values
# are compiled into the client bundle here, at build time; setting this on
# the running container instead (docker run -e ...) has no effect, because
# the bundle copied into the runner stage below has already been built.
ARG NEXT_PUBLIC_GTM_ID=""
ENV NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runner (minimal standalone server) ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
