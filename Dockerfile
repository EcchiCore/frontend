# Stage 1: Dependencies stage
FROM oven/bun:1 AS deps

WORKDIR /app

# คัดลอกไฟล์ dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Stage 2: Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# คัดลอก node_modules จาก deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# รับ environment variables จาก build args
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_IMGPROXY_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY

# กำหนดให้เป็น environment variables สำหรับ build time
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_IMGPROXY_URL=${NEXT_PUBLIC_IMGPROXY_URL}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ENV NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}

# Build application
RUN bun run build

# Stage 3: Production stage (standalone - ลดขนาด image จาก ~1GB → ~200MB)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# สร้างผู้ใช้ที่ไม่ใช่ root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# คัดลอก public assets
COPY --from=builder /app/public ./public

# คัดลอก standalone server (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# คัดลอก static files (ไม่รวมใน standalone โดย default)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# standalone output uses server.js directly
CMD ["node", "server.js"]