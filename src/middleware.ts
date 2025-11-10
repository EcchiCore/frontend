import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware({
  locales: ['en', 'th'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // If the request is for the root path and the default locale is 'en',
  // rewrite the URL to '/en' internally.
  if (pathname === '/' && routing.defaultLocale === 'en') {
    const url = req.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.rewrite(url);
  }

  // Otherwise, let next-intl middleware handle it
  return intlMiddleware(req);
}

// Middleware configuration
export const config = {
  matcher: [

    '/((?!api|_next|studio|_vercel|ad-redirect|.*\\..*).*)', // Match all other paths except API, Next.js internals, ad-redirect, and static files
    '/(th)/:path*', // Match internationalized paths
  ],
};

