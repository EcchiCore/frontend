// src/utils/siteUtils.ts
export const getSiteUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Ensure that the production URL is always chanomhub.com
  if (
    process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL.includes('chanomhub.com')
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (
    process.env.PRODUCTION_URL &&
    process.env.PRODUCTION_URL.includes('chanomhub.com')
  ) {
    return `https://${process.env.PRODUCTION_URL}`;
  }

  return 'https://chanomhub.com';
};