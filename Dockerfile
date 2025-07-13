# Stage 1: Dependencies
FROM oven/bun:alpine AS deps
WORKDIR /app
COPY package.json ./
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

# Copy necessary files from the build stage for standalone deployment
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Use node to run the standalone server.js instead of next start
CMD ["node", "server.js"]