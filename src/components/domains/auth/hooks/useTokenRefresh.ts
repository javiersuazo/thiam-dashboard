'use client'

/**
 * useTokenRefresh Hook
 *
 * Automatically refreshes access tokens before they expire.
 * Checks every minute and refreshes if token expires in less than 5 minutes.
 */

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentSessionAction, refreshTokenAction } from '../actions'
import { shouldRefreshToken } from '../utils/tokenUtils'
import { updateSessionTokens } from '@/lib/auth/session'

/**
 * Hook to automatically refresh tokens
 *
 * Usage:
 * ```tsx
 * function App() {
 *   useTokenRefresh()
 *   return <div>App content</div>
 * }
 * ```
 */
export function useTokenRefresh() {
  const router = useRouter()
  const refreshingRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkAndRefresh = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (refreshingRef.current) {
      return
    }

    try {
      // Get current session
      const sessionResult = await getCurrentSessionAction()

      if (!sessionResult.success || !sessionResult.data) {
        // No session, nothing to refresh
        return
      }

      const session = sessionResult.data
      if (!session.refreshToken || !session.expiresAt) {
        return
      }

      // Check if token should be refreshed (5 min before expiry)
      if (!shouldRefreshToken(session.expiresAt)) {
        return
      }

      console.log('🔄 Token expiring soon, refreshing...')
      refreshingRef.current = true

      // Refresh the token
      const refreshResult = await refreshTokenAction(session.refreshToken)

      if (refreshResult.success) {
        // Update session with new tokens
        await updateSessionTokens(
          refreshResult.data.token,
          refreshResult.data.refreshToken,
          refreshResult.data.expiresAt
        )

        console.log('✅ Token refreshed successfully')

        // Refresh the page to get new data with new token
        router.refresh()
      } else {
        // Refresh failed - token expired or invalid
        console.error('❌ Token refresh failed:', refreshResult.error || 'Unknown error')

        // Clear session and redirect to login
        // The session is expired, user needs to login again
        // Extract locale from current pathname
        const currentPath = window.location.pathname
        const localeMatch = currentPath.match(/^\/([a-z]{2})(\/|$)/)
        const locale = localeMatch ? localeMatch[1] : 'en'

        window.location.href = `/${locale}/signin?reason=session-expired`
      }
    } catch (error) {
      console.error('Token refresh error:', error)
    } finally {
      refreshingRef.current = false
    }
  }, [router])

  useEffect(() => {
    // Check immediately on mount
    checkAndRefresh()

    // Check every minute
    intervalRef.current = setInterval(checkAndRefresh, 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkAndRefresh])
}

/**
 * Hook to get token refresh status
 *
 * @returns Object with refresh status and manual refresh function
 */
export function useTokenRefreshStatus() {
  const router = useRouter()

  const manualRefresh = useCallback(async () => {
    try {
      const sessionResult = await getCurrentSessionAction()

      if (!sessionResult.success || !sessionResult.data) {
        return {
          success: false,
          error: 'No active session',
        }
      }

      const session = sessionResult.data
      if (!session.refreshToken) {
        return {
          success: false,
          error: 'No refresh token available',
        }
      }

      const refreshResult = await refreshTokenAction(session.refreshToken)

      if (refreshResult.success) {
        await updateSessionTokens(
          refreshResult.data.token,
          refreshResult.data.refreshToken,
          refreshResult.data.expiresAt
        )

        router.refresh()

        return {
          success: true,
          data: refreshResult.data,
        }
      }

      return {
        success: false,
        error: 'error' in refreshResult ? refreshResult.error : 'Refresh failed',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }, [router])

  return {
    manualRefresh,
  }
}
