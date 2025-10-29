'use client'

/**
 * useAuth Hook
 *
 * Main authentication hook for components.
 * Provides auth state, user data, and auth actions.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '@/i18n/routing'
import type { SessionUser } from '@/components/features/session/types'
import { getCurrentSessionAction, logoutAction } from '../actions'
import { useTokenRefresh } from './useTokenRefresh'

interface UseAuthReturn {
  /** Current authenticated user */
  user: SessionUser | null

  /** Is authentication state loading? */
  isLoading: boolean

  /** Is user authenticated? */
  isAuthenticated: boolean

  /** Authentication error (if any) */
  error: string | null

  /** Logout function */
  logout: () => Promise<void>

  /** Refresh user data */
  refresh: () => Promise<void>

  /** Check if user has specific role */
  hasRole: (role: SessionUser['role'] | SessionUser['role'][]) => boolean

  /** Check if user is admin */
  isAdmin: boolean

  /** Check if user is caterer */
  isCaterer: boolean

  /** Check if user is customer */
  isCustomer: boolean
}

/**
 * Authentication hook
 *
 * Automatically:
 * - Loads user session on mount
 * - Refreshes tokens before expiry
 * - Provides auth state and actions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading, isAuthenticated, logout } = useAuth()
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (!isAuthenticated) return <div>Please login</div>
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user.firstName}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Enable automatic token refresh
  useTokenRefresh()

  /**
   * Load user session
   */
  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await getCurrentSessionAction()

      if (result.success && result.data) {
        setUser(result.data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to load session:', err)
      setError(err instanceof Error ? err.message : 'Failed to load session')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await logoutAction()
      setUser(null)
      router.push('/signin')
    } catch (err) {
      console.error('Logout error:', err)
      // Even if logout fails, clear local state and redirect
      setUser(null)
      router.push('/signin')
    }
  }, [router])

  /**
   * Check if user has specific role(s)
   */
  const hasRole = useCallback(
    (roles: SessionUser['role'] | SessionUser['role'][]): boolean => {
      if (!user) return false

      const allowedRoles = Array.isArray(roles) ? roles : [roles]
      return allowedRoles.includes(user.role)
    },
    [user]
  )

  // Load session on mount
  useEffect(() => {
    loadSession()
  }, [loadSession])

  // Computed values
  const isAuthenticated = user !== null
  const isAdmin = hasRole('admin')
  const isCaterer = hasRole('caterer')
  const isCustomer = hasRole('customer')

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    logout,
    refresh: loadSession,
    hasRole,
    isAdmin,
    isCaterer,
    isCustomer,
  }
}

/**
 * Hook to require authentication
 *
 * Redirects to signin if not authenticated.
 * Shows loading state while checking auth.
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user, isLoading } = useRequireAuth()
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return <div>Welcome, {user.firstName}!</div>
 * }
 * ```
 */
export function useRequireAuth(): Omit<UseAuthReturn, 'isAuthenticated'> & {
  user: SessionUser // user is guaranteed non-null
} {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/signin')
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  return {
    ...auth,
    user: auth.user!, // Non-null assertion safe due to redirect
  }
}

/**
 * Hook to require specific role(s)
 *
 * Redirects to unauthorized page if user doesn't have required role.
 *
 * @example
 * ```tsx
 * function AdminPage() {
 *   const { user } = useRequireRole('admin')
 *   return <div>Admin: {user.email}</div>
 * }
 * ```
 */
export function useRequireRole(
  roles: SessionUser['role'] | SessionUser['role'][]
): Omit<UseAuthReturn, 'isAuthenticated'> & {
  user: SessionUser
} {
  const auth = useRequireAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.hasRole(roles)) {
      router.push('/error-403') // Unauthorized
    }
  }, [auth, roles, router])

  return auth
}
