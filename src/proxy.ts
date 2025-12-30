import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware({
  ...routing,
  localePrefix: 'as-needed',
  localeDetection: false
});

// This middleware intercepts requests to determine the locale and redirects
// as needed.
export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 308 Permanent Redirect: /en/... -> /... (strip default locale prefix)
  // This ensures SEO consolidation - all English content served without /en/
  if (pathname.startsWith('/en/') || pathname === '/en') {
    const newPathname = pathname === '/en' ? '/' : pathname.slice(3);
    const url = request.nextUrl.clone();
    url.pathname = newPathname;
    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/studio`, or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|studio|_vercel|ad-redirect|health|.*\\..*).*)'
  ]
};
