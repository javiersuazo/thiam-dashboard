'use client'

/**
 * Session Provider - Client-Side Session Management
 *
 * Provides session context to the entire application.
 * Manages authentication state, session loading, and session updates.
 */

import React, { createContext, useCallback, useEffect, useState } from 'react'
import type { Session, SessionUser, SessionContextValue } from './types'
import {
  loadSessionFromStorage,
  saveSessionToStorage,
  clearSessionFromStorage,
  shouldRefreshSession,
} from '@/components/domains/auth'

/**
 * Session Context
 */
export const SessionContext = createContext<SessionContextValue | undefined>(undefined)

interface SessionProviderProps {
  children: React.ReactNode
  initialSession?: Session | null
}

/**
 * Session Provider Component
 *
 * Wraps the application to provide authentication context.
 * Loads session from storage and syncs with server.
 */
export function SessionProvider({ children, initialSession = null }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load session from storage on mount
   */
  useEffect(() => {
    const loadSession = () => {
      try {
        setIsLoading(true)
        setError(null)

        // If we have an initial session (from server), use it
        if (initialSession) {
          setSession(initialSession)
          saveSessionToStorage(initialSession)
          setIsLoading(false)
          return
        }

        // Otherwise, try to load from storage
        const storedSession = loadSessionFromStorage()
        setSession(storedSession)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load session:', err)
        setError('Failed to load session')
        setSession(null)
        setIsLoading(false)
      }
    }

    loadSession()
  }, [initialSession])

  /**
   * Auto-refresh session if needed (within 24 hours of expiry)
   */
  useEffect(() => {
    if (!session) return

    const checkRefresh = () => {
      if (shouldRefreshSession(session)) {
        // Trigger refresh - this will be handled by the refresh method
        console.log('Session should be refreshed')
      }
    }

    // Check every 5 minutes
    const interval = setInterval(checkRefresh, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [session])

  /**
   * Set session and save to storage
   */
  const login = useCallback((newSession: Session) => {
    try {
      setSession(newSession)
      saveSessionToStorage(newSession)
      setError(null)
    } catch (err) {
      console.error('Failed to save session:', err)
      setError('Failed to save session')
    }
  }, [])

  /**
   * Clear session and remove from storage
   */
  const logout = useCallback(() => {
    try {
      setSession(null)
      clearSessionFromStorage()
      setError(null)
    } catch (err) {
      console.error('Failed to clear session:', err)
      setError('Failed to clear session')
    }
  }, [])

  /**
   * Refresh session (extend expiry)
   * This will be called by auth server action
   */
  const refreshSession = useCallback((refreshedSession: Session) => {
    try {
      setSession(refreshedSession)
      saveSessionToStorage(refreshedSession)
      setError(null)
    } catch (err) {
      console.error('Failed to refresh session:', err)
      setError('Failed to refresh session')
    }
  }, [])

  /**
   * Update session user data (e.g., after profile update)
   */
  const updateUser = useCallback((updatedUser: Partial<SessionUser>) => {
    setSession((prev) => {
      if (!prev) return null

      const updated: Session = {
        ...prev,
        user: {
          ...prev.user,
          ...updatedUser,
        },
      }

      saveSessionToStorage(updated)
      return updated
    })
  }, [])

  const value: SessionContextValue = {
    session,
    user: session?.user || null,
    isAuthenticated: session !== null,
    isLoading,
    error,
    login,
    logout,
    refreshSession,
    updateUser,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
