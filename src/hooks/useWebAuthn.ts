'use client'

/**
 * useWebAuthn Hook - WebAuthn/Passkey authentication
 *
 * Provides methods for:
 * - Registering new passkeys (biometrics, security keys)
 * - Authenticating with passkeys
 * - Managing user's passkeys
 *
 * @example Registration
 * ```tsx
 * const { registerPasskey, isRegistering } = useWebAuthn()
 *
 * async function handleRegister() {
 *   const credential = await registerPasskey('My iPhone Touch ID')
 *   if (credential) {
 *     toast.success('Passkey registered successfully!')
 *   }
 * }
 * ```
 *
 * @example Authentication
 * ```tsx
 * const { authenticateWithPasskey, isAuthenticating } = useWebAuthn()
 *
 * async function handleLogin() {
 *   const result = await authenticateWithPasskey(userId)
 *   if (result) {
 *     // User is now authenticated
 *     router.push('/dashboard')
 *   }
 * }
 * ```
 */

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser'
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'
import { api, setAuthToken } from '@/lib/api'

// Types for WebAuthn credential
export interface WebAuthnCredential {
  id: string
  userId: string
  attestationType?: string
  signCount: number
  transports?: string[]
  name?: string
  createdAt: string
  lastUsedAt?: string
}

// Check if WebAuthn is supported in the current browser
// Must check for SSR environment to avoid hydration errors
export function isWebAuthnSupported(): boolean {
  if (typeof window === 'undefined') {
    return false // SSR - no browser APIs available
  }

  return (
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  )
}

// Check if platform authenticator (Touch ID, Face ID, Windows Hello) is available
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false

  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export function useWebAuthn() {
  const queryClient = useQueryClient()
  const t = useTranslations('auth.passkey.errors')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [hasPlatformAuthenticator, setHasPlatformAuthenticator] = useState(false)

  // Check browser support on mount (client-side only to avoid hydration errors)
  useEffect(() => {
    setIsSupported(isWebAuthnSupported())

    // Check for platform authenticator (Touch ID, Face ID, Windows Hello)
    isPlatformAuthenticatorAvailable().then(setHasPlatformAuthenticator)
  }, [])

  // Fetch user's registered passkeys
  const {
    data: credentials = [],
    isLoading: isLoadingCredentials,
    refetch: refetchCredentials,
  } = useQuery({
    queryKey: ['webauthn-credentials'],
    queryFn: async () => {
      // @ts-expect-error - WebAuthn route not in generated OpenAPI schema
      const { data, error } = await api.GET('/auth/webauthn/credentials')

      if (error) {
        throw new Error(t('fetchFailed'))
      }

      return (data as WebAuthnCredential[]) || []
    },
    // Only fetch if user is authenticated
    enabled: typeof window !== 'undefined' && !!sessionStorage.getItem('token'),
  })

  // Register a new passkey
  const registerMutation = useMutation({
    // IMPORTANT: Disable retry for WebAuthn - browser prompts should never retry automatically
    retry: false,
    mutationFn: async (credentialName: string) => {
      setError(null)

      // Check browser support
      if (!isWebAuthnSupported()) {
        throw new Error(t('notSupported'))
      }

      // Step 1: Begin registration - get challenge from server
      // @ts-expect-error - WebAuthn route not in generated OpenAPI schema
      const { data: response, error: beginError } = await api.POST(
        '/auth/webauthn/register/begin'
      )

      if (beginError || !response) {
        throw new Error(t('registerBeginFailed'))
      }

      // Extract publicKey from response - API returns { publicKey: {...} }
      // but simplewebauthn expects just the inner object
      const options = (response as { publicKey: PublicKeyCredentialCreationOptionsJSON }).publicKey

      // Step 2: Prompt user for biometric/security key
      let attResp
      try {
        attResp = await startRegistration({
          optionsJSON: options,
        })
      } catch (err) {
        const error = err as Error & { name?: string }
        if (error.name === 'NotAllowedError') {
          throw new Error(t('registerCancelled'))
        }
        throw new Error(`${t('registerFailed')}${error.message ? ': ' + error.message : ''}`)
      }

      // Step 3: Send credential to server for verification
      const { data: credential, error: finishError } =
        // @ts-expect-error - WebAuthn route not in generated OpenAPI schema
        await api.POST('/auth/webauthn/register/finish', {
          body: {
            name: credentialName,
            response: attResp,
          },
        })

      if (finishError || !credential) {
        throw new Error(t('registerSaveFailed'))
      }

      return credential as WebAuthnCredential
    },
    onSuccess: () => {
      // Refresh credentials list
      queryClient.invalidateQueries({ queryKey: ['webauthn-credentials'] })
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  // Authenticate with passkey (discoverable credentials - no userId needed!)
  const authenticateMutation = useMutation({
    // IMPORTANT: Disable retry for WebAuthn - browser prompts should never retry automatically
    retry: false,
    mutationFn: async () => {
      console.log('🔐 useWebAuthn - authenticateMutation started')
      setError(null)

      // Check browser support
      if (!isWebAuthnSupported()) {
        throw new Error(t('authNotSupported'))
      }

      console.log('🔐 useWebAuthn - calling /passkey/login/begin')
      // Step 1: Begin authentication - get challenge from server (no userId required!)
      const { data: response, error: beginError} =
        // @ts-expect-error - WebAuthn route not in generated OpenAPI schema
        await api.POST('/passkey/login/begin')
      console.log('🔐 useWebAuthn - /passkey/login/begin response received')

      if (beginError || !response) {
        throw new Error(t('authBeginFailed'))
      }

      // Extract publicKey from response - API returns { publicKey: {...} }
      // but simplewebauthn expects just the inner object
      const options = (response as { publicKey: PublicKeyCredentialRequestOptionsJSON }).publicKey

      // Step 2: Prompt user for biometric/security key
      // The authenticator will show all available credentials
      let asseResp
      try {
        console.log('🔐 useWebAuthn - calling startAuthentication (browser prompt)')
        asseResp = await startAuthentication({
          optionsJSON: options,
        })
        console.log('🔐 useWebAuthn - startAuthentication completed')
      } catch (err) {
        console.error('🔐 useWebAuthn - Authentication Error:', err)
        const error = err as Error & { name?: string }

        if (error.name === 'NotAllowedError') {
          throw new Error(t('authCancelled'))
        }

        throw new Error(`${t('authFailed')}${error.message ? ': ' + error.message : ''}`)
      }

      // Step 3: Send authentication response to server
      // Server identifies the user by the credential ID in the response
      const { data: authResult, error: finishError } =
        // @ts-expect-error - WebAuthn route not in generated OpenAPI schema
        await api.POST('/passkey/login/finish', {
          body: {
            response: asseResp,
          },
        })

      if (finishError || !authResult) {
        throw new Error(t('authCompleteFailed'))
      }

      // Store access token
      const result = authResult as { token?: string }
      if (result.token) {
        setAuthToken(result.token)
      }

      return result
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  // Delete a passkey
  const deleteMutation = useMutation({
    mutationFn: async (credentialId: string) => {
      // @ts-expect-error - WebAuthn route not in generated OpenAPI schema
      const { error } = await api.DELETE('/auth/webauthn/credentials/{id}', {
        params: { path: { id: credentialId } },
      })

      if (error) {
        throw new Error(t('deleteFailed'))
      }
    },
    onSuccess: () => {
      // Refresh credentials list
      queryClient.invalidateQueries({ queryKey: ['webauthn-credentials'] })
    },
  })

  return {
    // Credentials
    credentials,
    isLoadingCredentials,
    refetchCredentials,

    // Registration
    registerPasskey: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,

    // Authentication
    authenticateWithPasskey: authenticateMutation.mutateAsync,
    isAuthenticating: authenticateMutation.isPending,

    // Credential management
    deletePasskey: deleteMutation.mutateAsync,
    isDeletingPasskey: deleteMutation.isPending,

    // Error state
    error,
    clearError: () => setError(null),

    // Browser support checks (from state to avoid hydration errors)
    isSupported,
    hasPlatformAuthenticator,
  }
}
