# ใช้ Bun image Alpine
FROM oven/bun:1-alpine

# ตั้งค่าไดเร็กทอรีทำงาน
WORKDIR /app

# สร้างผู้ใช้ที่ไม่ใช่ root สำหรับความปลอดภัย
RUN addgroup -S -g 1001 bunjs && \
    adduser -S -u 1001 -G bunjs nextjs

# คัดลอกไฟล์ standalone ที่ build แล้วจากเครื่องของคุณ
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

# ตั้งค่าการเป็นเจ้าของไฟล์ให้กับผู้ใช้ที่ไม่ใช่ root
RUN chown -R nextjs:bunjs /app

# เปลี่ยนเป็นผู้ใช้ที่ไม่ใช่ root
USER nextjs

# เปิดพอร์ต 3000
EXPOSE 3000

# ตั้งค่าตัวแปรสภาพแวดล้อม
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

# รันแอปพลิเคชันด้วย Bun
CMD ["bun", "server.js"]