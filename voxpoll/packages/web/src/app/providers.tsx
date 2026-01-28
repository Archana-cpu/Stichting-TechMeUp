'use client'

// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - CLIENT PROVIDERS
// React Query, Theme, i18n and other client-side providers
// ═══════════════════════════════════════════════════════════════════════════════

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { ThemeProvider } from '@/components/providers/theme-provider'

// ─────────────────────────────────────────────────────────────────────────────
// Query Client Factory
// ─────────────────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof Error && 'status' in error) {
            const status = (error as Error & { status: number }).status
            if (status >= 400 && status < 500) {
              return false
            }
          }
          return failureCount < 3
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Providers Component
// ─────────────────────────────────────────────────────────────────────────────

interface ProvidersProps {
  children: React.ReactNode
}

function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <ThemeProvider
      defaultTheme="system"
      defaultStyle="minimal"
      defaultFont="geometric"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { Providers }
