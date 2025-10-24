'use client'

/**
 * BackupCodeVerifyLogin Component
 *
 * Allows users to verify their identity using a backup code during login.
 * Used when they don't have access to their authenticator app.
 */

import { useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'

interface BackupCodeVerifyLoginProps {
  email: string
  onVerifySuccess: () => void
  onBack?: () => void
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>
}

export default function BackupCodeVerifyLogin({
  email,
  onVerifySuccess,
  onBack,
  onVerify,
}: BackupCodeVerifyLoginProps) {
  const t = useTranslations('auth.twoFactor.backupCodeLogin')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Reset errors
    setError(null)
    setFieldError(null)

    // Validate code format (backup codes are typically 8-12 characters alphanumeric)
    if (code.length < 8) {
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
    // Allow alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
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
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className={`block w-full rounded-lg border px-4 py-3 text-center text-xl font-mono tracking-wider shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                fieldError
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              }`}
              placeholder={t('codePlaceholder')}
              maxLength={12}
              disabled={loading}
              autoFocus
            />
            {fieldError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldError}</p>
            )}
          </div>
        </div>

        {/* Warning Box */}
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
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                {t('warningTitle')}
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                {t('warningMessage')}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              {t('back')}
            </button>
          )}
          <button
            type="submit"
            disabled={loading || code.length < 8}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      </form>
    </div>
  )
}
