# Stage 1: Build stage (ใช้ Node.js หรือ Bun เต็มตัว)
FROM oven/bun:1 AS builder

WORKDIR /app

# คัดลอก dependencies และติดตั้ง
COPY package.json ./
RUN bun install --frozen-lockfile

# คัดลอก source code และ build
COPY . .
RUN bun run build

# Stage 2: Production stage
FROM oven/bun:1-alpine

# สร้างผู้ใช้ที่ไม่ใช่ root
RUN addgroup -S -g 1001 bunjs && \
    adduser -S -u 1001 -G bunjs nextjs

WORKDIR /app

# คัดลอกไฟล์ที่จำเป็นจาก builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# ตั้งค่าการเป็นเจ้าของไฟล์ให้กับผู้ใช้ที่ไม่ใช่ root
RUN chown -R nextjs:bunjs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

# เรียกใช้ server.js (ต้องมีใน standalone build)
CMD ["bun", "server.js"]
