'use client'

/**
 * Two-Factor Verification Page Component
 *
 * Handles 2FA verification during login flow.
 * Uses TwoFactorVerifyLogin component with the verify2FALoginAction.
 */

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { toast } from 'sonner'
import TwoFactorVerifyLogin from './TwoFactorVerifyLogin'
import { verify2FALoginAction } from '../actions'
import { Link } from '@/i18n/routing'
import { ChevronLeftIcon } from '@/icons'

export default function TwoFactorVerification() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    // Get email from session storage (set during login)
    const loginEmail = sessionStorage.getItem('loginEmail')
    const challengeToken = sessionStorage.getItem('challengeToken')

    if (!challengeToken) {
      // No challenge token - redirect to login
      toast.error('Session expired. Please login again.')
      router.push('/signin')
      return
    }

    setEmail(loginEmail || '')
  }, [router])

  const handleVerify = async (code: string) => {
    try {
      const result = await verify2FALoginAction(code)

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Invalid verification code',
        }
      }

      return { success: true }
    } catch (error) {
      console.error('2FA verification error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      }
    }
  }

  const handleVerifySuccess = () => {
    // Clear challenge token and email from sessionStorage
    sessionStorage.removeItem('challengeToken')
    sessionStorage.removeItem('loginEmail')

    toast.success('Login successful!')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to sign in
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <TwoFactorVerifyLogin
          email={email}
          onVerify={handleVerify}
          onVerifySuccess={handleVerifySuccess}
        />
      </div>
    </div>
  )
}
