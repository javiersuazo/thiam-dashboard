'use client'

/**
 * OAuth Social Login Buttons
 *
 * Buttons for authenticating with OAuth providers (Google, Twitter, etc.)
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { initiateOAuthAction } from '../actions/oauthActions'
import type { OAuthProvider } from '../types/auth.types'

interface OAuthButtonProps {
  provider: OAuthProvider
  disabled?: boolean
  className?: string
}

/**
 * Google OAuth Button
 */
export function GoogleLoginButton({ disabled, className }: Omit<OAuthButtonProps, 'provider'>) {
  const t = useTranslations('auth.oauth')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await initiateOAuthAction('google')

      if (!result.success) {
        setError(result.error)
        return
      }

      // Redirect to Google OAuth consent page
      window.location.href = result.data.url
    } catch (err) {
      console.error('Google login error:', err)
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={disabled || loading}
        className={`inline-flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 ${className || ''}`}
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-gray-600 dark:border-t-gray-300" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{loading ? t('buttons.loading') : t('buttons.google')}</span>
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Twitter OAuth Button
 *
 * Note: Twitter OAuth implementation follows similar pattern to Google
 */
export function TwitterLoginButton({ disabled, className }: Omit<OAuthButtonProps, 'provider'>) {
  const t = useTranslations('auth.oauth')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTwitterLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await initiateOAuthAction('twitter')

      if (!result.success) {
        setError(result.error)
        return
      }

      // Redirect to Twitter OAuth consent page
      window.location.href = result.data.url
    } catch (err) {
      console.error('Twitter login error:', err)
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleTwitterLogin}
        disabled={disabled || loading}
        className={`inline-flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 ${className || ''}`}
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-gray-600 dark:border-t-gray-300" />
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )}
        <span>{loading ? t('buttons.loading') : t('buttons.twitter')}</span>
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * OAuth Buttons Group
 *
 * Shows all available OAuth login options
 */
interface OAuthButtonsGroupProps {
  providers?: OAuthProvider[]
  disabled?: boolean
  className?: string
}

export function OAuthButtonsGroup({
  providers = ['google'],
  disabled,
  className,
}: OAuthButtonsGroupProps) {
  const t = useTranslations('auth.oauth')

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            {t('divider')}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {providers.includes('google') && <GoogleLoginButton disabled={disabled} />}
        {providers.includes('twitter') && <TwitterLoginButton disabled={disabled} />}
      </div>
    </div>
  )
}
