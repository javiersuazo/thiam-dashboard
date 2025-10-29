'use client'

/**
 * useSession Hook
 *
 * Access session context from any component.
 * Must be used within SessionProvider.
 */

import { useContext } from 'react'
import { SessionContext } from '../SessionProvider'
import type { SessionContextValue } from '../types'

/**
 * Hook to access session context
 *
 * @throws Error if used outside SessionProvider
 * @returns Session context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, logout } = useSession()
 *
 *   if (!isAuthenticated) {
 *     return <div>Not authenticated</div>
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user.fullName}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)

  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }

  return context
}

/**
 * Hook to require authenticated session
 *
 * @throws Error if not authenticated
 * @returns Session context value with guaranteed user
 *
 * @example
 * ```tsx
 * function ProtectedComponent() {
 *   const { user } = useRequireAuth()
 *   // user is guaranteed to be non-null here
 *
 *   return <div>Welcome, {user.fullName}!</div>
 * }
 * ```
 */
export function useRequireAuth(): SessionContextValue & { user: NonNullable<SessionContextValue['user']> } {
  const session = useSession()

  if (!session.isAuthenticated || !session.user) {
    throw new Error('Authentication required')
  }

  return session as SessionContextValue & { user: NonNullable<SessionContextValue['user']> }
}

/**
 * Hook to get current user (null if not authenticated)
 *
 * @returns Current user or null
 *
 * @example
 * ```tsx
 * function UserGreeting() {
 *   const user = useCurrentUser()
 *
 *   if (!user) return null
 *
 *   return <div>Hello, {user.fullName}!</div>
 * }
 * ```
 */
export function useCurrentUser() {
  const { user } = useSession()
  return user
}

/**
 * Hook to check authentication status
 *
 * @returns true if authenticated, false otherwise
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isAuthenticated = useIsAuthenticated()
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? 'Logged in' : 'Logged out'}
 *     </div>
 *   )
 * }
 * ```
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useSession()
  return isAuthenticated
}
