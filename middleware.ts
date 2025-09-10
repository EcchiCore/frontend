import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { NextRequest } from 'next/server';

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Custom middleware to add logging
export default function middleware(req: NextRequest) {
  console.log('🔍 Middleware - Incoming request URL:', req.url);
  console.log('🔍 Middleware - Request pathname:', req.nextUrl.pathname);
  console.log('🔍 Middleware - Detected locale from header:', req.headers.get('accept-language'));

  // Call the next-intl middleware
  const response = intlMiddleware(req);

  // Log redirect location if present
  if (response.headers.get('location')) {
    console.log('🔀 Middleware - Redirecting to:', response.headers.get('location'));
  } else {
    console.log('🔀 Middleware - Staying on same page with locale');
  }

  return response;
}

// Middleware configuration
export const config = {
  matcher: [
    '/', // Match the root
    '/(th|en)/:path*', // Match internationalized paths
    '/((?!api|_next|_vercel|.*\\..*).*)' // Match all other paths except API, Next.js internals, and static files
  ],
};