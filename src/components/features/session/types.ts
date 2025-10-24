/**
 * Session Feature Types
 *
 * Types for session management across the application.
 * This is a cross-cutting feature used by all domains.
 */

/**
 * Session User (subset of AuthUser for client-side)
 */
export interface SessionUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  fullName: string
  role: 'customer' | 'caterer' | 'admin' | 'ops' | 'finance' | 'sales'
  accountId: string
  has2FAEnabled: boolean
}

/**
 * Session Data
 */
export interface Session {
  user: SessionUser
  expiresAt: number
  issuedAt: number
}

/**
 * Session Context Value
 */
export interface SessionContextValue {
  /** Current session (null if not authenticated) */
  session: Session | null

  /** Current user (null if not authenticated) */
  user: SessionUser | null

  /** Is the user authenticated? */
  isAuthenticated: boolean

  /** Is session loading? */
  isLoading: boolean

  /** Session error (if any) */
  error: string | null

  /** Set/update session (login) */
  login: (session: Session) => void

  /** Clear the session (logout) */
  logout: () => void

  /** Refresh the session */
  refreshSession: (session: Session) => void

  /** Update user data */
  updateUser: (user: Partial<SessionUser>) => void
}

/**
 * Session Storage Key
 */
export const SESSION_STORAGE_KEY = 'thiam_session_data'

/**
 * Session Cookie Name
 */
export const SESSION_COOKIE_NAME = 'thiam_session'

/**
 * Session Expiry (7 days in milliseconds)
 */
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000
