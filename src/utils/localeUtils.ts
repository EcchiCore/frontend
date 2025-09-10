// src/utils/localeUtils.ts

// Supported locales - ให้แน่ใจว่าตรงกับ Intlayer config
export const supportedLocales = ['en', 'th'] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = 'en';

/**
 * Validates a given locale string or returns the default locale.
 * @param l - The locale string to validate (can be undefined).
 * @returns A valid Locale ('en' or 'th').
 */
export const getValidLocale = (l: string | undefined): Locale => {
  if (!l) return defaultLocale;
  return supportedLocales.includes(l as Locale) ? (l as Locale) : defaultLocale;
};



/**
 * Get locale from URL pathname
 * @param pathname - URL pathname
 * @returns Locale from pathname or default locale
 */
export const getLocaleFromPathname = (pathname: string): Locale => {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  return getValidLocale(potentialLocale);
};

/**
 * Remove locale from pathname
 * @param pathname - URL pathname with locale
 * @returns Pathname without locale prefix
 */
export const removeLocaleFromPathname = (pathname: string): string => {
  const segments = pathname.split('/');
  if (supportedLocales.includes(segments[1] as Locale)) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
};

/**
 * Add locale to pathname
 * @param pathname - URL pathname without locale
 * @param locale - Locale to add
 * @returns Pathname with locale prefix
 */
export const addLocaleToPathname = (pathname: string, locale: Locale): string => {
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return `/${locale}${cleanPath ? '/' + cleanPath : ''}`;
};

// Site configuration
export const siteUrl = process.env.FRONTEND || 'https://chanomhub.online';

// Metadata interface and default content
export interface MetaDict {
  title: string;
  description: string;
  keywords: string[];
  logo_alt: string;
}

export const defaultMetadataContent: Record<Locale, MetaDict> = {
  en: {
    title: 'ChanomHub',
    description:
      'ChanomHub - Your ultimate destination for adult gaming content. Discover free game downloads, translations, mods, and a vibrant community for gaming enthusiasts. Explore a wide range of indie and niche games tailored for mature audiences.',
    keywords: [
      'Adult games',
      'Free game downloads',
      'Game translations',
      'Game mods',
      'Erotic games',
      'Indie games',
      'Mature gaming',
      'Gaming community',
      'Visual novels',
      'NSFW games',
    ],
    logo_alt: 'ChanomHub Logo',
  },
  th: {
    title: 'ChanomHub - ศูนย์รวมเกมสำหรับผู้ใหญ่',
    description:
      'ChanomHub - จุดหมายปลายทางสุดยอดสำหรับเนื้อหาเกมสำหรับผู้ใหญ่ ค้นพบการดาวน์โหลดเกมฟรี การแปล มอด และชุมชนที่มีชีวิตชีวาสำหรับผู้ที่ชื่นชอบเกม สำรวจเกมอินดี้และเฉพาะกลุ่มที่หลากหลายสำหรับผู้ชมผู้ใหญ่',
    keywords: [
      'เกมผู้ใหญ่',
      'ดาวน์โหลดเกมฟรี',
      'แปลเกม',
      'มอดเกม',
      'เกมอีโรติก',
      'เกมอินดี้',
      'เกมผู้ใหญ่',
      'ชุมชนเกม',
      'วิชวลโนเวล',
      'เกม NSFW',
    ],
    logo_alt: 'โลโก้ ChanomHub',
  },
};