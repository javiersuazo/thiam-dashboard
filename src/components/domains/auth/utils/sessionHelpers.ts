/**
 * Session Helper Utilities
 *
 * Utilities for session management (client-side).
 */

import type { Session, SessionUser } from '@/components/features/session/types'
import { SESSION_STORAGE_KEY } from '@/components/features/session/types'
import { isSessionExpired, calculateSessionExpiry } from './authHelpers'

/**
 * Create a session object
 */
export function createSession(user: SessionUser, expiresInDays: number = 7): Session {
  return {
    user,
    expiresAt: calculateSessionExpiry(expiresInDays),
    issuedAt: Date.now(),
  }
}

/**
 * Load session from storage (client-side only)
 */
export function loadSessionFromStorage(): Session | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!stored) return null

    const session: Session = JSON.parse(stored)

    // Check if session is expired
    if (isSessionExpired(session.expiresAt)) {
      clearSessionFromStorage()
      return null
    }

    return session
  } catch (error) {
    console.error('Failed to load session from storage:', error)
    clearSessionFromStorage()
    return null
  }
}

/**
 * Save session to storage (client-side only)
 */
export function saveSessionToStorage(session: Session): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to save session to storage:', error)
  }
}

/**
 * Clear session from storage (client-side only)
 */
export function clearSessionFromStorage(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear session from storage:', error)
  }
}

/**
 * Check if session should be refreshed (within 24 hours of expiry)
 */
export function shouldRefreshSession(session: Session): boolean {
  const timeRemaining = session.expiresAt - Date.now()
  const oneDayInMs = 24 * 60 * 60 * 1000

  return timeRemaining < oneDayInMs && timeRemaining > 0
}

/**
 * Calculate session age in minutes
 */
export function getSessionAge(session: Session): number {
  const ageMs = Date.now() - session.issuedAt
  return Math.floor(ageMs / (60 * 1000))
}

/**
 * Check if session is fresh (less than 5 minutes old)
 */
export function isSessionFresh(session: Session): boolean {
  return getSessionAge(session) < 5
}
