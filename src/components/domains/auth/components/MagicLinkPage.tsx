'use client'

/**
 * Magic Link Verification Page Component
 *
 * Handles magic link authentication:
 * 1. Extracts token from URL
 * 2. Verifies token with backend
 * 3. Auto-logs in user on success
 * 4. Shows loading/success/error states
 */

import React, { useState, useTransition, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'

import { verifyPasswordlessLoginAction } from '../actions'
import Button from '@/components/shared/ui/button/Button'
import { ChevronLeftIcon } from '@/icons'

export default function MagicLinkPage() {
  const t = useTranslations('auth.magicLink')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token') || ''
  const [isPending, startTransition] = useTransition()
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Verify magic link token immediately
  useEffect(() => {
    if (token && !isVerifying && !errorMessage) {
      setIsVerifying(true)

      startTransition(async () => {
        const result = await verifyPasswordlessLoginAction({ token })

        if (result.success) {
          toast.success('Logged in successfully!')
          // Redirect immediately to dashboard
          router.push('/dashboard')
        } else {
          const error = 'error' in result ? result.error : 'Failed to verify magic link'
          toast.error(error || 'Failed to verify magic link')
          setErrorMessage(error || 'Failed to verify magic link')
          setIsVerifying(false)
        }
      })
    }
  }, [token, router, isVerifying, errorMessage])

  // Show loading state
  if (token && isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-brand-100 dark:bg-brand-900/20 animate-pulse">
          <svg
            className="w-8 h-8 text-brand-600 dark:text-brand-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
          Verifying magic link...
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we verify your magic link
        </p>
      </div>
    )
  }

  // Show error state
  if (errorMessage) {
    return (
      <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
        <div className="w-full max-w-md pt-10 mx-auto mb-5">
          <Link
            href="/signin"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Back to sign in
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-error-100 dark:bg-error-900/20">
              <svg
                className="w-8 h-8 text-error-600 dark:text-error-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              Verification Failed
            </h1>
            <p className="mb-6 text-sm text-center text-gray-600 dark:text-gray-400">
              {errorMessage}
            </p>
            <Link href="/passwordless" className="w-full">
              <Button variant="primary" className="w-full">
                Request New Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // No token provided
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to sign in
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gray-100 dark:bg-gray-800/50">
            <svg
              className="w-8 h-8 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </div>
          <h1 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
            Invalid Magic Link
          </h1>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            No verification token found in the URL. Please use the link from your email.
          </p>
          <Link href="/passwordless" className="w-full">
            <Button variant="primary" className="w-full">
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
