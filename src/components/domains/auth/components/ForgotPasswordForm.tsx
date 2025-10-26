'use client'

/**
 * ForgotPasswordForm Component
 *
 * Allows users to request a password reset via email or phone.
 * Sends OTT (One-Time Token) to the provided email address or SMS code to phone.
 */

import { useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { forgotPasswordAction, forgotPasswordPhoneAction } from '../actions'
import { forgotPasswordEmailSchema, forgotPasswordSMSSchema } from '../validation/authSchemas'
import { ChevronLeftIcon } from '@/icons'

type ResetMethod = 'email' | 'phone'

export default function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword')
  const [method, setMethod] = useState<ResetMethod>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Reset states
    setFieldError(null)
    setSuccess(false)

    if (method === 'email') {
      // Validate email
      const validation = forgotPasswordEmailSchema.safeParse({ email })
      if (!validation.success) {
        const emailError = validation.error.flatten().fieldErrors.email?.[0]
        setFieldError(emailError || 'Invalid email')
        return
      }

      try {
        setLoading(true)
        await forgotPasswordAction({ email })
        setSuccess(true)
      } catch {
        setSuccess(true) // Still show success for security
      } finally {
        setLoading(false)
      }
    } else {
      // Validate phone
      const validation = forgotPasswordSMSSchema.safeParse({ phone })
      if (!validation.success) {
        const phoneError = validation.error.flatten().fieldErrors.phone?.[0]
        setFieldError(phoneError || 'Invalid phone number')
        return
      }

      try {
        setLoading(true)
        await forgotPasswordPhoneAction({ phone })
        setSuccess(true)
      } catch {
        setSuccess(true) // Still show success for security
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setFieldError(null)
    setSuccess(false)
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    setFieldError(null)
    setSuccess(false)
  }

  const handleMethodChange = (newMethod: ResetMethod) => {
    setMethod(newMethod)
    setFieldError(null)
    setSuccess(false)
  }

  if (success) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
          <Link
            href="/signin"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            {t('backToSignIn')}
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                {method === 'email' ? (
                  <svg
                    className="h-10 w-10 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-10 w-10 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('success.title')}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {method === 'email'
                  ? t('success.emailMessage', { email })
                  : t('success.phoneMessage', { phone })}
              </p>
            </div>

            {/* Instructions */}
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
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">{t('success.nextSteps')}</h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    {method === 'email' ? (
                      <ol className="list-inside list-decimal space-y-1">
                        <li>{t('success.emailSteps.step1')}</li>
                        <li>{t('success.emailSteps.step2')}</li>
                        <li>{t('success.emailSteps.step3')}</li>
                        <li>{t('success.emailSteps.step4')}</li>
                      </ol>
                    ) : (
                      <ol className="list-inside list-decimal space-y-1">
                        <li>{t('success.phoneSteps.step1')}</li>
                        <li>{t('success.phoneSteps.step2')}</li>
                        <li>{t('success.phoneSteps.step3')}</li>
                        <li>{t('success.phoneSteps.step4')}</li>
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Sign In */}
            <div className="text-center">
              <Link
                href="/signin"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {t('backToSignIn')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to sign in
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t('title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>

          <div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Method Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('resetMethod')}
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleMethodChange('email')}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      method === 'email'
                        ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {t('methodEmail')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMethodChange('phone')}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      method === 'phone'
                        ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {t('methodPhone')}
                  </button>
                </div>
              </div>

              {/* Email Input */}
              {method === 'email' && (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t('email')}
                  </label>
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
                    placeholder={t('emailPlaceholder')}
                    disabled={loading}
                    autoFocus
                  />
                  {fieldError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldError}</p>
                  )}
                </div>
              )}

              {/* Phone Input */}
              {method === 'phone' && (
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t('phone')}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`block w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      fieldError
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                    }`}
                    placeholder={t('phonePlaceholder')}
                    disabled={loading}
                    autoFocus
                  />
                  {fieldError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fieldError}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (method === 'email' && !email) || (method === 'phone' && !phone)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </button>
            </form>

            {/* Back to Sign In */}
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t('backToSignIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
