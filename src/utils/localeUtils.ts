// src/utils/localeUtils.ts
import { getSiteUrl } from './siteUtils';

export const supportedLocales = ['en', 'th'] as const;
export type Locale = (typeof supportedLocales)[number];
export const defaultLocale: Locale = 'en';

export const siteUrl = getSiteUrl(); // Dynamic!

export const getValidLocale = (l: string | undefined): Locale => {
  if (!l) return defaultLocale;
  return supportedLocales.includes(l as Locale) ? (l as Locale) : defaultLocale;
};

export const getLocaleFromPathname = (pathname: string): Locale => {
  const segments = pathname.split('/').filter(Boolean);
  const potentialLocale = segments[0];

  if (potentialLocale && supportedLocales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }
  return defaultLocale;
};

export const removeLocaleFromPathname = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (first && supportedLocales.includes(first as Locale)) {
    const rest = segments.slice(1);
    return '/' + (rest.length ? rest.join('/') : '');
  }
  return pathname || '/';
};

export const addLocaleToPathname = (pathname: string, locale: Locale): string => {
  const cleanPath = pathname === '/' ? '' : pathname.replace(/^\//, '');
  if (locale === defaultLocale) {
    return `/${cleanPath}`.replace(/\/$/, '') || '/';
  }
  return `/${locale}/${cleanPath}`.replace(/\/$/, '');
};

// ---------- เพิ่ม export เหล่านี้ ----------
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
      'ChanomHub - Your ultimate destination for adult gaming content. Discover free game downloads, translations, mods, and a vibrant community for gaming enthusiasts.',
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
      'ChanomHub - จุดหมายปลายทางสุดยอดสำหรับเนื้อหาเกมสำหรับผู้ใหญ่ ค้นพบการดาวน์โหลดเกมฟรี การแปล มอด และชุมชนที่มีชีวิตชีวา',
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
// -----------------------------------------