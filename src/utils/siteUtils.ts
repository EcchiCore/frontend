// src/utils/siteUtils.ts
export const getSiteUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Custom domain หรือ fallback
  return process.env.FRONTEND_URL || 'https://chanomhub.online';
};

export const getCanonicalDomain = (): string => {
  return new URL(getSiteUrl()).host;
};