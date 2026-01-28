'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - MOBILE NAVIGATION
// Bottom navigation bar for mobile devices
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Plus, Bell, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MobileNavItem {
  label: string
  href: string
  icon: LucideIcon
  isAction?: boolean
}

interface MobileNavProps {
  username?: string
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Items
// ─────────────────────────────────────────────────────────────────────────────

function getNavItems(username?: string): MobileNavItem[] {
  return [
    { label: 'Home', href: '/feed', icon: Home },
    { label: 'Explore', href: '/explore', icon: Search },
    { label: 'Create', href: '/polls/create', icon: Plus, isAction: true },
    { label: 'Alerts', href: '/notifications', icon: Bell },
    { label: 'Profile', href: username ? `/u/${username}` : '/auth/login', icon: User },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Navigation Component
// ─────────────────────────────────────────────────────────────────────────────

function MobileNav({ username, className }: MobileNavProps) {
  const pathname = usePathname()
  const navItems = getNavItems(username)

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden',
        className
      )}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/feed' && pathname.startsWith(item.href))

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                aria-label={item.label}
              >
                <item.icon className="h-6 w-6" />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2',
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-muted-foreground'
              )}
              aria-label={item.label}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { MobileNav }
export type { MobileNavProps, MobileNavItem }
