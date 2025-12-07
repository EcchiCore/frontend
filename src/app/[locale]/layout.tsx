// src/app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { siteUrl, defaultMetadataContent, supportedLocales, defaultLocale } from "@/utils/localeUtils";
import Footer from '@/components/Footer';
import { getActiveEventTheme } from "@/lib/event-theme";
import Script from "next/script";

const inter = Inter({ subsets: ['latin'] });

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

// Root layout metadata (สำหรับ SEO เบื้องต้น)
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | ChanomHub',
    default: 'ChanomHub - Adult Gaming Hub'
  },
  description: defaultMetadataContent.en.description,
  keywords: defaultMetadataContent.en.keywords,

  alternates: {
    canonical: siteUrl,
    languages: {
      'en': siteUrl,
      'th': `${siteUrl}/th`,
      'x-default': siteUrl
    },
  },
  openGraph: {
    title: 'ChanomHub',
    description: defaultMetadataContent.en.description,
    url: siteUrl,
    siteName: 'ChanomHub',
    locale: defaultLocale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChanomHub',
    description: defaultMetadataContent.en.description,
  },
};


// Infer the locale type from routing.locales
type Locale = typeof routing.locales[number]; // "en" | "th"

interface LocaleSegmentLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleSegmentLayout({
  children,
  params,
}: LocaleSegmentLayoutProps) {
  const resolvedParams = await params;
  const currentLocale = resolvedParams.locale;

  // Validate the locale against the supported locales from routing
  const isValidLocale = (locale: string): locale is Locale => {
    return routing.locales.includes(locale as Locale);
  };

  const validLocale = isValidLocale(currentLocale)
    ? currentLocale
    : routing.defaultLocale;

  // Redirect to the default locale if the provided locale is invalid
  if (currentLocale !== validLocale) {
    redirect(`/${validLocale}`);
  }

  // Load locale-specific messages
  let messages;
  try {
    messages = (await import(`@/messages/${validLocale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${validLocale}`, error);
    messages = (await import(`@/messages/${routing.defaultLocale}.json`)).default;
  }

  const activeEventTheme = getActiveEventTheme();

  return (
    <html
      lang={validLocale}
      suppressHydrationWarning
      data-event-theme={activeEventTheme?.id}
    >
      <head>
        <meta charSet="utf-8" />

        {/* Prevent flash of unstyled content */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            try {
              const theme = localStorage.getItem('chanomhub-theme') || 'light';
              document.documentElement.classList.add(theme);
              const eventTheme = ${JSON.stringify(activeEventTheme?.id ?? null)};
              if (eventTheme) {
                document.documentElement.setAttribute('data-event-theme', eventTheme);
              } else {
                document.documentElement.removeAttribute('data-event-theme');
              }
            } catch (e) {}
          `
          }}
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ChanomHub",
              "url": siteUrl,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              },
              "inLanguage": supportedLocales,
              "availableLanguage": supportedLocales.map(lang => ({
                "@type": "Language",
                "name": lang === 'en' ? 'English' : 'Thai',
                "alternateName": lang
              }))
            })
          }}
        />

        <link rel="webmention" href="https://webmention.io/chanomhub.online/webmention" />

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PLNDF549');
          `}
        </Script>

      </head>

      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark" storageKey="chanomhub-theme">
          <NextIntlClientProvider locale={validLocale} messages={messages}>
            {children}
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PLNDF549"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      </body>
    </html>
  );
}
