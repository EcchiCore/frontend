// src/utils/metadataUtils.ts
import type { Metadata } from 'next';
import {
  supportedLocales,
  siteUrl,
  defaultLocale,
  type Locale
} from './localeUtils';

/**
 * Generate language alternates for any content path
 * @param contentPath - The content path without locale (e.g., 'articles/some-slug' or 'articles/some-slug/translate?param=value')
 * @returns Object with language alternates
 */
export function generateLanguageAlternates(
  contentPath: string = ''
): Record<string, string> {
  const alternates: Record<string, string> = {};

  // Generate alternates for each supported locale
  supportedLocales.forEach(locale => {
    if (contentPath) {
      // Handle paths with query parameters
      if (contentPath.includes('?')) {
        const [path, params] = contentPath.split('?');
        alternates[locale] = `${siteUrl}/${locale}/${path}?${params}`;
      } else {
        alternates[locale] = `${siteUrl}/${locale}/${contentPath}`;
      }
    } else {
      alternates[locale] = `${siteUrl}/${locale}`;
    }
  });

  // Add x-default
  if (contentPath) {
    if (contentPath.includes('?')) {
      const [path, params] = contentPath.split('?');
      alternates['x-default'] = `${siteUrl}/${defaultLocale}/${path}?${params}`;
    } else {
      alternates['x-default'] = `${siteUrl}/${defaultLocale}/${contentPath}`;
    }
  } else {
    alternates['x-default'] = `${siteUrl}/${defaultLocale}`;
  }

  return alternates;
}

/**
 * Generate canonical URL for content
 * @param contentPath - The content path without locale (including query params if any)
 * @returns Canonical URL string
 */
export function generateCanonicalUrl(
  contentPath: string = ''
): string {
  if (contentPath) {
    if (contentPath.includes('?')) {
      const [path, params] = contentPath.split('?');
      return `${siteUrl}/${defaultLocale}/${path}?${params}`;
    }
    return `${siteUrl}/${defaultLocale}/${contentPath}`;
  }
  return `${siteUrl}/${defaultLocale}`;
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
    robots: { index: true, follow: true },
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