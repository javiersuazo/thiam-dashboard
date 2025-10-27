'use client'

/**
 * PasskeySignInButton Component
 *
 * Handles WebAuthn/Passkey authentication for signin using discoverable credentials:
 * - Triggers WebAuthn authentication immediately (no email/username required)
 * - Authenticator presents all available credentials
 * - Server identifies user by credential ID
 * - Handles success/error states
 */

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/routing'
import { startAuthentication } from '@simplewebauthn/browser'
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser'
import { passkeyLoginBeginAction, passkeyLoginFinishAction } from '@/components/domains/auth/actions'
import Button from '@/components/shared/ui/button/Button'

interface PasskeySignInButtonProps {
  disabled?: boolean
}

// Check if WebAuthn is supported in the current browser
function isWebAuthnSupported(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return (
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  )
}

export default function PasskeySignInButton({ disabled }: PasskeySignInButtonProps) {
  const t = useTranslations('auth.signin')
  const router = useRouter()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  // Check browser support on mount (client-side only to avoid hydration errors)
  useEffect(() => {
    setIsSupported(isWebAuthnSupported())
  }, [])

  // Don't render button if browser doesn't support WebAuthn
  if (!isSupported) {
    return null
  }

  const handlePasskeyClick = async () => {
    console.log('🔐 PasskeySignInButton - handlePasskeyClick called')
    setIsAuthenticating(true)

    try {
      // Step 1: Get challenge from server (via Server Action)
      console.log('🔐 PasskeySignInButton - calling passkeyLoginBeginAction')
      const beginResult = await passkeyLoginBeginAction()

      if (!beginResult.success || !beginResult.data) {
        throw new Error((beginResult as { error?: string }).error || 'Failed to initiate authentication')
      }

      const options = beginResult.data.publicKey as PublicKeyCredentialRequestOptionsJSON

      // Step 2: Prompt user for biometric/security key
      console.log('🔐 PasskeySignInButton - calling startAuthentication (browser prompt)')
      const authResponse = await startAuthentication({ optionsJSON: options })
      console.log('🔐 PasskeySignInButton - startAuthentication completed')

      // Step 3: Send authentication response to server (via Server Action)
      console.log('🔐 PasskeySignInButton - calling passkeyLoginFinishAction')
      const finishResult = await passkeyLoginFinishAction(authResponse)

      if (!finishResult.success) {
        throw new Error((finishResult as { error?: string }).error || 'Authentication failed')
      }

      console.log('🔐 PasskeySignInButton - authentication successful')
      toast.success(t('passkeySuccess'))
      router.push('/')
      router.refresh()
    } catch (error) {
      console.log('🔐 PasskeySignInButton - authentication failed:', error)
      const errorMessage = error instanceof Error ? error.message : t('errors.passkeyFailed')
      toast.error(errorMessage)
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full h-full"
      size="sm"
      disabled={disabled || !isSupported || isAuthenticating}
      onClick={handlePasskeyClick}
    >
      <svg
        className="w-4 h-4 mr-2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="3" />
        <path d="M12 11v11" />
        <path d="m8 15 4 4 4-4" />
      </svg>
      {isAuthenticating ? t('submitting') : t('passkey')}
    </Button>
  )
}
