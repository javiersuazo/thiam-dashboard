'use client'

/**
 * Passwordless Login Form Component
 *
 * Modern passwordless authentication flow with:
 * - Email magic link or SMS code options
 * - Toggle between email and phone methods
 * - Loading states and error handling
 * - Success messages
 * - Full internationalization support
 */

import React, { useState, useTransition, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

import { requestPasswordlessEmailAction, requestPasswordlessPhoneAction } from '../actions'
import { mapApiErrorResponse, getErrorCode } from '../utils/errorMapping'

import Input from '@/components/shared/form/input/InputField'
import PhoneInput from '@/components/shared/form/input/PhoneInput'
import Label from '@/components/shared/form/Label'
import Button from '@/components/shared/ui/button/Button'
import { ChevronLeftIcon, EnvelopeIcon, CallIcon } from '@/icons'

const RESEND_COOLDOWN_SECONDS = 60

import type { Value as PhoneValue } from 'react-phone-number-input'

// Validation schemas
const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type EmailFormData = z.infer<typeof emailSchema>
type PhoneFormData = {
  phone?: PhoneValue
}

type Method = 'email' | 'phone'

export default function PasswordlessLoginForm() {
  const t = useTranslations('auth.passwordless')
  const tCommon = useTranslations('common')
  const tAuth = useTranslations('auth')
  const [isPending, startTransition] = useTransition()
  const [method, setMethod] = useState<Method>('email')
  const [success, setSuccess] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [lastSentData, setLastSentData] = useState<{ email?: string; phone?: string } | null>(null)

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  const phoneForm = useForm<PhoneFormData>({
    defaultValues: {
      phone: undefined,
    },
  })

  // Countdown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownSeconds])

  const onSubmitEmail = emailForm.handleSubmit((data) => {
    startTransition(async () => {
      try {
        const result = await requestPasswordlessEmailAction({ email: data.email })

        if (!result.success) {
          // Use error mapping for user-friendly messages
          const errorCode = result.errorData
            ? mapApiErrorResponse(result.errorData, 'generic')
            : getErrorCode(result.error || 'Unknown error', 'generic')

          // Translate the error
          const translatedError = errorCode.startsWith('common.')
            ? tCommon(errorCode.replace('common.', '') as 'errors.network')
            : tAuth(errorCode.replace('auth.', '') as 'errors.rateLimitExceeded')

          toast.error(translatedError)
          return
        }

        setSuccess(true)
        setLastSentData({ email: data.email })
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS)
        toast.success(t('success.email.toast'))
      } catch (error) {
        console.error('Passwordless email error:', error)
        toast.error(t('errors.unexpected'))
      }
    })
  })

  const onSubmitPhone = phoneForm.handleSubmit((data) => {
    startTransition(async () => {
      try {
        // Validate phone is provided
        if (!data.phone) {
          toast.error(t('errors.invalidPhone'))
          return
        }

        const result = await requestPasswordlessPhoneAction({ phone: data.phone })

        if (!result.success) {
          // Use error mapping for user-friendly messages
          const errorCode = result.errorData
            ? mapApiErrorResponse(result.errorData, 'generic')
            : getErrorCode(result.error || 'Unknown error', 'generic')

          // Translate the error
          const translatedError = errorCode.startsWith('common.')
            ? tCommon(errorCode.replace('common.', '') as 'errors.network')
            : tAuth(errorCode.replace('auth.', '') as 'errors.rateLimitExceeded')

          toast.error(translatedError)
          return
        }

        setSuccess(true)
        setLastSentData({ phone: data.phone })
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS)
        toast.success(t('success.phone.toast'))
      } catch (error) {
        console.error('Passwordless phone error:', error)
        toast.error(t('errors.unexpected'))
      }
    })
  })

  const handleResend = () => {
    if (cooldownSeconds > 0 || isPending) return

    startTransition(async () => {
      try {
        if (method === 'email' && lastSentData?.email) {
          const result = await requestPasswordlessEmailAction({ email: lastSentData.email })
          if (!result.success) {
            // Use error mapping for user-friendly messages
            const errorCode = result.errorData
              ? mapApiErrorResponse(result.errorData, 'generic')
              : getErrorCode(result.error || 'Unknown error', 'generic')

            const translatedError = errorCode.startsWith('common.')
              ? tCommon(errorCode.replace('common.', '') as 'errors.network')
              : tAuth(errorCode.replace('auth.', '') as 'errors.rateLimitExceeded')

            toast.error(translatedError)
            return
          }
          setCooldownSeconds(RESEND_COOLDOWN_SECONDS)
          toast.success(t('resend.success'))
        } else if (method === 'phone' && lastSentData?.phone) {
          const result = await requestPasswordlessPhoneAction({ phone: lastSentData.phone })
          if (!result.success) {
            // Use error mapping for user-friendly messages
            const errorCode = result.errorData
              ? mapApiErrorResponse(result.errorData, 'generic')
              : getErrorCode(result.error || 'Unknown error', 'generic')

            const translatedError = errorCode.startsWith('common.')
              ? tCommon(errorCode.replace('common.', '') as 'errors.network')
              : tAuth(errorCode.replace('auth.', '') as 'errors.rateLimitExceeded')

            toast.error(translatedError)
            return
          }
          setCooldownSeconds(RESEND_COOLDOWN_SECONDS)
          toast.success(t('resend.success'))
        }
      } catch (error) {
        console.error('Resend error:', error)
        toast.error(t('errors.unexpected'))
      }
    })
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
            {tCommon('back')}
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="mb-5 sm:mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full">
                  {method === 'email' ? (
                    <EnvelopeIcon className="w-8 h-8 fill-brand-500" />
                  ) : (
                    <CallIcon className="w-8 h-8 fill-brand-500" />
                  )}
                </div>
              </div>
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                {method === 'email' ? t('success.email.title') : t('success.phone.title')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {method === 'email' ? t('success.email.message') : t('success.phone.message')}
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleResend}
                disabled={cooldownSeconds > 0 || isPending}
                className="w-full"
              >
                {cooldownSeconds > 0
                  ? t('resend.cooldown', { seconds: cooldownSeconds })
                  : isPending
                    ? t('resend.sending')
                    : t('resend.button')}
              </Button>

              <Link href="/signin">
                <Button variant="outline" className="w-full">
                  {t('success.returnToSignIn')}
                </Button>
              </Link>

              <button
                onClick={() => {
                  setSuccess(false)
                  setCooldownSeconds(0)
                }}
                className="w-full text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {t('success.tryDifferentMethod')}
              </button>
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
          {tCommon('back')}
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t('title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>

          {/* Method Toggle */}
          <div className="flex gap-2 p-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMethod('email')}
              disabled={isPending}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
                method === 'email'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <EnvelopeIcon
                className={`w-4 h-4 ${method === 'email' ? 'fill-brand-500' : 'fill-current'}`}
              />
              {t('methodToggle.email')}
            </button>
            <button
              type="button"
              onClick={() => setMethod('phone')}
              disabled={isPending}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
                method === 'phone'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CallIcon
                className={`w-4 h-4 ${method === 'phone' ? 'fill-brand-500' : 'fill-current'}`}
              />
              {t('methodToggle.phone')}
            </button>
          </div>

          {/* Email Form */}
          {method === 'email' && (
            <form onSubmit={onSubmitEmail}>
              <div className="space-y-6">
                <div>
                  <Label>
                    {t('email.label')} <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...emailForm.register('email')}
                    type="email"
                    placeholder={t('email.placeholder')}
                    disabled={isPending}
                    className={emailForm.formState.errors.email ? 'border-error-500' : ''}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-error-500">
                      {t('errors.invalidEmail')}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('email.description')}
                  </p>
                </div>

                <Button type="submit" className="w-full" size="sm" disabled={isPending}>
                  {isPending ? t('email.submitting') : t('email.submit')}
                </Button>
              </div>
            </form>
          )}

          {/* Phone Form */}
          {method === 'phone' && (
            <form onSubmit={onSubmitPhone}>
              <div className="space-y-6">
                <div>
                  <Label>
                    {t('phone.label')} <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="phone"
                    control={phoneForm.control}
                    render={({ field, fieldState }) => (
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('phone.placeholder')}
                        disabled={isPending}
                        hasError={!!fieldState.error}
                        aria-label={t('phone.label')}
                        aria-describedby={fieldState.error ? 'phone-error' : undefined}
                      />
                    )}
                  />
                  {phoneForm.formState.errors.phone && (
                    <p id="phone-error" className="mt-1 text-xs text-error-500">
                      {t('errors.invalidPhone')}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('phone.description')}
                  </p>
                </div>

                <Button type="submit" className="w-full" size="sm" disabled={isPending}>
                  {isPending ? t('phone.submitting') : t('phone.submit')}
                </Button>
              </div>
            </form>
          )}

          {/* Alternative Sign In */}
          <div className="mt-6">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              {t('alternativeSignIn.message')}{' '}
              <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                {t('alternativeSignIn.link')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
