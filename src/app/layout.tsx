// app/layout.tsx
import { ReactNode } from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { siteUrl, defaultMetadataContent, supportedLocales, defaultLocale } from "@/utils/localeUtils";
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

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const activeEventTheme = getActiveEventTheme();

  return (
    <html
      lang="th"
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
    {children}

    {/* Google Tag Manager (noscript) */}
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-PLNDF549"
        height="0"
        width="0"
        style={{display: 'none', visibility: 'hidden'}}
      />
    </noscript>
    </body>
    </html>
  );
}