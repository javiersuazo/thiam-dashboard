'use client'

/**
 * SessionExpired Component
 *
 * Shown when a user's session has expired.
 * Prompts them to sign in again with appropriate messaging.
 */

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

interface SessionExpiredProps {
  /**
   * Reason for expiration (optional)
   * - 'timeout': Session timed out from inactivity
   * - 'forced': Session was invalidated (e.g., password change, logout from another device)
   * - 'expired': Session naturally expired after max duration
   */
  reason?: 'timeout' | 'forced' | 'expired'

  /**
   * Custom redirect path after sign in
   */
  redirectTo?: string
}

/**
 * Session Expired Modal/Page
 *
 * @example
 * ```tsx
 * <SessionExpired reason="timeout" redirectTo="/dashboard" />
 * ```
 */
export function SessionExpired({ reason = 'expired', redirectTo }: SessionExpiredProps) {
  const t = useTranslations('auth.session.expired')

  const getReasonMessage = () => {
    switch (reason) {
      case 'timeout':
        return t('reasons.timeout')
      case 'forced':
        return t('reasons.forced')
      case 'expired':
      default:
        return t('reasons.expired')
    }
  }

  const signInHref = redirectTo ? `/signin?redirect=${encodeURIComponent(redirectTo)}` : '/signin'

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Icon */}
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
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{getReasonMessage()}</p>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">{t('securityTitle')}</h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">{t('securityMessage')}</p>
            </div>
          </div>
        </div>

        {/* Sign In Button */}
        <div>
          <Link
            href={signInHref}
            className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
          >
            {t('signInButton')}
          </Link>
        </div>

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('needHelp')}{' '}
            <Link
              href="/support"
              className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {t('contactSupport')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
