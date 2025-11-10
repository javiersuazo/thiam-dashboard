'use client'

/**
 * PhoneVerificationCode Component
 *
 * Allows users to enter the SMS verification code sent to their phone.
 * Verifies the code and confirms phone ownership.
 */

import { useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { maskPhone } from '../utils/authHelpers'

interface PhoneVerificationCodeProps {
  /** Phone number that received the code (for display) */
  phone: string
  /** Callback when code is verified successfully */
  onVerifySuccess: () => void
  /** Optional callback to resend code */
  onResendCode?: () => void
  /** Optional back handler */
  onBack?: () => void
  /** Loading state (external) */
  loading?: boolean
}

export default function PhoneVerificationCode({
  phone,
  onVerifySuccess,
  onResendCode,
  onBack,
  loading: externalLoading,
}: PhoneVerificationCodeProps) {
  const t = useTranslations('auth.phoneVerification.verify')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  const isLoading = loading || externalLoading

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldError(null)

    // Validate code
    if (code.length !== 6) {
      setFieldError(t('errors.invalidCodeLength'))
      return
    }

    try {
      setLoading(true)

      const { verifyPhoneOTPAction } = await import('../actions')
      const result = await verifyPhoneOTPAction({ otp: code })

      if (!result.success) {
        setError(result.error)
        return
      }

      // Notify parent component
      onVerifySuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setCode(cleaned)
    setFieldError(null)
    setError(null)
  }

  const handleResend = async () => {
    if (!onResendCode || resending) return

    try {
      setResending(true)
      setError(null)
      await onResendCode()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.resendFailed'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('subtitle', { phone: maskPhone(phone) })}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                {t('errorTitle')}
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Code Input */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('code')}
          </label>
          <div className="mt-2">
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className={`block w-full rounded-lg border px-4 py-3 text-center text-2xl font-mono tracking-widest shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                fieldError
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              }`}
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
              autoFocus
            />
            {fieldError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldError}</p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-400"
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
            <p className="ml-3 text-sm text-blue-700 dark:text-blue-300">{t('infoMessage')}</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isLoading ? t('verifying') : t('submit')}
        </button>
      </form>

      {/* Alternative Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t('back')}
          </button>
        )}

        {onResendCode && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || isLoading}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {resending ? t('resending') : t('resend')}
          </button>
        )}
      </div>
    </div>
  )
}
