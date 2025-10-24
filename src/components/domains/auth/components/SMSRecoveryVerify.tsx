'use client'

/**
 * SMSRecoveryVerify Component
 *
 * Verifies the SMS recovery code and disables 2FA to restore account access.
 */

import { useState, FormEvent } from 'react'
import { verifySMSRecoveryAction } from '../actions'
import { smsRecoveryVerifySchema } from '../validation/authSchemas'

interface SMSRecoveryVerifyProps {
  email: string
  onRecoveryComplete: () => void
  onBack?: () => void
}

export default function SMSRecoveryVerify({
  email,
  onRecoveryComplete,
  onBack,
}: SMSRecoveryVerifyProps) {
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
    const validation = smsRecoveryVerifySchema.safeParse({ email, code })
    if (!validation.success) {
      const codeError = validation.error.flatten().fieldErrors.code?.[0]
      setFieldError(codeError || 'Invalid code format')
      return
    }

    try {
      setLoading(true)

      const result = await verifySMSRecoveryAction({ email, code })

      if (!result.success) {
        setError(result.error)
        return
      }

      // Success! 2FA has been disabled
      onRecoveryComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify recovery code')
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Enter Recovery Code
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          We&apos;ve sent a 6-digit code to the phone number associated with{' '}
          <span className="font-medium">{email}</span>
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
                Verification Failed
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
            Recovery Code
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
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex">
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
                Important Notice
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Verifying this code will disable two-factor authentication on your account. You
                should re-enable 2FA after regaining access for better security.
              </p>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn&apos;t receive the code?{' '}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Try again
              </button>
            )}
          </p>
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
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying...
              </>
            ) : (
              'Verify & Disable 2FA'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
