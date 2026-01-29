// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - ROOT LAYOUT
// Next.js 16 App Router with React 19.2 + React Compiler
// ══════════════════════════════════════════════════════════════════════════════

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

// ─────────────────────────────────────────────────────────────────────────────
// Fonts
// ─────────────────────────────────────────────────────────────────────────────

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'VoxPoll - Real-Time Polling & Surveys',
    template: '%s | VoxPoll',
  },
  description:
    'Create engaging polls, surveys, and quizzes with real-time results. Perfect for classrooms, meetings, events, and audience engagement.',
  keywords: [
    'poll',
    'survey',
    'quiz',
    'voting',
    'real-time',
    'audience engagement',
    'live polling',
    'interactive',
  ],
  authors: [{ name: 'VoxPoll' }],
  creator: 'VoxPoll',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'VoxPoll',
    title: 'VoxPoll - Real-Time Polling & Surveys',
    description:
      'Create engaging polls, surveys, and quizzes with real-time results.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VoxPoll',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoxPoll - Real-Time Polling & Surveys',
    description:
      'Create engaging polls, surveys, and quizzes with real-time results.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white font-sans antialiased dark:bg-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
