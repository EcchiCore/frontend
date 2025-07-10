// src/app/[locale]/layout.tsx
import React, { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';

// Infer the locale type from routing.locales
type Locale = typeof routing.locales[number]; // "en" | "de"

interface LocaleSegmentLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>; // Use Locale instead of string
}

export default async function LocaleSegmentLayout({
                                                    children,
                                                    params,
                                                  }: LocaleSegmentLayoutProps) {
  // Await the params Promise to get the actual parameters object
  const resolvedParams = await params;
  const currentLocale = resolvedParams.locale;

  // Validate the locale against the supported locales from routing
  const validLocale = routing.locales.includes(currentLocale)
    ? currentLocale
    : routing.defaultLocale;

  // Log the current locale for debugging
  console.log(`LocaleSegmentLayout: current locale is ${currentLocale}`);

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

  return (
    <NextIntlClientProvider locale={validLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}