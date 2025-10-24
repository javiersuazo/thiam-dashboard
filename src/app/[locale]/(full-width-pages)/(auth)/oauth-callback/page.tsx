'use client'

/**
 * OAuth Callback Page
 *
 * Handles OAuth redirect after user authorizes with provider (Google, Twitter, etc.)
 * Exchanges authorization code for access token and creates session.
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { completeOAuthAction } from '@/components/domains/auth/actions/oauthActions'
import type { OAuthProvider } from '@/components/domains/auth'
import { useSession } from '@/components/features/session'

type OAuthState = 'processing' | 'success' | 'error'

export default function OAuthCallbackPage() {
  const t = useTranslations('auth.oauth.callback')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useSession()

  const [state, setState] = useState<OAuthState>('processing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get OAuth parameters from URL
        const code = searchParams.get('code')
        const stateParam = searchParams.get('state')
        const provider = searchParams.get('provider') as OAuthProvider
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Check for OAuth provider error
        if (errorParam) {
          setState('error')
          setError(errorDescription || errorParam)
          return
        }

        // Validate required parameters
        if (!code) {
          setState('error')
          setError(t('errors.missingCode'))
          return
        }

        if (!provider || !['google', 'twitter'].includes(provider)) {
          setState('error')
          setError(t('errors.invalidProvider'))
          return
        }

        // Complete OAuth flow
        const result = await completeOAuthAction(provider, code, stateParam || undefined)

        if (!result.success) {
          setState('error')
          setError(result.error)
          return
        }

        // OAuth successful
        setState('success')

        // Small delay to show success message
        setTimeout(() => {
          // Redirect to dashboard (or callback URL if provided)
          const callbackUrl = searchParams.get('callbackUrl') || result.data.redirectUrl || '/'
          router.push(callbackUrl)
        }, 1500)
      } catch (err) {
        console.error('OAuth callback error:', err)
        setState('error')
        setError(err instanceof Error ? err.message : t('errors.generic'))
      }
    }

    handleCallback()
  }, [searchParams, router, t, login])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md text-center">
        {state === 'processing' && (
          <div className="space-y-6">
            {/* Loading Spinner */}
            <div className="flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-800 dark:border-t-brand-400" />
            </div>

            {/* Loading Message */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('processing.title')}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('processing.message')}
              </p>
            </div>
          </div>
        )}

        {state === 'success' && (
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
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
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('success.title')}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('success.message')}
              </p>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg
                  className="h-10 w-10 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('error.title')}
              </h1>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('error.subtitle')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => router.push('/signin')}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
              >
                {t('error.backToSignIn')}
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-750"
              >
                {t('error.tryAgain')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
