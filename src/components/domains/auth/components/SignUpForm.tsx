'use client'

/**
 * Sign Up Form Component
 *
 * Production-ready sign-up form with:
 * - Form validation (Zod + react-hook-form)
 * - Server action integration
 * - Loading states
 * - Error handling
 * - Password strength indicator
 */

import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'

import { signupAction } from '../actions'
import { signupSchema, type SignUpFormData } from '../validation/authSchemas'
import {
  evaluatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from '../utils/passwordStrength'
import { OAuthButtonsGroup } from './OAuthButtons'

import Checkbox from '@/components/shared/form/input/Checkbox'
import Input from '@/components/shared/form/input/InputField'
import Label from '@/components/shared/form/Label'
import Button from '@/components/shared/ui/button/Button'
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '@/icons'

export default function SignUpForm() {
  const t = useTranslations('auth.signup')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      accountType: 'customer',
      terms: false,
    },
  })

  // Watch password for strength indicator
  const password = watch('password')
  const passwordStrength = password ? evaluatePasswordStrength(password) : null

  // Watch terms checkbox
  const terms = watch('terms')

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      try {
        setFormError(null)

        const result = await signupAction({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
          accountType: data.accountType,
          terms: data.terms,
        })

        if (!result.success) {
          setFormError(result.error)
          toast.error(result.error)
          return
        }

        // Success - session is saved on server
        toast.success(t('success'))
        router.push('/')
        router.refresh()
      } catch (error) {
        console.error('Sign up error:', error)
        const message = error instanceof Error ? error.message : t('errors.generic')
        setFormError(message)
        toast.error(message)
      }
    })
  })

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
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
            {/* OAuth Sign Up Buttons */}
            <OAuthButtonsGroup providers={['google']} disabled={isPending} />

            {/* Form Error Display */}
            {formError && (
              <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                <p className="text-sm text-error-600 dark:text-error-400">{formError}</p>
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="space-y-5">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      {t('firstName')}<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      {...register('firstName')}
                      type="text"
                      placeholder={t('firstNamePlaceholder')}
                      disabled={isPending}
                      className={errors.firstName ? 'border-error-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-error-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      {t('lastName')}<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      {...register('lastName')}
                      type="text"
                      placeholder={t('lastNamePlaceholder')}
                      disabled={isPending}
                      className={errors.lastName ? 'border-error-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-error-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label>
                    {t('email')}<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    disabled={isPending}
                    className={errors.email ? 'border-error-500' : ''}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-error-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <Label>{t('phone')}</Label>
                  <Input
                    {...register('phone')}
                    type="tel"
                    placeholder={t('phonePlaceholder')}
                    disabled={isPending}
                    className={errors.phone ? 'border-error-500' : ''}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-error-500">{errors.phone.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label>
                    {t('password')}<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      placeholder={t('passwordPlaceholder')}
                      type={showPassword ? 'text' : 'password'}
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

                  {/* Password Strength Indicator */}
                  {passwordStrength && password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Password strength:</span>
                        <span
                          className={`text-xs font-medium text-${getPasswordStrengthColor(passwordStrength.strength)}-600`}
                        >
                          {getPasswordStrengthLabel(passwordStrength.strength)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${getPasswordStrengthColor(passwordStrength.strength)}-500 transition-all duration-300`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label>
                    {t('confirmPassword')}<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder={t('confirmPasswordPlaceholder')}
                    disabled={isPending}
                    className={errors.confirmPassword ? 'border-error-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-error-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      className="w-5 h-5 mt-0.5"
                      checked={terms}
                      onChange={(checked) => setValue('terms', checked, { shouldValidate: true })}
                      disabled={isPending}
                    />
                    <p className="inline-block text-sm font-normal text-gray-500 dark:text-gray-400">
                      {t('agreeToTerms')}{' '}
                      <Link
                        href="/terms"
                        className="text-gray-800 dark:text-white/90 hover:underline"
                      >
                        {t('termsOfService')}
                      </Link>
                      {' '}{t('and')}{' '}
                      <Link
                        href="/privacy"
                        className="text-gray-800 dark:text-white/90 hover:underline"
                      >
                        {t('privacyPolicy')}
                      </Link>
                    </p>
                  </div>
                  {errors.terms && (
                    <p className="mt-1 text-xs text-error-500">{errors.terms.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <Button type="submit" className="w-full" size="sm" disabled={isPending}>
                    {isPending ? t('submitting') : t('submit')}
                  </Button>
                </div>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                {t('hasAccount')}{' '}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t('signIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
