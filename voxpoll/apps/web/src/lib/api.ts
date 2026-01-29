// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - API CLIENT SETUP
// Next.js 16 Server Actions with type-safe API client
// ══════════════════════════════════════════════════════════════════════════════

import { createVoxPollClient } from '../../../api/src/client'
import { cookies } from 'next/headers'

// ─────────────────────────────────────────────────────────────────────────────
// Server-Side Client (for Server Components & Server Actions)
// ─────────────────────────────────────────────────────────────────────────────

export async function getServerClient() {
  const cookieStore = await cookies()

  return createVoxPollClient({
    baseUrl: process.env.API_URL || 'http://localhost:4000/api/v1',
    getToken: () => cookieStore.get('accessToken')?.value || null,
    onUnauthorized: () => {
      // Token expired - will be handled by middleware
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-Side Client (for Client Components)
// ─────────────────────────────────────────────────────────────────────────────

export function getClientApi() {
  return createVoxPollClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
    getToken: () => {
      // Get token from cookie on client side
      if (typeof document === 'undefined') return null
      const match = document.cookie.match(/accessToken=([^;]+)/)
      return match ? match[1] : null
    },
    onUnauthorized: () => {
      // Redirect to login
      window.location.href = '/auth/login'
    },
    onError: (error) => {
      console.error('API Error:', error)
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Token Management
// ─────────────────────────────────────────────────────────────────────────────

export async function setAuthCookies(session: {
  token: string
  refreshToken: string
  expiresAt: string
}) {
  const cookieStore = await cookies()

  cookieStore.set('accessToken', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(session.expiresAt),
    path: '/',
  })

  cookieStore.set('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    path: '/',
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}
