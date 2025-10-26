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

import React from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/routing'
import { useWebAuthn } from '@/hooks/useWebAuthn'
import Button from '@/components/shared/ui/button/Button'

interface PasskeySignInButtonProps {
  disabled?: boolean
}

export default function PasskeySignInButton({ disabled }: PasskeySignInButtonProps) {
  const t = useTranslations('auth.signin')
  const router = useRouter()
  const { authenticateWithPasskey, isAuthenticating, isSupported } = useWebAuthn()

  // Don't render button if browser doesn't support WebAuthn
  if (!isSupported) {
    return null
  }

  const handlePasskeyClick = async () => {
    try {
      // Trigger discoverable credential authentication (no email/username required!)
      // The authenticator will show all available credentials
      await authenticateWithPasskey()
      toast.success(t('passkeySuccess'))
      router.push('/')
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.passkeyFailed')
      toast.error(errorMessage)
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
