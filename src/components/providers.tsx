'use client'

import { ApiQueryProvider } from '@/lib/api/provider'
import { SessionProvider } from '@/components/features/session'
import { Toaster } from '@/components/shared/ui/sonner'

/**
 * App Providers
 *
 * Wraps the entire app with necessary providers:
 * - React Query (API state management)
 * - Session management (authentication context)
 * - Toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiQueryProvider>
      <SessionProvider>
        {children}
        <Toaster position="top-right" />
      </SessionProvider>
    </ApiQueryProvider>
  )
}
