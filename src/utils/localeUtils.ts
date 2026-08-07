// src/utils/localeUtils.ts
import { getSiteUrl } from './siteUtils';

export const supportedLocales = ['en', 'th', 'es'] as const;
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
    title: 'Free H-Games & Adult Games Download (18+) | ChanomHub',
    description:
      'Download free adult games and H-games for PC, Android & browser. Daily updates on adult game downloads, translations, mods, and 18+ gaming community.',
    keywords: [
      'Free adult games',
      'H-games download',
      'Adult game downloads',
      'NSFW games',
      '18+ games',
      'Adult gaming community',
      'Game translations',
      'Game mods',
      'Visual novels',
      'Erotic games',
    ],
    logo_alt: 'ChanomHub Logo',
  },
  th: {
    title: 'ChanomHub - ชุมชนเกมสำหรับผู้ใหญ่ ดาวน์โหลดเกมฟรี',
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
  es: {
    title: 'Descarga gratuita de juegos para adultos y H-Games (18+) | ChanomHub',
    description:
      'Descarga juegos para adultos y H-Games gratuitos para PC, Android y navegador. Actualizaciones diarias sobre descargas de juegos, traducciones, mods y comunidad de juegos 18+.',
    keywords: [
      'Juegos gratis para adultos',
      'Descargar H-games',
      'Descargas de juegos para adultos',
      'Juegos NSFW',
      'Juegos 18+',
      'Comunidad de juegos para adultos',
      'Traducciones de juegos',
      'Mods de juegos',
      'Novelas visuales',
      'Juegos eróticos',
    ],
    logo_alt: 'Logo de ChanomHub',
  },
};
// -----------------------------------------