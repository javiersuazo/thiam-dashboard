'use client'

/**
 * SessionTimeoutWarning Component
 *
 * Displays a warning modal when session is about to expire.
 * Gives users the option to extend their session or logout.
 *
 * Best Practices:
 * - Show warning 2-5 minutes before expiration
 * - Auto-logout when time runs out
 * - Allow user to extend session
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { refreshSessionAction, logoutAction } from '@/components/domains/auth'

interface SessionTimeoutWarningProps {
  /** Session expiry timestamp (milliseconds) */
  expiresAt: number | null

  /** Is user authenticated? */
  isAuthenticated: boolean

  /** Warning threshold in milliseconds (default: 5 minutes) */
  warningThreshold?: number

  /** Callback when session is extended */
  onExtend?: () => void

  /** Callback when user logs out */
  onLogout?: () => void
}

/**
 * Session Timeout Warning Modal
 *
 * @example
 * ```tsx
 * const { expiresAt, isAuthenticated } = useSession()
 *
 * <SessionTimeoutWarning
 *   expiresAt={expiresAt}
 *   isAuthenticated={isAuthenticated}
 *   onExtend={() => console.log('Session extended')}
 * />
 * ```
 */
export function SessionTimeoutWarning({
  expiresAt,
  isAuthenticated,
  warningThreshold = 5 * 60 * 1000, // 5 minutes
  onExtend,
  onLogout,
}: SessionTimeoutWarningProps) {
  const t = useTranslations('auth.session.timeout')
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isExtending, setIsExtending] = useState(false)

  /**
   * Format time remaining as MM:SS
   */
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  /**
   * Extend session
   */
  const handleExtendSession = useCallback(async () => {
    try {
      setIsExtending(true)
      const result = await refreshSessionAction()

      if (result.success) {
        setShowWarning(false)
        onExtend?.()
      }
    } catch (error) {
      console.error('Failed to extend session:', error)
    } finally {
      setIsExtending(false)
    }
  }, [onExtend])

  /**
   * Logout user
   */
  const handleLogout = useCallback(async () => {
    try {
      await logoutAction()
      onLogout?.()
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      router.push('/signin')
    }
  }, [router, onLogout])

  /**
   * Check if we should show warning and update countdown
   */
  useEffect(() => {
    if (!isAuthenticated || !expiresAt) {
      setShowWarning(false)
      return
    }

    const checkInterval = setInterval(() => {
      const now = Date.now()
      const remaining = expiresAt - now

      // Session expired - auto logout
      if (remaining <= 0) {
        setShowWarning(false)
        handleLogout()
        clearInterval(checkInterval)
        return
      }

      // Show warning if within threshold
      if (remaining <= warningThreshold) {
        setShowWarning(true)
        setTimeRemaining(remaining)
      } else {
        setShowWarning(false)
      }
    }, 1000) // Check every second

    return () => clearInterval(checkInterval)
  }, [isAuthenticated, expiresAt, warningThreshold, handleLogout])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <svg
              className="h-10 w-10 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('title')}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('message')}
          </p>
          <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatTime(timeRemaining)}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('autoLogout')}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isExtending}
            className="flex-1 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          >
            {t('logoutNow')}
          </button>
          <button
            type="button"
            onClick={handleExtendSession}
            disabled={isExtending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExtending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('extending')}
              </>
            ) : (
              t('stayLoggedIn')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
