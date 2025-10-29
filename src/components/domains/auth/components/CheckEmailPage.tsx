'use client'

/**
 * Check Email Page Component
 *
 * Shows immediately after signup to inform users to check their email for verification.
 * Includes resend verification email functionality with rate limiting.
 */

import React, { useState, useTransition, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

import { resendVerificationAction } from '../actions'
import Button from '@/components/shared/ui/button/Button'
import { ChevronLeftIcon } from '@/icons'

export default function CheckEmailPage() {
  const t = useTranslations('auth.checkEmail')
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''
  const [isPending, startTransition] = useTransition()
  const [resendCooldown, setResendCooldown] = useState(0)

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendEmail = () => {
    if (!email) {
      toast.error('Email address not found')
      return
    }

    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before resending`)
      return
    }

    startTransition(async () => {
      try {
        const result = await resendVerificationAction({ email })

        if (result.success) {
          toast.success(t('resendSuccess'))
          setResendCooldown(60) // 60 second cooldown
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
            <h2 className="mb-3 text-sm font-medium text-gray-800 dark:text-white/90">
              {t('nextSteps')}
            </h2>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside dark:text-gray-400">
              <li>{t('step1')}</li>
              <li>{t('step2')}</li>
              <li>{t('step3')}</li>
            </ol>
          </div>

          {/* Spam folder notice */}
          <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-start">
              <svg
                className="flex-shrink-0 w-5 h-5 mt-0.5 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="ml-3 text-sm text-yellow-800 dark:text-yellow-200">
                {t('spamNotice')}
              </p>
            </div>
          </div>

          {/* Resend Email Button */}
          <div className="mb-6 text-center">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {t('didntReceive')}
            </p>
            <Button
              onClick={handleResendEmail}
              disabled={isPending || resendCooldown > 0}
              variant="outline"
            >
              {resendCooldown > 0
                ? t('resendCooldown', { seconds: resendCooldown })
                : t('resendButton')}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
    </div>
  )
}
