'use client'

/**
 * SMSRecoveryRequest Component
 *
 * Allows users to request an SMS recovery code to regain access
 * to their account if they've lost their 2FA authenticator.
 */

import { useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { requestSMSRecoveryAction } from '../actions'
import { smsRecoveryRequestSchema } from '../validation/authSchemas'

interface SMSRecoveryRequestProps {
  onCodeSent: (email: string) => void
  onCancel?: () => void
}

export default function SMSRecoveryRequest({ onCodeSent, onCancel }: SMSRecoveryRequestProps) {
  const t = useTranslations('auth.twoFactor.smsRecovery.request')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Reset errors
    setFieldError(null)

    // Validate email
    const validation = smsRecoveryRequestSchema.safeParse({ email })
    if (!validation.success) {
      const emailError = validation.error.flatten().fieldErrors.email?.[0]
      setFieldError(emailError || 'Invalid email format')
      return
    }

    try {
      setLoading(true)

      // Note: This always returns success to prevent email enumeration
      await requestSMSRecoveryAction({ email })

      // Always proceed to verification step
      onCodeSent(email)
    } catch {
      // Still proceed even on error (for security)
      onCodeSent(email)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setFieldError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Info Alert */}
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
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">{t('infoTitle')}</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-inside list-disc space-y-1">
                <li>{t('requirement1')}</li>
                <li>{t('requirement2')}</li>
                <li>{t('requirement3')}</li>
                <li>{t('requirement4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('email')}
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`block w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                fieldError
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              }`}
              placeholder="you@example.com"
              disabled={loading}
              autoFocus
            />
            {fieldError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldError}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              {t('cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !email}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('sending')}
              </>
            ) : (
              t('submit')
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
