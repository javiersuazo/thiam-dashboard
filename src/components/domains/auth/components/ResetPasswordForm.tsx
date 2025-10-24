'use client'

/**
 * ResetPasswordForm Component
 *
 * Allows users to reset their password using an OTT token.
 * Shows password strength indicator and redirects to signin on success.
 */

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { resetPasswordAction } from '../actions'
import { resetPasswordEmailSchema, passwordRequirements } from '../validation/authSchemas'

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const passwordStrength = {
    minLength: passwordRequirements.minLength(newPassword),
    hasUppercase: passwordRequirements.hasUppercase(newPassword),
    hasLowercase: passwordRequirements.hasLowercase(newPassword),
    hasNumber: passwordRequirements.hasNumber(newPassword),
    hasSpecialChar: passwordRequirements.hasSpecialChar(newPassword),
  }

  const allRequirementsMet = Object.values(passwordStrength).every((req) => req)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Reset errors
    setError(null)
    setFieldErrors({})

    // Validate form
    const validation = resetPasswordEmailSchema.safeParse({ token, newPassword, confirmPassword })
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      setFieldErrors({
        newPassword: errors.newPassword?.[0] || '',
        confirmPassword: errors.confirmPassword?.[0] || '',
      })
      return
    }

    try {
      setLoading(true)

      const result = await resetPasswordAction({ token, newPassword, confirmPassword })

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(result.fieldErrors).map(([key, value]) => [key, value[0] || ''])
            )
          )
        } else {
          setError(result.error)
        }
        return
      }

      // Success! Redirect to signin
      router.push('/signin?reset=success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (value: string) => {
    setNewPassword(value)
    setFieldErrors((prev) => ({ ...prev, newPassword: '' }))
    setError(null)
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }))
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter a new password for your account.
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
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Reset Failed</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password Input */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New Password
          </label>
          <div className="relative mt-2">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={`block w-full rounded-lg border px-4 py-3 pr-10 shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                fieldErrors.newPassword
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              }`}
              placeholder="••••••••"
              disabled={loading}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.newPassword}
            </p>
          )}
        </div>

        {/* Password Requirements */}
        {newPassword && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Password Requirements
            </h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span
                  className={passwordStrength.minLength ? 'text-green-600' : 'text-gray-400'}
                >
                  {passwordStrength.minLength ? '✓' : '○'}
                </span>
                <span className={passwordStrength.minLength ? 'text-green-600' : 'text-gray-600'}>
                  At least 8 characters
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-400'}
                >
                  {passwordStrength.hasUppercase ? '✓' : '○'}
                </span>
                <span
                  className={passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-600'}
                >
                  One uppercase letter
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-400'}
                >
                  {passwordStrength.hasLowercase ? '✓' : '○'}
                </span>
                <span
                  className={passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-600'}
                >
                  One lowercase letter
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                  {passwordStrength.hasNumber ? '✓' : '○'}
                </span>
                <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-600'}>
                  One number
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}
                >
                  {passwordStrength.hasSpecialChar ? '✓' : '○'}
                </span>
                <span
                  className={passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-600'}
                >
                  One special character
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm New Password
          </label>
          <div className="mt-2">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className={`block w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                fieldErrors.confirmPassword
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !allRequirementsMet || !confirmPassword}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      {/* Back to Sign In */}
      <div className="text-center">
        <Link
          href="/signin"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
