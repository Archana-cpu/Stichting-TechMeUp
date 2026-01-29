// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - EMPTY STATE
// Empty state component for lists and sections
// ══════════════════════════════════════════════════════════════════════════════

import { cn } from '@/lib/utils'
import { LucideIcon, Inbox, Search, FileQuestion, AlertCircle } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

interface EmptyStatePresetProps {
  action?: React.ReactNode
  className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-12 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset Components
// ─────────────────────────────────────────────────────────────────────────────

function EmptyStateNoResults({ action, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search or filter to find what you're looking for."
      action={action}
      className={className}
    />
  )
}

function EmptyStateNoData({ action, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={Inbox}
      title="No data yet"
      description="Get started by creating your first item."
      action={action}
      className={className}
    />
  )
}

function EmptyStateNoPolls({ action, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={FileQuestion}
      title="No polls yet"
      description="Create your first poll to start collecting responses."
      action={action}
      className={className}
    />
  )
}

function EmptyStateNoNotifications({ action, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={Inbox}
      title="All caught up!"
      description="You don't have any notifications right now."
      action={action}
      className={className}
    />
  )
}

function EmptyStateError({ action, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something went wrong"
      description="We couldn't load the data. Please try again."
      action={action}
      className={className}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  EmptyState,
  EmptyStateNoResults,
  EmptyStateNoData,
  EmptyStateNoPolls,
  EmptyStateNoNotifications,
  EmptyStateError,
}

export type { EmptyStateProps, EmptyStatePresetProps }
