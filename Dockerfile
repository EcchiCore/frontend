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

# Stage 3: Production stage
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# สร้างผู้ใช้ที่ไม่ใช่ root
RUN addgroup --system --gid 1001 bunjs && \
    adduser --system --uid 1001 nextjs

# คัดลอกไฟล์ที่จำเป็น
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# คัดลอก .next folder
COPY --from=builder --chown=nextjs:bunjs /app/.next ./.next

# ติดตั้ง production dependencies เท่านั้น
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# คัดลอก environment file (ถ้ามี)
COPY --from=builder /app/.env* ./

# ตั้งค่าการเป็นเจ้าของไฟล์
RUN chown -R nextjs:bunjs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

# เรียกใช้ Next.js ผ่าน bun
CMD ["bun", "run", "start"]