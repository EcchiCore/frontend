// src/lib/requestUtils.ts
import { headers } from 'next/headers';

/**
 * ดึง URL จริงจาก request (รองรับ Vercel, Cloudflare, Custom Domain)
 * ใช้ได้ใน Server Components, Route Handlers, Middleware
 */
export const getRequestUrl = async (): Promise<string> => {
  try {
    // ต้อง await เพราะ headers() คืน Promise
    const headersList = await headers();

    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') || 'https';

    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // headers() จะ error ถ้าเรีย โค้ดรันใน context ที่ไม่มี request
    // เช่น เรียกจากไฟล์ utils ธรรมดา → ปล่อยให้ fallback
  }

  // Vercel Production Domain (Vercel ให้มาเอง)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // ใช้ env ที่คุณตั้งเอง (แนะนำให้ตั้งใน Vercel)
  if (process.env.PRODUCTION_URL) {
    return `https://${process.env.PRODUCTION_URL}`;
  }

  // Fallback สุดท้าย
  return 'https://chanomhub.com';
};