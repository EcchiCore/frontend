// src/utils/metadataUtils.ts
import type { Metadata } from 'next';
import { supportedLocales, defaultLocale, type Locale, siteUrl } from './localeUtils';

export function generateLanguageAlternates(
  contentPath: string = '',
  baseUrl?: string
): Record<string, string> {
  const url = baseUrl || siteUrl;
  const alternates: Record<string, string> = {};

  supportedLocales.forEach(locale => {
    const path = contentPath.includes('?')
      ? contentPath.split('?')[0]
      : contentPath;

    if (locale === defaultLocale) {
      alternates[locale] = `${url}/${path}`.replace(/\/$/, '');
    } else {
      alternates[locale] = `${url}/${locale}/${path}`.replace(/\/$/, '');
    }

    if (contentPath.includes('?')) {
      const params = contentPath.split('?')[1];
      alternates[locale] += `?${params}`;
    }
  });

  alternates['x-default'] = `${url}/${contentPath.split('?')[0]}`.replace(/\/$/, '');
  if (contentPath.includes('?')) {
    alternates['x-default'] += `?${contentPath.split('?')[1]}`;
  }

  return alternates;
}

export function generateCanonicalUrl(contentPath: string = '', baseUrl?: string): string {
  const url = baseUrl || siteUrl;
  const path = contentPath.split('?')[0];
  return `${url}/${path}`.replace(/\/$/, '') + (contentPath.includes('?') ? `?${contentPath.split('?')[1]}` : '');
}

/**
 * Generate base metadata for any page
 * @param options - Metadata options
 * @returns Metadata object
 */
export function generatePageMetadata(options: {
  title: string;
  description: string;
  keywords?: string[];
  locale: Locale;
  contentPath?: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
}): Metadata {
  const {
    title,
    description,
    keywords = [],
    locale,
    contentPath = '',
    images = [{ url: '/favicon.ico', width: 1200, height: 630, alt: 'ChanomHub Logo' }],
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
    section
  } = options;

  const canonicalUrl = generateCanonicalUrl(contentPath);
  const languageAlternates = generateLanguageAlternates(contentPath);
  const metadataBase = new URL(siteUrl);

  // Base metadata
  const metadata: Metadata = {
    metadataBase,
    title,
    description,
    keywords,
    robots:
      locale === defaultLocale
        ? { index: true, follow: true }
        : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'ChanomHub',
      locale,
      type,
      images: images.map(img => ({
        url: img.url,
        width: img.width,
        height: img.height,
        alt: img.alt
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map(img => img.url),
    },
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
  };

  // Add article-specific metadata
  if (type === 'article') {
    const articleData: any = {};

    if (publishedTime) articleData.publishedTime = publishedTime;
    if (modifiedTime) articleData.modifiedTime = modifiedTime;
    if (authors && authors.length > 0) articleData.authors = authors;
    if (section) articleData.section = section;

    metadata.openGraph = {
      ...metadata.openGraph,
      ...articleData,
    };
  }

  return metadata;
}

/**
 * Generate structured data for articles
 * @param options - Article options
 * @returns JSON-LD structured data
 */
export function generateArticleStructuredData(options: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  authors?: string[];
  images?: string[];
  locale: Locale;
}) {
  const {
    title,
    description,
    url,
    datePublished,
    dateModified,
    authors = ['ChanomHub'],
    images = [`${siteUrl}/favicon.ico`],
    locale
  } = options;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": url,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": authors.map(author => ({
      "@type": "Person",
      "name": author
    })),
    "publisher": {
      "@type": "Organization",
      "name": "ChanomHub",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/favicon.ico`
      }
    },
    "image": images,
    "inLanguage": locale,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };
}

/**
 * Generate structured data for website
 * @param locale - Current locale
 * @returns JSON-LD structured data
 */
export function generateWebsiteStructuredData(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ChanomHub",
    "url": siteUrl,
    "description": "Your ultimate destination for adult gaming content",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/${locale}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "inLanguage": supportedLocales,
    "availableLanguage": supportedLocales.map(lang => ({
      "@type": "Language",
      "name": lang === 'en' ? 'English' : 'Thai',
      "alternateName": lang
    }))
  };
}