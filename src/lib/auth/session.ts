/**
 * Server-Side Session Management
 *
 * Handles session creation, validation, and storage via httpOnly cookies.
 * Only runs on the server (Server Components, Server Actions, Middleware).
 */

import { cookies } from 'next/headers'
import type { SessionUser, Session } from '@/components/features/session/types'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/components/features/session/types'
import { calculateSessionExpiry, isSessionExpired } from '@/components/domains/auth'

// Re-export types for convenience
export type { SessionUser, Session }

/**
 * Cookie options for session
 */
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // CSRF protection
  path: '/',
  maxAge: SESSION_MAX_AGE / 1000, // Convert to seconds
}

/**
 * Create a new session
 *
 * @param user - Session user data
 * @param expiresInDays - Number of days until session expires (default: 7)
 * @returns Session object
 */
export function createSession(user: SessionUser, expiresInDays: number = 7): Session {
  return {
    user,
    expiresAt: calculateSessionExpiry(expiresInDays),
    issuedAt: Date.now(),
  }
}

/**
 * Save session to httpOnly cookie
 *
 * @param session - Session to save
 */
export async function saveSession(session: Session): Promise<void> {
  try {
    const cookieStore = await cookies()

    // Store session data as JSON
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), SESSION_COOKIE_OPTIONS)
  } catch (error) {
    console.error('Failed to save session:', error)
    throw new Error('Could not save session')
  }
}

/**
 * Get session from httpOnly cookie
 *
 * @returns Session or null if not found/expired
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) {
      return null
    }

    const session: Session = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (isSessionExpired(session.expiresAt)) {
      await deleteSession()
      return null
    }

    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

/**
 * Delete session from httpOnly cookie
 */
export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
  } catch (error) {
    console.error('Failed to delete session:', error)
    throw new Error('Could not delete session')
  }
}

/**
 * Validate session
 *
 * @returns Session if valid, null otherwise
 */
export async function validateSession(): Promise<Session | null> {
  const session = await getSession()

  if (!session) {
    return null
  }

  // Check if expired
  if (isSessionExpired(session.expiresAt)) {
    await deleteSession()
    return null
  }

  return session
}

/**
 * Require valid session (throws if not authenticated)
 *
 * Use in Server Components/Actions where auth is required.
 *
 * @throws Error if no valid session
 * @returns Session
 */
export async function requireSession(): Promise<Session> {
  const session = await validateSession()

  if (!session) {
    throw new Error('Authentication required')
  }

  return session
}

/**
 * Get current user from session
 *
 * @returns SessionUser or null
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session?.user || null
}

/**
 * Require current user (throws if not authenticated)
 *
 * @throws Error if no valid session
 * @returns SessionUser
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await requireSession()
  return session.user
}

/**
 * Check if user is authenticated
 *
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Refresh session expiry
 *
 * Updates the expiry time without changing other session data.
 */
export async function refreshSession(): Promise<void> {
  const session = await getSession()

  if (!session) {
    return
  }

  // Create new session with extended expiry
  const refreshedSession: Session = {
    ...session,
    expiresAt: calculateSessionExpiry(7),
  }

  await saveSession(refreshedSession)
}
