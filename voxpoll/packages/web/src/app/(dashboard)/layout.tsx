// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - DASHBOARD LAYOUT
// Authenticated layout with sidebar navigation
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { getCurrentUserAction } from '@/actions/auth.actions'
import { DashboardNav } from '@/components/dashboard/nav'
import { UserMenu } from '@/components/dashboard/user-menu'
import { redirect } from 'next/navigation'

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Layout
// ─────────────────────────────────────────────────────────────────────────────

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { success, data: user } = await getCurrentUserAction()

  if (!success || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              VoxPoll
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <DashboardNav />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
          {/* Mobile Menu Button */}
          <button className="rounded-lg p-2 lg:hidden">
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Search (placeholder) */}
          <div className="hidden flex-1 lg:block" />

          {/* User Menu */}
          <UserMenu user={user} />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
