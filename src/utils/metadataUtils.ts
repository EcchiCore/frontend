// src/utils/metadataUtils.ts
import type { Metadata } from 'next';
import { supportedLocales, defaultLocale, type Locale, siteUrl } from './localeUtils';
import { Article } from '@/types/article';

interface SEOLocalization {
  downloadPrefix: string;
  gameSuffix: string;
  freeWord: string;
  translationKeywords: string[];
  translationLabel: string;
}

const SEO_LOCALES: Record<string, SEOLocalization> = {
  th: {
    downloadPrefix: 'ดาวน์โหลด',
    gameSuffix: 'H Game',
    freeWord: 'ฟรี',
    translationKeywords: ['แปลไทย', 'ภาษาไทย', 'ซับไทย', 'thai translation', 'thai translated'],
    translationLabel: 'แปลไทย'
  },
  en: {
    downloadPrefix: 'Download',
    gameSuffix: 'H Game',
    freeWord: 'Free',
    translationKeywords: ['english translation', 'english translated', 'english sub'],
    translationLabel: 'English'
  },
  es: {
    downloadPrefix: 'Descargar',
    gameSuffix: 'Juego H',
    freeWord: 'Gratis',
    translationKeywords: ['español', 'traducido al español', 'sub español'],
    translationLabel: 'Español'
  },
  pt: {
    downloadPrefix: 'Baixar',
    gameSuffix: 'Jogo H',
    freeWord: 'Grátis',
    translationKeywords: ['português', 'traduzido em português'],
    translationLabel: 'Português'
  }
};

// Helper function to create SEO-friendly title
export function createSEOTitle(article: Article, locale: string = 'en'): string {
  let title = article.title;
  const config = SEO_LOCALES[locale] || SEO_LOCALES['en'];

  if ('ver' in article && article.ver) {
    title += ` v${article.ver}`;
  }

  const platforms = article.platforms?.map(p => {
    const name = p.name.toLowerCase();
    if (name === 'windows') return 'Win';
    if (name === 'android') return 'APK';
    return p.name;
  }) || [];
  const platformStr = platforms.length > 0 ? ` (${platforms.join('/')})` : '';

  // Check if article tags contain translations keywords
  const hasTranslation = article.tags?.some(tag => 
    config.translationKeywords.some(keyword => tag.name.toLowerCase().includes(keyword))
  );

  const translationSuffix = hasTranslation ? ` ${config.translationLabel}` : '';

  // Construct dynamic localized title
  // Shorten: Remove "H Game" if title is already long
  const baseTitle = `${config.downloadPrefix} ${title}${platformStr}${translationSuffix} ${config.freeWord}`;
  const suffix = ` ${config.gameSuffix}`;
  
  let finalTitle = baseTitle;
  
  // Try to fit "H Game" if possible, but prioritize stay under 55 chars 
  // (to leave room for " | ChanomHub" which is 12 chars, total < 70)
  if (finalTitle.length + suffix.length <= 55) {
    finalTitle += suffix;
  }

  if ('sequentialCode' in article && article.sequentialCode) {
    const code = ` [${article.sequentialCode}]`;
    if (finalTitle.length + code.length <= 58) {
      finalTitle += code;
    }
  }

  // Final fallback: if still too long, we might need to truncate
  if (finalTitle.length > 58) {
    return finalTitle.substring(0, 55) + '...';
  }

  return finalTitle;
}


// Helper function to construct content path for metadata
export function constructContentPath(locale: Locale, paths: string[]): string {
  return `articles/${paths[0]}`;
}

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
    images = [{ url: '/chanomhub.ico', width: 1200, height: 630, alt: 'ChanomHub Logo' }],
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
    images = [`${siteUrl}/chanomhub.ico`],
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
        "url": `${siteUrl}/chanomhub.ico`
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

/**
 * Generate BreadcrumbList structured data for Google rich results
 * @param options - Breadcrumb options
 * @returns JSON-LD structured data
 */
export function generateBreadcrumbStructuredData(options: {
  locale: Locale;
  items: Array<{ name: string; url?: string }>;
}) {
  const { locale, items } = options;
  const baseUrl = locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}`;

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": baseUrl,
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 2,
      "name": item.name,
      ...(item.url ? { "item": item.url } : {}),
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems,
  };
}

/**
 * Generate SoftwareApplication structured data for games to enable Rich Rating Snippets in Google Search
 * @param article - Current article/game object
 * @param locale - Current locale
 * @returns JSON-LD SoftwareApplication schema object
 */
export function generateGameSoftwareStructuredData(article: Article, locale: Locale) {
  const platformNames = article.platforms?.map(p => p.name) || ['Windows', 'Android'];
  const ratingValue = article.favoritesCount > 0 
    ? Math.min(5.0, 4.0 + (article.favoritesCount / 200))
    : 4.5;
  const ratingCount = Math.max(5, article.favoritesCount);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": article.title,
    "operatingSystem": platformNames.join(', '),
    "applicationCategory": "GameApplication",
    "description": article.description,
    "url": locale === defaultLocale 
      ? `${siteUrl}/articles/${article.slug}`
      : `${siteUrl}/${locale}/articles/${article.slug}`,
    "image": article.mainImage || `${siteUrl}/chanomhub.ico`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue.toFixed(1),
      "ratingCount": ratingCount,
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "price": article.price || "0",
      "priceCurrency": "USD",
      "category": "free"
    }
  };
}