'use client'

import { ApiQueryProvider } from '@/lib/api/provider'
import { Toaster } from '@/components/shared/ui/sonner'

/**
 * App Providers
 *
 * Wraps the entire app with necessary providers:
 * - React Query (API state management)
 * - Toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiQueryProvider>
      {children}
      <Toaster position="top-right" />
    </ApiQueryProvider>
  )
}
