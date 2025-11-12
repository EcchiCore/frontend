// src/utils/siteUtils.ts
export const getSiteUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.PRODUCTION_URL) {
    return `https://${process.env.PRODUCTION_URL}`;
  }

  return 'https://chanomhub.online';
};