// lib/navigation.js
import { createNavigation } from 'next-intl/navigation';

// กำหนดภาษาที่รองรับ
export const locales = ['en', 'th'] as const;

// กำหนดภาษาเริ่มต้น
export const defaultLocale = 'en';

// กำหนดว่าจะแสดง locale prefix เมื่อไหร่
// 'always' = แสดงเสมอ เช่น /en/games, /th/games
// 'as-needed' = แสดงเฉพาะที่ไม่ใช่ default locale
// 'never' = ไม่แสดง prefix (ใช้ subdomain หรือ domain แทน)
export const localePrefix = 'always';

// สร้าง navigation utilities
export const { Link, redirect, usePathname, useRouter } =
  createNavigation({
    locales,
    localePrefix,
    defaultLocale
  });

// Export เพิ่มเติมสำหรับใช้ใน component อื่นๆ
export type Locale = (typeof locales)[number];

// Helper function สำหรับสร้าง URL ที่ถูกต้อง
export function createLocalizedPath(path: string, locale: string) {
  // ลบ slash ซ้ำออก
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  if (localePrefix === 'always') {
    return `/${locale}/${cleanPath}`;
  } else if (localePrefix === 'as-needed' && locale !== defaultLocale) {
    return `/${locale}/${cleanPath}`;
  } else {
    return `/${cleanPath}`;
  }
}

// Helper function สำหรับตรวจสอบ locale ปัจจุบัน
export function getCurrentLocale(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  return defaultLocale;
}