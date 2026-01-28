'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - ERROR BOUNDARY
// Error boundary wrapper for graceful error handling
// ══════════════════════════════════════════════════════════════════════════════

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Boundary Class Component
// ─────────────────────────────────────────────────────────────────────────────

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Fallback Component
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorFallbackProps {
  error: Error | null
  onReset?: () => void
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
        Something went wrong
      </h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Error Boundary (for React Query)
// ─────────────────────────────────────────────────────────────────────────────

interface QueryErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function QueryErrorFallback({ error, resetErrorBoundary }: QueryErrorFallbackProps) {
  return (
    <ErrorFallback error={error} onReset={resetErrorBoundary} />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Error Display
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

function ErrorMessage({ message, onRetry, className }: ErrorMessageProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20 ${className}`}
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
      <p className="flex-1 text-sm text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          Retry
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  ErrorBoundary,
  ErrorFallback,
  QueryErrorFallback,
  ErrorMessage,
}

export type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  ErrorFallbackProps,
  QueryErrorFallbackProps,
  ErrorMessageProps,
}
