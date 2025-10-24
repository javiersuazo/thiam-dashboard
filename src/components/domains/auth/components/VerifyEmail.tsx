'use client'

/**
 * VerifyEmail Component
 *
 * Verifies email address using OTT (One-Time Token) from email link.
 * Shows loading state, then success or error message.
 */

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'

interface VerifyEmailProps {
  token: string
  onVerify: (token: string) => Promise<{ success: boolean; error?: string }>
}

export default function VerifyEmail({ token, onVerify }: VerifyEmailProps) {
  const t = useTranslations('auth.emailVerification.verify')
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    async function verify() {
      try {
        const result = await onVerify(token)

        if (result.success) {
          setStatus('success')

          // Start countdown for auto-redirect
          let count = 5
          const interval = setInterval(() => {
            count -= 1
            setCountdown(count)

            if (count <= 0) {
              clearInterval(interval)
              router.push('/signin')
            }
          }, 1000)
        } else {
          setStatus('error')
          setError(result.error || t('errors.generic'))
        }
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : t('errors.generic'))
      }
    }

    verify()
  }, [token, onVerify, router, t])

  // Verifying State
  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('verifying')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('verifyingMessage')}
          </p>
        </div>
      </div>
    )
  }

  // Success State
  if (status === 'success') {
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
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('success.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('success.message')}
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            {t('success.redirecting', { seconds: countdown })}
          </p>
        </div>

        {/* Sign In Button */}
        <div className="flex justify-center">
          <Link
            href="/signin"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
          >
            {t('success.signInNow')}
          </Link>
        </div>
      </div>
    )
  }

  // Error State
  return (
    <div className="space-y-6">
      {/* Error Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-10 w-10 text-red-600 dark:text-red-400"
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

      {/* Error Message */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('error.title')}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {error || t('errors.generic')}
        </p>
      </div>

      {/* Error Details */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
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
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              {t('error.possibleReasonsTitle')}
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <ul className="list-inside list-disc space-y-1">
                <li>{t('error.reason1')}</li>
                <li>{t('error.reason2')}</li>
                <li>{t('error.reason3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
        >
          {t('error.trySignIn')}
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          {t('error.createNewAccount')}
        </Link>
      </div>
    </div>
  )
}
