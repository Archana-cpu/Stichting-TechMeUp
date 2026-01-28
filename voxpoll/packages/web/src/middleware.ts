// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - MIDDLEWARE
// i18n + Authentication routing
// ══════════════════════════════════════════════════════════════════════════════

import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { locales, defaultLocale } from './i18n/config'

// ─────────────────────────────────────────────────────────────────────────────
// i18n Middleware
// ─────────────────────────────────────────────────────────────────────────────

const intlMiddleware = createMiddleware(routing)

// ─────────────────────────────────────────────────────────────────────────────
// Route Configuration
// ─────────────────────────────────────────────────────────────────────────────

const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/explore',
  '/p',
  '/privacy',
  '/terms',
  '/contact',
]

const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
]

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split('/')
  if (segments[1] && locales.includes(segments[1] as typeof locales[number])) {
    return '/' + segments.slice(2).join('/')
  }
  return pathname
}

function isPublicRoute(pathname: string): boolean {
  const pathWithoutLocale = getPathnameWithoutLocale(pathname)
  return publicRoutes.some(
    (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  )
}

function isAuthRoute(pathname: string): boolean {
  const pathWithoutLocale = getPathnameWithoutLocale(pathname)
  return authRoutes.some((route) => pathWithoutLocale.startsWith(route))
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware Function
// ─────────────────────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value

  const response = intlMiddleware(request)

  const pathWithoutLocale = getPathnameWithoutLocale(pathname)

  if (isAuthRoute(pathname) && accessToken) {
    const locale = locales.find(l => pathname.startsWith(`/${l}`)) || defaultLocale
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  if (isPublicRoute(pathname)) {
    return response
  }

  if (!accessToken) {
    const locale = locales.find(l => pathname.startsWith(`/${l}`)) || defaultLocale
    const loginUrl = new URL(`/${locale}/auth/login`, request.url)
    loginUrl.searchParams.set('redirect', pathWithoutLocale)
    return NextResponse.redirect(loginUrl)
  }

  response.headers.set('x-has-auth', 'true')

  return response
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware Config
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
