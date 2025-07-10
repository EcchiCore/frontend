# Multi-stage build สำหรับ Railway
# Stage 1: Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# คัดลอกไฟล์ package.json และ bun.lockb
COPY package.json bun.lockb* ./

# ติดตั้ง dependencies รวมทั้ง devDependencies
RUN bun install --frozen-lockfile

# คัดลอก source code
COPY . .

# Build Next.js application
RUN bun run build

# Stage 2: Production stage
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# สร้างผู้ใช้ที่ไม่ใช่ root
RUN addgroup -S -g 1001 bunjs && \
    adduser -S -u 1001 -G bunjs nextjs

# คัดลอกเฉพาะไฟล์ที่จำเป็นจาก build stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lockb* ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# ติดตั้งเฉพาะ production dependencies
RUN bun install --frozen-lockfile --production

# ตั้งค่าการเป็นเจ้าของไฟล์
RUN chown -R nextjs:bunjs /app

# เปลี่ยนเป็นผู้ใช้ที่ไม่ใช่ root
USER nextjs

# เปิดพอร์ต
EXPOSE 3000

# ตั้งค่าตัวแปรสภาพแวดล้อม
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# รันแอปพลิเคชัน
CMD ["bun", "server.js"]