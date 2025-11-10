'use client'

/**
 * Email Verification Page Component
 *
 * Two modes:
 * 1. If token present: Verifies email and auto-logs in user
 * 2. If no token: Shows waiting message with resend functionality
 */

import React, { useState, useTransition, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'

import { resendVerificationAction, verifyEmailWithTokenAction } from '../actions'
import Button from '@/components/shared/ui/button/Button'
import { ChevronLeftIcon } from '@/icons'

export default function VerifyEmailPage() {
  const t = useTranslations('auth.verifyEmail')
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams?.get('email') || ''
  const token = searchParams?.get('token') || ''
  const [isPending, startTransition] = useTransition()
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // If token is present, verify email immediately
  useEffect(() => {
    if (token && !isVerifying) {
      setIsVerifying(true)

      startTransition(async () => {
        const result = await verifyEmailWithTokenAction(token)

        if (result.success) {
          // ✅ SECURITY: Tokens are stored in httpOnly cookies by the server action
          // No client-side token storage needed (XSS protection)
          // The server automatically sets the cookies in the response

          toast.success('Email verified successfully!')
          // Redirect immediately to /email-verified page with countdown
          router.push('/email-verified')
        } else {
          const errorMessage = 'error' in result ? result.error : 'Failed to verify email'
          toast.error(errorMessage || 'Failed to verify email')
          setIsVerifying(false)
        }
      })
    }
  }, [token, router, isVerifying])

  // Show loading state while verifying
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
          Verifying your email...
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we verify your email address
        </p>
      </div>
    )
  }

  const handleResendEmail = () => {
    if (!email) {
      toast.error('Email address not found')
      return
    }

    startTransition(async () => {
      try {
        const result = await resendVerificationAction({ email })

        if (result.success) {
          setResendSuccess(true)
          toast.success(t('resendSuccess'))

          // Reset success message after 5 seconds
          setTimeout(() => setResendSuccess(false), 5000)
        } else {
          toast.error(t('resendError'))
        }
      } catch (error) {
        console.error('Resend verification error:', error)
        toast.error(t('resendError'))
      }
    })
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          {t('backToSignIn')}
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Email Icon */}
          <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-brand-100 dark:bg-brand-900/20">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Title & Description */}
          <div className="mb-8">
            <h1 className="mb-3 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t('title')}
            </h1>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t('description')}
            </p>
            {email && (
              <p className="mt-2 text-sm font-medium text-gray-800 dark:text-white/90">
                {email}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 mb-6 border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <h3 className="mb-2 text-sm font-medium text-gray-800 dark:text-white/90">
              {t('nextSteps')}
            </h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside">
              <li>{t('step1')}</li>
              <li>{t('step2')}</li>
              <li>{t('step3')}</li>
            </ol>
          </div>

          {/* Resend Email */}
          <div className="p-4 mb-6 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {t('didntReceive')}
            </p>
            <Button
              onClick={handleResendEmail}
              disabled={isPending || resendSuccess}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {resendSuccess ? t('resent') : isPending ? t('resending') : t('resendButton')}
            </Button>
          </div>

          {/* Continue to Dashboard (Optional) */}
          <div className="text-center">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{t('continuePrompt')}</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center text-sm font-medium transition-colors text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {t('continueToDashboard')}
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
