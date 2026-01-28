'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - DASHBOARD NAVIGATION
// Sidebar navigation component
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Items
// ─────────────────────────────────────────────────────────────────────────────

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Polls',
    href: '/polls',
    icon: BarChart3,
  },
  {
    title: 'Surveys',
    href: '/surveys',
    icon: FileText,
  },
  {
    title: 'Audience',
    href: '/audience',
    icon: Users,
  },
]

const bottomNavItems = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Navigation Component
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col justify-between px-3 py-4">
      <div className="space-y-1">
        {/* Create Button */}
        <Link
          href="/polls/new"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>

        {/* Main Navigation */}
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="space-y-1 border-t pt-4 dark:border-slate-800">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
