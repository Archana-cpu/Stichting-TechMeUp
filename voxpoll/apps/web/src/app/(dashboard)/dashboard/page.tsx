// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - DASHBOARD PAGE
// Overview with stats and recent activity
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { Plus, BarChart3, Users, Vote, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats Data (would come from API in real implementation)
// ─────────────────────────────────────────────────────────────────────────────

const stats = [
  {
    title: 'Total Polls',
    value: '12',
    change: '+2 this week',
    icon: BarChart3,
    trend: 'up',
  },
  {
    title: 'Total Votes',
    value: '1,234',
    change: '+156 this week',
    icon: Vote,
    trend: 'up',
  },
  {
    title: 'Unique Voters',
    value: '456',
    change: '+23 this week',
    icon: Users,
    trend: 'up',
  },
  {
    title: 'Engagement Rate',
    value: '68%',
    change: '+5% vs last week',
    icon: TrendingUp,
    trend: 'up',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back! Here&apos;s what&apos;s happening with your polls.
          </p>
        </div>
        <Link href="/polls/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Create Poll
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                <stat.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Polls */}
      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Polls
          </h2>
          <Link
            href="/polls"
            className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all
          </Link>
        </div>

        {/* Empty State */}
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <BarChart3 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">
            No polls yet
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Create your first poll to start gathering feedback.
          </p>
          <Link href="/polls/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Your First Poll
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/polls/new?type=single"
          className="card group transition-all hover:-translate-y-1 hover:shadow-soft-lg"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
            Single Choice Poll
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Let voters select one option from a list.
          </p>
        </Link>

        <Link
          href="/polls/new?type=multiple"
          className="card group transition-all hover:-translate-y-1 hover:shadow-soft-lg"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-900/30 dark:text-purple-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
            Multiple Choice Poll
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Allow voters to select multiple options.
          </p>
        </Link>

        <Link
          href="/surveys/new"
          className="card group transition-all hover:-translate-y-1 hover:shadow-soft-lg"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white dark:bg-green-900/30 dark:text-green-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
            Survey
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create a multi-question survey for detailed feedback.
          </p>
        </Link>
      </div>
    </div>
  )
}
