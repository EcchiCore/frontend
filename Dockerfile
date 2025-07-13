# Stage 1: Dependencies
FROM oven/bun:alpine AS deps
WORKDIR /app
COPY package.json  ./
RUN bun install --frozen-lockfile

# Stage 2: Building the App
FROM oven/bun:alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Stage 3: Final Image
FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Copy necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/i18n/request.ts ./src/i18n/request.ts
COPY --from=builder /app/src/app/[locale]/lib/imageLoader.ts ./src/app/[locale]/lib/imageLoader.ts

# Debug: List copied files
RUN ls -la /app

EXPOSE 8080
CMD ["node", "server.js"]