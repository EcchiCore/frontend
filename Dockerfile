# Stage 1: Build stage (ใช้ Node.js หรือ Bun เต็มตัว)
FROM oven/bun:1 AS builder

WORKDIR /app

# คัดลอก dependencies และติดตั้ง
COPY package.json ./
COPY .env ./
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
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./

# คัดลอก node_modules สำหรับ bun run start
COPY --from=builder /app/node_modules ./node_modules

# ตั้งค่าการเป็นเจ้าของไฟล์ให้กับผู้ใช้ที่ไม่ใช่ root
RUN chown -R nextjs:bunjs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

# เรียกใช้ bun run start
CMD ["bun", "run", "start"]