'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - SIDEBAR
// Dashboard sidebar navigation
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BarChart3,
  FileText,
  ClipboardList,
  Brain,
  Users,
  Settings,
  Bell,
  HelpCircle,
  Plus,
  Zap,
  Building2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string | number
}

interface NavSection {
  title?: string
  items: NavItem[]
}

interface SidebarProps {
  className?: string
  collapsed?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Configuration
// ─────────────────────────────────────────────────────────────────────────────

const mainNavSections: NavSection[] = [
  {
    items: [
      { label: 'Feed', href: '/feed', icon: Home },
      { label: 'Explore', href: '/explore', icon: BarChart3 },
    ],
  },
  {
    title: 'Create',
    items: [
      { label: 'My Polls', href: '/polls', icon: BarChart3 },
      { label: 'Surveys', href: '/surveys', icon: ClipboardList },
      { label: 'Tests', href: '/tests', icon: Brain },
    ],
  },
  {
    title: 'Live',
    items: [
      { label: 'Live Polls', href: '/live', icon: Zap },
    ],
  },
]

const bottomNavItems: NavItem[] = [
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help', href: '/help', icon: HelpCircle },
]

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Component
// ─────────────────────────────────────────────────────────────────────────────

function Sidebar({ className, collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex h-[calc(100vh-4rem)] flex-col border-r bg-background',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {/* Create Button */}
        <Link
          href="/polls/create"
          className={cn(
            'flex items-center gap-3 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700',
            collapsed && 'justify-center px-3'
          )}
        >
          <Plus className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Create New</span>}
        </Link>

        {/* Main Navigation */}
        {mainNavSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={cn(section.title && 'mt-4')}>
            {section.title && !collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
            )}
            <nav className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      collapsed && 'justify-center',
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t p-3">
        <nav className="flex flex-col gap-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { Sidebar }
export type { SidebarProps, NavItem, NavSection }
