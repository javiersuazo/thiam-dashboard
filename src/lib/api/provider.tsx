/**
 * React Query Provider
 *
 * Configures React Query for the entire application with sensible defaults
 * for the Thiam API.
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, Suspense, lazy } from 'react'

// Lazy load devtools to avoid SSR issues
const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
)

/**
 * Default configuration for React Query
 *
 * These settings optimize for:
 * - Good user experience (background refetching)
 * - API efficiency (smart caching)
 * - Error handling (retry logic)
 */
const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 1000 * 60 * 5,

      // Keep unused data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,

      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,

      // Refetch on network reconnection
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,

      // Show error for at least 5 seconds
      gcTime: 1000 * 60 * 5,
    },
  },
}

/**
 * API Query Provider
 *
 * Wraps the app with React Query provider and devtools.
 * Use this at the root of your app (in layout.tsx).
 *
 * @example app/layout.tsx
 * ```tsx
 * import { ApiQueryProvider } from '@/lib/api/provider'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ApiQueryProvider>
 *           {children}
 *         </ApiQueryProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function ApiQueryProvider({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient for each request/page
  // This prevents data sharing between users in server components
  const [queryClient] = useState(() => new QueryClient(defaultQueryClientConfig))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        </Suspense>
      )}
    </QueryClientProvider>
  )
}

/**
 * Create a custom query client with different settings
 *
 * Use this if you need a QueryClient with custom configuration
 * (e.g., for testing or special use cases).
 *
 * @example Custom configuration
 * ```tsx
 * const queryClient = createQueryClient({
 *   defaultOptions: {
 *     queries: {
 *       staleTime: 1000 * 60 * 10, // 10 minutes
 *     }
 *   }
 * })
 * ```
 */
export function createQueryClient(config?: Partial<typeof defaultQueryClientConfig>) {
  return new QueryClient({
    ...defaultQueryClientConfig,
    ...config,
  })
}
