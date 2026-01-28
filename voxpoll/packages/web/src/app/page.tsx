// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - HOME PAGE
// Landing page with hero section and features
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { ArrowRight, BarChart3, Users, Zap, Shield } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Features Data
// ─────────────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Zap,
    title: 'Real-Time Results',
    description:
      'Watch votes come in live with instant updates. Perfect for live events and presentations.',
  },
  {
    icon: Users,
    title: 'Audience Engagement',
    description:
      'Keep your audience engaged with interactive polls, quizzes, and surveys.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Get detailed insights into responses with beautiful charts and exportable reports.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Enterprise-grade security with optional anonymous voting and data privacy controls.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Home Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container-app flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              VoxPoll
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="btn-ghost hidden sm:inline-flex"
            >
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white py-20 dark:from-slate-900 dark:to-slate-900 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-900/20" />
          <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-accent-200/30 blur-3xl dark:bg-accent-900/20" />
        </div>

        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Create Engaging{' '}
              <span className="text-gradient">Polls & Surveys</span> in Seconds
            </h1>
            <p className="mb-10 text-lg text-slate-600 dark:text-slate-400 sm:text-xl">
              VoxPoll makes it easy to gather feedback, engage your audience,
              and make data-driven decisions with beautiful, real-time polling.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="btn-primary w-full px-8 py-3 text-base sm:w-auto"
              >
                Start for Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/explore"
                className="btn-secondary w-full px-8 py-3 text-base sm:w-auto"
              >
                Explore Polls
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '50K+', label: 'Polls Created' },
              { value: '1M+', label: 'Votes Cast' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400 lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container-app">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Everything you need for better feedback
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Powerful features to help you create, share, and analyze polls
              with ease.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card group transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/30 dark:text-brand-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-600 to-accent-600 py-20">
        <div className="container-app text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mb-8 text-lg text-brand-100">
            Join thousands of users creating engaging polls every day.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-brand-600 transition-all hover:bg-brand-50"
          >
            Create Your First Poll
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="container-app">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500">
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                VoxPoll
              </span>
            </div>
            <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
              <Link href="/privacy" className="hover:text-brand-600">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-brand-600">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-brand-600">
                Contact
              </Link>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              &copy; {new Date().getFullYear()} VoxPoll. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
