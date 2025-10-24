'use client'

/**
 * TwoFactorVerifyLogin Component
 *
 * Verifies 2FA code during login after successful password authentication.
 * Offers backup code and SMS recovery options.
 */

import { useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'

interface TwoFactorVerifyLoginProps {
  email: string
  onVerifySuccess: () => void
  onUseBackupCode?: () => void
  onUseSMSRecovery?: () => void
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>
}

export default function TwoFactorVerifyLogin({
  email,
  onVerifySuccess,
  onUseBackupCode,
  onUseSMSRecovery,
  onVerify,
}: TwoFactorVerifyLoginProps) {
  const t = useTranslations('auth.twoFactor.verifyLogin')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Reset errors
    setError(null)
    setFieldError(null)

    // Validate code format
    if (code.length !== 6) {
      setFieldError(t('errors.invalidCodeLength'))
      return
    }

    try {
      setLoading(true)

      const result = await onVerify(code)

      if (!result.success) {
        setError(result.error || t('errors.generic'))
        return
      }

      // Success! Complete login
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('subtitle', { email })}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start">
            <div className="flex-shrink-0">
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
            </div>
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
              disabled={loading}
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
              <p className="text-sm text-blue-700 dark:text-blue-300">{t('infoMessage')}</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t('verifying')}
            </>
          ) : (
            t('verify')
          )}
        </button>
      </form>

      {/* Alternative Options */}
      <div className="space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">{t('alternativeTitle')}</p>
        <div className="flex flex-col gap-2">
          {onUseBackupCode && (
            <button
              type="button"
              onClick={onUseBackupCode}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              {t('useBackupCode')}
            </button>
          )}
          {onUseSMSRecovery && (
            <button
              type="button"
              onClick={onUseSMSRecovery}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              {t('useSMSRecovery')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
