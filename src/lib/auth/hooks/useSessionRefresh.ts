'use client'

/**
 * useSessionRefresh Hook
 *
 * Automatically refreshes session before expiration.
 * Runs in the background to keep users logged in during active use.
 *
 * Best Practices:
 * - Refresh when 80% of session lifetime has passed
 * - Only refresh if user is active (detected via user interaction)
 * - Stops refreshing when session is invalid
 */

import { useEffect, useRef, useCallback } from 'react'
import { refreshSessionAction } from '@/components/domains/auth'

interface UseSessionRefreshProps {
  /** Session expiry timestamp (milliseconds) */
  expiresAt: number | null

  /** Is user authenticated? */
  isAuthenticated: boolean

  /** Callback when session is refreshed */
  onRefresh?: () => void

  /** Callback when refresh fails */
  onError?: (error: string) => void

  /** Enable/disable auto-refresh (default: true) */
  enabled?: boolean
}

/**
 * Auto-refresh session before expiration
 *
 * @example
 * ```tsx
 * const { expiresAt, isAuthenticated } = useSession()
 *
 * useSessionRefresh({
 *   expiresAt,
 *   isAuthenticated,
 *   onRefresh: () => console.log('Session refreshed'),
 * })
 * ```
 */
export function useSessionRefresh({
  expiresAt,
  isAuthenticated,
  onRefresh,
  onError,
  enabled = true,
}: UseSessionRefreshProps) {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const isRefreshingRef = useRef(false)

  /**
   * Update last activity timestamp on user interaction
   */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
  }, [])

  /**
   * Check if user has been active recently (within last 5 minutes)
   */
  const isUserActive = useCallback(() => {
    const ACTIVITY_THRESHOLD = 5 * 60 * 1000 // 5 minutes
    return Date.now() - lastActivityRef.current < ACTIVITY_THRESHOLD
  }, [])

  /**
   * Refresh the session
   */
  const refreshSession = useCallback(async () => {
    if (isRefreshingRef.current) return
    if (!isAuthenticated) return
    if (!isUserActive()) return

    try {
      isRefreshingRef.current = true
      const result = await refreshSessionAction()

      if (result.success) {
        onRefresh?.()
      } else {
        onError?.(result.error)
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to refresh session')
    } finally {
      isRefreshingRef.current = false
    }
  }, [isAuthenticated, isUserActive, onRefresh, onError])

  /**
   * Schedule next refresh
   */
  const scheduleRefresh = useCallback(() => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    if (!enabled || !isAuthenticated || !expiresAt) return

    const now = Date.now()
    const timeUntilExpiry = expiresAt - now

    // If already expired, don't schedule
    if (timeUntilExpiry <= 0) return

    // Refresh when 80% of session lifetime has passed
    // This gives us a 20% buffer before actual expiration
    const sessionLifetime = timeUntilExpiry
    const refreshTriggerTime = sessionLifetime * 0.8

    // Ensure we don't set negative or zero timeouts
    const timeout = Math.max(refreshTriggerTime, 60000) // Min 1 minute

    refreshTimeoutRef.current = setTimeout(() => {
      refreshSession()
    }, timeout)
  }, [enabled, isAuthenticated, expiresAt, refreshSession])

  /**
   * Set up activity listeners
   */
  useEffect(() => {
    if (!enabled) return

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']

    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [enabled, updateActivity])

  /**
   * Schedule refresh when session changes
   */
  useEffect(() => {
    scheduleRefresh()

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [scheduleRefresh])
}
