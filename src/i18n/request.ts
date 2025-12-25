import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = routing.defaultLocale;

  try {
    const requested = await requestLocale;

    // Ensure requested is a string and valid locale
    if (requested && routing.locales.includes(requested as any)) {
      locale = requested as any;
    }
  } catch {
    // Silently fail and use defaultLocale
  }

  let messages;
  try {
    // Use dynamic import with fallback
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    // Final fallback to empty object to prevent production crash
    messages = {};
  }

  return {
    locale,
    messages
  };
});
