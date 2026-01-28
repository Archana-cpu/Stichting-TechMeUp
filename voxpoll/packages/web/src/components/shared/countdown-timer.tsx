'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - COUNTDOWN TIMER
// Timer component for polls with expiration
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CountdownTimerProps {
  endsAt: Date | string
  onExpire?: () => void
  showIcon?: boolean
  compact?: boolean
  className?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function calculateTimeRemaining(endsAt: Date): TimeRemaining {
  const now = new Date()
  const total = endsAt.getTime() - now.getTime()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  }
}

function formatTimeUnit(value: number, unit: string): string {
  return `${value}${unit}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

function CountdownTimer({
  endsAt,
  onExpire,
  showIcon = true,
  compact = false,
  className,
}: CountdownTimerProps) {
  const endDate = typeof endsAt === 'string' ? new Date(endsAt) : endsAt
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(endDate)
  )
  const [hasExpired, setHasExpired] = useState(false)

  const updateTimer = useCallback(() => {
    const remaining = calculateTimeRemaining(endDate)
    setTimeRemaining(remaining)

    if (remaining.total <= 0 && !hasExpired) {
      setHasExpired(true)
      onExpire?.()
    }
  }, [endDate, hasExpired, onExpire])

  useEffect(() => {
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [updateTimer])

  const isUrgent = timeRemaining.total > 0 && timeRemaining.total <= 60 * 60 * 1000

  if (hasExpired || timeRemaining.total <= 0) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400',
          className
        )}
      >
        {showIcon && <Clock className="h-4 w-4" />}
        <span>Ended</span>
      </div>
    )
  }

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 text-sm',
          isUrgent
            ? 'text-red-600 dark:text-red-400'
            : 'text-slate-600 dark:text-slate-300',
          className
        )}
      >
        {showIcon && (
          isUrgent ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )
        )}
        <span>
          {timeRemaining.days > 0 && formatTimeUnit(timeRemaining.days, 'd ')}
          {timeRemaining.hours > 0 && formatTimeUnit(timeRemaining.hours, 'h ')}
          {formatTimeUnit(timeRemaining.minutes, 'm')}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        isUrgent
          ? 'text-red-600 dark:text-red-400'
          : 'text-slate-600 dark:text-slate-300',
        className
      )}
    >
      {showIcon && (
        isUrgent ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )
      )}
      <div className="flex items-baseline gap-1 text-sm">
        {timeRemaining.days > 0 && (
          <>
            <span className="font-semibold">{timeRemaining.days}</span>
            <span className="text-xs text-slate-400">d</span>
          </>
        )}
        <span className="font-semibold">
          {String(timeRemaining.hours).padStart(2, '0')}
        </span>
        <span className="text-xs text-slate-400">:</span>
        <span className="font-semibold">
          {String(timeRemaining.minutes).padStart(2, '0')}
        </span>
        <span className="text-xs text-slate-400">:</span>
        <span className="font-semibold">
          {String(timeRemaining.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Time Display (Static - No countdown)
// ─────────────────────────────────────────────────────────────────────────────

interface TimeDisplayProps {
  date: Date | string
  prefix?: string
  className?: string
}

function TimeDisplay({ date, prefix, className }: TimeDisplayProps) {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const isPast = diff < 0
  const absDiff = Math.abs(diff)

  let displayText: string

  if (absDiff < 60 * 1000) {
    displayText = isPast ? 'Just now' : 'In a moment'
  } else if (absDiff < 60 * 60 * 1000) {
    const mins = Math.floor(absDiff / (60 * 1000))
    displayText = isPast ? `${mins}m ago` : `In ${mins}m`
  } else if (absDiff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(absDiff / (60 * 60 * 1000))
    displayText = isPast ? `${hours}h ago` : `In ${hours}h`
  } else {
    const days = Math.floor(absDiff / (24 * 60 * 60 * 1000))
    displayText = isPast ? `${days}d ago` : `In ${days}d`
  }

  return (
    <span className={cn('text-sm text-slate-500 dark:text-slate-400', className)}>
      {prefix && <span>{prefix} </span>}
      {displayText}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { CountdownTimer, TimeDisplay }
export type { CountdownTimerProps, TimeDisplayProps, TimeRemaining }
