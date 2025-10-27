'use client'

/**
 * Sign In Form Component
 *
 * Production-ready sign-in form with:
 * - Form validation (Zod + react-hook-form)
 * - Server action integration
 * - Loading states
 * - Error handling
 * - 2FA support
 */

import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'

import { loginAction } from '../actions'
import { loginSchema, type LoginFormData } from '../validation/authSchemas'
import { GoogleLoginButton } from './OAuthButtons'
import PasskeySignInButton from './PasskeySignInButton'
import { getErrorCode, mapApiErrorResponse } from '../utils/errorMapping'

import Checkbox from '@/components/shared/form/input/Checkbox'
import Input from '@/components/shared/form/input/InputField'
import Label from '@/components/shared/form/Label'
import Button from '@/components/shared/ui/button/Button'
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon, EnvelopeIcon } from '@/icons'

export default function SignInForm() {
  const t = useTranslations('auth.signin')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  // NOTE: Conditional UI (passkey autofill) has been DISABLED to prevent double popup issues
  // When conditional UI is active and user clicks the passkey button, both prompts appear
  // The WebAuthn browser ceremony cannot be aborted once started
  // For better UX, we only trigger passkey auth when user explicitly clicks the button
  //
  // If you want to re-enable conditional UI in the future:
  // 1. The passkey button must be hidden when conditional UI is active
  // 2. OR use a different flow where conditional UI is the ONLY way to authenticate with passkeys

  // Watch rememberMe checkbox
  const rememberMe = watch('rememberMe') ?? false

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      try {
        const result = await loginAction({
          email: data.email,
          password: data.password,
        })

        if (!result.success) {
          // Use structured error data if available, otherwise fall back to message parsing
          const errorCode = result.errorData
            ? mapApiErrorResponse(result.errorData, 'signin')
            : getErrorCode(result.error, 'signin')

          // Extract the translation based on the error code pattern
          const translatedError = errorCode.startsWith('common.')
            ? tCommon(errorCode.replace('common.', '') as 'errors.network')
            : t(errorCode.replace('auth.signin.', '') as 'errors.generic')
          toast.error(translatedError)
          return
        }

        // Check if 2FA is required
        if (result.data.requiresTwoFactor) {
          // Store challengeToken and email in sessionStorage (client-side only)
          if (result.data.challengeToken) {
            sessionStorage.setItem('challengeToken', result.data.challengeToken)
          }
          if (result.data.email) {
            sessionStorage.setItem('loginEmail', result.data.email)
          }
          toast.info('Please enter your verification code')
          router.push('/two-step-verification')
          return
        }

        // Success - session is saved on server
        toast.success(t('success'))

        // Mark that user just logged in (for passkey enrollment prompt)
        sessionStorage.setItem('just_logged_in', 'true')

        router.push('/')
        router.refresh()
      } catch (error) {
        console.error('Sign in error:', error)
        // Handle unexpected errors (network errors, etc.)
        const errorCode = getErrorCode(
          error instanceof Error ? error.message : 'Unknown error',
          'signin'
        )
        const translatedError = errorCode.startsWith('common.')
          ? tCommon(errorCode.replace('common.', '') as 'errors.network')
          : t(errorCode.replace('auth.signin.', '') as 'errors.generic')
        toast.error(translatedError)
      }
    })
  })

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
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
            {/* Quick Sign In Options - Better Layout */}
            <div className="mb-6 space-y-3">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t('quickSignIn')}
              </p>

              {/* Google OAuth Button - Full Width */}
              <GoogleLoginButton disabled={isPending} />

              {/* Passkey & Magic Link - Responsive Grid */}
              {/* If passkey not supported (returns null), magic link takes full width */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PasskeySignInButton disabled={isPending} />

                <Link href="/passwordless" className="block">
                  <Button variant="outline" className="w-full h-full" size="sm" disabled={isPending}>
                    <EnvelopeIcon className="w-4 h-4 mr-2 fill-current" />
                    {t('magicLink')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white dark:bg-gray-900 dark:text-gray-400">
                  {t('orContinueWith')}
                </span>
              </div>
            </div>

            <form onSubmit={onSubmit}>
              <div className="space-y-6">
                {/* Email Field with Passkey Autofill */}
                <div>
                  <Label>
                    {t('email')} <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    disabled={isPending}
                    className={errors.email ? 'border-error-500' : ''}
                    autoComplete="username webauthn"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-error-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <Label>
                    {t('password')} <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('passwordPlaceholder')}
                      disabled={isPending}
                      className={errors.password ? 'border-error-500' : ''}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-error-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={rememberMe}
                      onChange={(checked) => setValue('rememberMe', checked, { shouldValidate: true })}
                      disabled={isPending}
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      {t('rememberMe')}
                    </span>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>

                {/* Submit Button */}
                <div>
                  <Button type="submit" className="w-full" size="sm" disabled={isPending}>
                    {isPending ? t('submitting') : t('submit')}
                  </Button>
                </div>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                {t('noAccount')}{' '}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t('signUp')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
