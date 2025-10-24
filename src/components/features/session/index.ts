/**
 * Session Feature - Public API
 *
 * Barrel export for session feature.
 * Session is a cross-cutting concern that provides authentication context.
 */

// Types
export type { Session, SessionUser, SessionContextValue } from './types'

export { SESSION_COOKIE_NAME, SESSION_STORAGE_KEY, SESSION_MAX_AGE } from './types'

// Provider
export { SessionProvider, SessionContext } from './SessionProvider'

// Hooks
export { useSession, useRequireAuth, useCurrentUser, useIsAuthenticated } from './hooks/useSession'
