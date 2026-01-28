// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - NEXT.JS CONFIGURATION
// Next.js 16 with Turbopack (default) and React 19.2
// ══════════════════════════════════════════════════════════════════════════════

import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // ─────────────────────────────────────────────────────────────────────────────
  // React 19.2 Strict Mode
  // ─────────────────────────────────────────────────────────────────────────────
  reactStrictMode: true,

  // ─────────────────────────────────────────────────────────────────────────────
  // React Compiler (stable in Next.js 16)
  // Automatically memoizes components, reducing unnecessary re-renders
  // ─────────────────────────────────────────────────────────────────────────────
  reactCompiler: true,

  // ─────────────────────────────────────────────────────────────────────────────
  // Experimental Features
  // ─────────────────────────────────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ['lucide-react', '@voxpoll/ui'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Image Optimization
  // ─────────────────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.voxpoll.app',
      },
      {
        protocol: 'https',
        hostname: 'voxpoll-uploads.s3.amazonaws.com',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Transpile Monorepo Packages
  // ─────────────────────────────────────────────────────────────────────────────
  transpilePackages: [
    '@voxpoll/shared',
    '@voxpoll/api',
    '@voxpoll/ui',
    '@voxpoll/validators',
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // Headers (Security & Caching)
  // ─────────────────────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Rewrites (API Proxy for Development)
  // ─────────────────────────────────────────────────────────────────────────────
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:4000'
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Environment Variables
  // ─────────────────────────────────────────────────────────────────────────────
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

export default withNextIntl(nextConfig)
