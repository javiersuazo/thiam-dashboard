'use client'

/**
 * EmailVerificationSent Component
 *
 * Shows after successful signup to inform user that they need to verify their email.
 * Provides option to resend verification email.
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

interface EmailVerificationSentProps {
  email: string
  onResend?: () => Promise<void>
}

export default function EmailVerificationSent({ email, onResend }: EmailVerificationSentProps) {
  const t = useTranslations('auth.emailVerification.sent')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    if (!onResend || resending) return

    try {
      setResending(true)
      await onResend()
      setResent(true)

      // Reset "resent" status after 5 seconds
      setTimeout(() => setResent(false), 5000)
    } catch (error) {
      console.error('Failed to resend verification:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg
            className="h-10 w-10 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('message', { email })}
        </p>
      </div>

      {/* Instructions */}
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
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
              {t('nextStepsTitle')}
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ol className="list-inside list-decimal space-y-1">
                <li>{t('step1')}</li>
                <li>{t('step2')}</li>
                <li>{t('step3')}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Resend Option */}
      {resent && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-center text-sm font-medium text-green-800 dark:text-green-400">
            {t('resentSuccess')}
          </p>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('didntReceive')}{' '}
          {onResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resent}
              className="font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {resending ? t('resending') : t('resendLink')}
            </button>
          )}
        </p>
      </div>

      {/* Back to Sign In */}
      <div className="text-center border-t border-gray-200 pt-6 dark:border-gray-700">
        <Link
          href="/signin"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          {t('backToSignIn')}
        </Link>
      </div>
    </div>
  )
}
