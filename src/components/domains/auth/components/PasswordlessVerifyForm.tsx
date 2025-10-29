'use client'

/**
 * Passwordless Verification Form Component
 *
 * Handles magic link verification with:
 * - Automatic token verification on mount
 * - Loading states
 * - Error handling
 * - 2FA support
 * - Session creation
 * - Full internationalization support
 */

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'

import { verifyPasswordlessLoginAction } from '../actions'

import Button from '@/components/shared/ui/button/Button'
import { CheckCircleIcon, ErrorIcon } from '@/icons'

type VerificationState = 'loading' | 'success' | 'error' | 'expired'

export default function PasswordlessVerifyForm() {
  const t = useTranslations('auth.passwordless.verify')
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<VerificationState>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setState('error')
        setErrorMessage(t('invalid'))
        return
      }

      try {
        const result = await verifyPasswordlessLoginAction({ token })

        if (!result.success) {
          if (result.error?.includes('expired')) {
            setState('expired')
            setErrorMessage(t('expired'))
          } else {
            setState('error')
            setErrorMessage(result.error || t('invalid'))
          }
          toast.error(result.error || t('invalid'))
          return
        }

        // Check if 2FA is required
        if (result.data?.requiresTwoFactor) {
          // Store challengeToken in sessionStorage
          if (result.data.challengeToken) {
            sessionStorage.setItem('challengeToken', result.data.challengeToken)
          }
          toast.info('Please enter your verification code')
          router.push('/two-step-verification')
          return
        }

        // Success - session is saved on server
        setState('success')
        toast.success(t('success'))

        // Redirect to home after a brief delay
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1500)
      } catch (error) {
        console.error('Passwordless verification error:', error)
        setState('error')
        setErrorMessage(t('invalid'))
        toast.error(t('invalid'))
      }
    }

    verifyToken()
  }, [searchParams, router, t])

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="mb-5 sm:mb-8">
            <div className="flex justify-center mb-4">
              {state === 'loading' && (
                <div className="flex items-center justify-center w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {state === 'success' && (
                <div className="flex items-center justify-center w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full">
                  <CheckCircleIcon className="w-8 h-8 fill-success-500" />
                </div>
              )}
              {(state === 'error' || state === 'expired') && (
                <div className="flex items-center justify-center w-16 h-16 bg-error-100 dark:bg-error-900/30 rounded-full">
                  <ErrorIcon className="w-8 h-8 fill-error-500" />
                </div>
              )}
            </div>

            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {state === 'loading' && t('title')}
              {state === 'success' && t('success')}
              {state === 'error' && t('invalid')}
              {state === 'expired' && t('expired')}
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {state === 'loading' && t('subtitle')}
              {state === 'success' && 'Redirecting you to your dashboard...'}
              {(state === 'error' || state === 'expired') && errorMessage}
            </p>
          </div>

          {(state === 'error' || state === 'expired') && (
            <div className="space-y-4">
              <Link href="/passwordless">
                <Button className="w-full">{tCommon('back')}</Button>
              </Link>

              <Link
                href="/signin"
                className="block text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Return to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
