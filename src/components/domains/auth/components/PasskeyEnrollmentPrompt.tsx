'use client'

/**
 * Passkey Enrollment Prompt
 *
 * Shows after successful email/password login to encourage passkey registration.
 * Based on Google/Apple/Microsoft best practices:
 * - "Faster & more secure" messaging (27% higher click-through than "easier")
 * - Non-intrusive - can be dismissed
 * - Shows once per session
 */

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useWebAuthn } from '@/hooks/useWebAuthn'
import Button from '@/components/shared/ui/button/Button'
import { CloseIcon } from '@/icons'

export default function PasskeyEnrollmentPrompt() {
  const [show, setShow] = useState(false)
  const { registerPasskey, isRegistering, isSupported } = useWebAuthn()

  useEffect(() => {
    // Check if we should show the prompt
    const hasSeenPrompt = sessionStorage.getItem('passkey_prompt_shown')
    const justLoggedIn = sessionStorage.getItem('just_logged_in')

    if (isSupported && justLoggedIn && !hasSeenPrompt) {
      // Show prompt after a brief delay
      setTimeout(() => setShow(true), 1000)
      sessionStorage.setItem('passkey_prompt_shown', 'true')
      sessionStorage.removeItem('just_logged_in')
    }
  }, [isSupported])

  const handleSetupPasskey = async () => {
    try {
      await registerPasskey('My Device')
      toast.success('Passkey created! Use Face ID or Touch ID to sign in next time.')
      setShow(false)
    } catch (error) {
      // User probably cancelled - that's OK
      console.log('Passkey setup cancelled', error)
      setShow(false)
    }
  }

  const handleDismiss = () => {
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <CloseIcon className="w-4 h-4" />
        </button>

        <div className="pr-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Sign in faster next time
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Use your face, fingerprint, or security key. It&apos;s faster and more secure than passwords.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleSetupPasskey}
              disabled={isRegistering}
              size="sm"
              className="flex-1"
            >
              {isRegistering ? 'Setting up...' : 'Set up passkey'}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
