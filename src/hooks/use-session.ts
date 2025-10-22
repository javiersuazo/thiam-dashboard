'use client'

/**
 * useSession Hook - Client-side session access
 */

import { useQuery } from '@tanstack/react-query'
import { SessionData } from '@/lib/session/types'

async function fetchSession(): Promise<SessionData | null> {
  const response = await fetch('/api/session')
  if (!response.ok) return null
  return response.json()
}

export function useSession() {
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    session,
    isLoading,
    isAuthenticated: !!session?.user,
    user: session?.user,
    activeAccount: session?.accounts.find(
      (acc) => acc.id === session.activeAccountId
    ),
    accounts: session?.accounts || [],
    roles: session?.roles || [],
    isImpersonating: session?.isImpersonating || false,
  }
}
