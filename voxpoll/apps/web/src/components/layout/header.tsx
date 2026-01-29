'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - HEADER
// Main navigation header component
// ══════════════════════════════════════════════════════════════════════════════

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, Bell, Plus } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/shared'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface HeaderProps {
  user?: {
    id: string
    username: string
    displayName?: string | null
    avatarUrl?: string | null
    verificationLevel?: number
  } | null
  showSearch?: boolean
  transparent?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Items
// ─────────────────────────────────────────────────────────────────────────────

const publicNavItems = [
  { label: 'Discover', href: '/explore' },
  { label: 'Trending', href: '/trending' },
  { label: 'Pricing', href: '/pricing' },
]

const authNavItems = [
  { label: 'Feed', href: '/feed' },
  { label: 'My Polls', href: '/polls' },
  { label: 'Create', href: '/polls/create', primary: true },
]

// ─────────────────────────────────────────────────────────────────────────────
// Header Component
// ─────────────────────────────────────────────────────────────────────────────

function Header({ user, showSearch = true, transparent = false }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAuthenticated = !!user

  const navItems = isAuthenticated ? authNavItems : publicNavItems

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b',
        transparent
          ? 'border-transparent bg-transparent'
          : 'border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <span className="text-lg font-bold">V</span>
          </div>
          <span className="hidden text-xl font-bold text-foreground sm:block">
            VoxPoll
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                'primary' in item && item.primary
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {showSearch && (
            <button
              className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              </Link>

              {/* Create Button (Mobile) */}
              <Link
                href="/polls/create"
                className="flex rounded-lg bg-brand-600 p-2 text-white transition-colors hover:bg-brand-700 md:hidden"
                aria-label="Create"
              >
                <Plus className="h-5 w-5" />
              </Link>

              {/* User Avatar */}
              <Link href={`/u/${user.username}`} className="ml-2">
                <UserAvatar user={user} size="sm" showVerification />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:block"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  'primary' in item && item.primary
                    ? 'bg-brand-600 text-white'
                    : pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                )}
              >
                {item.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 rounded-lg border px-4 py-3 text-center text-sm font-medium"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { Header }
export type { HeaderProps }
