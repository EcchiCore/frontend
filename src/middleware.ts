import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// This middleware intercepts requests to determine the locale and redirects
// as needed.
export default createMiddleware({
  ...routing,
  localePrefix: 'as-needed',
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/studio`, or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|studio|_vercel|ad-redirect|.*\\..*).*)'
  ]
};
