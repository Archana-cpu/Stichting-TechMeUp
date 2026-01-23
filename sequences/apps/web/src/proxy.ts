import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@seq/i18n';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

/**
 * Next.js 16 proxy function
 * 
 * Auth protection is handled by layout-based guards in route groups:
 * - (public)/ - Login page, redirects authenticated users
 * - (protected)/ - Requires auth, checks onboarding/email verification
 * - (admin)/ - Requires admin role
 * 
 * This proxy only handles:
 * - Internationalization (locale detection & URL prefixing)
 */
export function proxy(request: NextRequest) {
  // Let intl middleware handle locale detection
  const response = intlMiddleware(request);
  
  return response || NextResponse.next();
}

export const config = {
  matcher: ['/', '/(tr|en|nl)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
