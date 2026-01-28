// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - POLLS LIST PAGE
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { Plus, MoreHorizontal, BarChart3, Clock, Users, Eye } from 'lucide-react'
import { getPollsAction } from '@/actions/poll.actions'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polls',
}

// ─────────────────────────────────────────────────────────────────────────────
// Polls Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default async function PollsPage() {
  const result = await getPollsAction()

  const polls = result.success ? result.data.items : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Polls
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track your polls
          </p>
        </div>
        <Link href="/polls/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Create Poll
        </Link>
      </div>

      {/* Filters (placeholder) */}
      <div className="flex flex-wrap gap-4">
        <select className="input max-w-[200px]">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>
        <select className="input max-w-[200px]">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most-votes">Most Votes</option>
        </select>
      </div>

      {/* Polls List */}
      {polls.length > 0 ? (
        <div className="space-y-4">
          {polls.map((poll) => (
            <div key={poll.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/polls/${poll.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                    >
                      {poll.title}
                    </Link>
                    <span
                      className={`badge ${
                        poll.status === 'ACTIVE'
                          ? 'badge-success'
                          : poll.status === 'DRAFT'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {poll.status}
                    </span>
                  </div>
                  {poll.description && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {poll.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {poll.totalVotes || 0} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {poll.visibility}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(poll.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button className="btn-ghost p-2">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="card py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <BarChart3 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">
            No polls yet
          </h3>
          <p className="mx-auto mb-6 max-w-sm text-slate-600 dark:text-slate-400">
            Create your first poll to start gathering feedback from your audience.
          </p>
          <Link href="/polls/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Your First Poll
          </Link>
        </div>
      )}
    </div>
  )
}
