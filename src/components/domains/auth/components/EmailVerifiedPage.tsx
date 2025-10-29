'use client'

/**
 * Email Verified Success Page Component
 *
 * Shows after successful email verification.
 * Includes passkey onboarding prompt before redirecting to dashboard.
 */

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { startRegistration } from '@simplewebauthn/browser'
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser'
import { webAuthnRegisterBeginAction, webAuthnRegisterFinishAction } from '../actions'
import { isWebAuthnSupported } from '@/hooks/useWebAuthn'
import Button from '@/components/shared/ui/button/Button'

export default function EmailVerifiedPage() {
  const t = useTranslations('auth.emailVerified')
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [hasPlatformAuthenticator, setHasPlatformAuthenticator] = useState(false)
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(true)
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(10)

  // Check WebAuthn support on mount
  useEffect(() => {
    setIsSupported(isWebAuthnSupported())
    // Check for platform authenticator
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setHasPlatformAuthenticator)
        .catch(() => setHasPlatformAuthenticator(false))
    }
  }, [])

  // Auto-redirect countdown
  useEffect(() => {
    if (!showPasskeyPrompt && autoRedirectCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoRedirectCountdown(autoRedirectCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (autoRedirectCountdown === 0) {
      router.push('/')
    }
  }, [autoRedirectCountdown, showPasskeyPrompt, router])

  const handleSetupPasskey = async () => {
    setIsRegistering(true)
    try {
      // Step 1: Get challenge from server (via Server Action)
      console.log('🔐 EmailVerifiedPage - calling webAuthnRegisterBeginAction')
      const beginResult = await webAuthnRegisterBeginAction()

      if (!beginResult.success || !beginResult.data) {
        throw new Error((beginResult as { error?: string }).error || 'Failed to initiate passkey registration')
      }

      const options = beginResult.data.publicKey as PublicKeyCredentialCreationOptionsJSON

      // Step 2: Prompt user for biometric/security key
      console.log('🔐 EmailVerifiedPage - calling startRegistration (browser prompt)')
      const registrationResponse = await startRegistration({ optionsJSON: options })
      console.log('🔐 EmailVerifiedPage - startRegistration completed')

      // Step 3: Send registration response to server (via Server Action)
      console.log('🔐 EmailVerifiedPage - calling webAuthnRegisterFinishAction')
      const finishResult = await webAuthnRegisterFinishAction('My Device', registrationResponse)

      if (!finishResult.success) {
        throw new Error((finishResult as { error?: string }).error || 'Failed to complete passkey registration')
      }

      console.log('🔐 EmailVerifiedPage - passkey registration successful')
      toast.success(t('passkeySuccess'))
      setShowPasskeyPrompt(false)
      // Start auto-redirect countdown
    } catch (error) {
      console.log('Passkey setup cancelled or failed', error)
      const errorMessage = error instanceof Error ? error.message : t('passkeyError')
      toast.error(errorMessage)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleSkip = () => {
    setShowPasskeyPrompt(false)
    // Start auto-redirect countdown
  }

  const handleContinueToDashboard = () => {
    router.push('/')
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full px-4">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20">
          <svg
            className="w-10 h-10 text-green-600 dark:text-green-400"
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

        {/* Title */}
        <h1 className="mb-3 text-center font-semibold text-gray-800 text-title-md dark:text-white/90">
          {t('title')}
        </h1>
        <p className="mb-8 text-sm text-center text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>

        {/* Passkey Onboarding Prompt */}
        {showPasskeyPrompt && isSupported && (
          <div className="p-6 mb-6 border rounded-lg bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10 border-brand-200 dark:border-brand-800">
            {/* Passkey Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-brand-200 dark:bg-brand-800">
              <svg
                className="w-6 h-6 text-brand-700 dark:text-brand-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-lg font-semibold text-center text-gray-900 dark:text-white">
              {t('passkeyTitle')}
            </h2>
            <p className="mb-4 text-sm text-center text-gray-700 dark:text-gray-300">
              {hasPlatformAuthenticator ? t('passkeyDescriptionBiometric') : t('passkeyDescription')}
            </p>

            {/* Benefits */}
            <ul className="mb-6 space-y-2">
              <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                <svg
                  className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('benefit1')}
              </li>
              <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                <svg
                  className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('benefit2')}
              </li>
              <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                <svg
                  className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('benefit3')}
              </li>
            </ul>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleSetupPasskey}
                disabled={isRegistering}
                variant="primary"
                className="w-full"
              >
                {isRegistering ? t('settingUp') : t('setupPasskey')}
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full"
              >
                {t('skipForNow')}
              </Button>
            </div>
          </div>
        )}

        {/* Continue to Dashboard (after passkey setup or skip) */}
        {!showPasskeyPrompt && (
          <div className="text-center">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {t('redirecting', { seconds: autoRedirectCountdown })}
            </p>
            <Button
              onClick={handleContinueToDashboard}
              variant="primary"
              className="w-full"
            >
              {t('continueToDashboard')}
            </Button>
          </div>
        )}

        {/* No WebAuthn support */}
        {!isSupported && (
          <div className="text-center">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {t('noWebAuthnSupport')}
            </p>
            <Button
              onClick={handleContinueToDashboard}
              variant="primary"
              className="w-full"
            >
              {t('continueToDashboard')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
