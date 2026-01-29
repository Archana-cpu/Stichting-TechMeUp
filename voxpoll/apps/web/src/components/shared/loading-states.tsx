// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - LOADING STATES
// Skeleton loaders and loading indicators
// ══════════════════════════════════════════════════════════════════════════════

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Base
// ─────────────────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700',
        className
      )}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2
      className={cn('animate-spin text-brand-600', sizeClasses[size], className)}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Loader
// ─────────────────────────────────────────────────────────────────────────────

interface PageLoaderProps {
  text?: string
}

function PageLoader({ text = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Card Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Poll Card Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function PollCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Question */}
      <div className="mt-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="mt-2 h-6 w-3/4" />
      </div>

      {/* Options */}
      <div className="mt-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// List Skeleton
// ─────────────────────────────────────────────────────────────────────────────

interface ListSkeletonProps {
  count?: number
  className?: string
}

function ListSkeleton({ count = 5, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Table Skeleton
// ─────────────────────────────────────────────────────────────────────────────

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 border-b py-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <Skeleton className="mx-auto h-6 w-40 sm:mx-0" />
          <Skeleton className="mx-auto h-4 w-24 sm:mx-0" />
          <Skeleton className="mx-auto h-4 w-64 sm:mx-0" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 sm:justify-start">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <Skeleton className="mx-auto h-6 w-12" />
            <Skeleton className="mx-auto mt-1 h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  Skeleton,
  Spinner,
  PageLoader,
  CardSkeleton,
  PollCardSkeleton,
  ListSkeleton,
  TableSkeleton,
  ProfileSkeleton,
}

export type { SkeletonProps, SpinnerProps, PageLoaderProps, ListSkeletonProps, TableSkeletonProps }
