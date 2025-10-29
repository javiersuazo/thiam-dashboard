'use server'

/**
 * OAuth Authentication Actions
 *
 * Server actions for handling OAuth flows (Google, Twitter, etc.)
 */

import { createServerClient } from '@/lib/api/server'
import type { ActionResult } from '@/types/actions'
import type { OAuthProvider } from '../types/auth.types'

/**
 * Initiate OAuth Flow
 *
 * Generates OAuth authorization URL and redirects user
 *
 * @param provider - OAuth provider (google, twitter)
 * @returns Authorization URL
 */
export async function initiateOAuthAction(
  provider: OAuthProvider
): Promise<ActionResult<{ url: string }>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Failed to initialize API client',
      }
    }

    // Get authorization URL from API
    const endpoint = `/auth/${provider}/login` as '/auth/google/login'
    const response = await api.GET(endpoint, {})

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Failed to initiate OAuth flow',
      }
    }

    // Backend returns { authUrl, state }
    const data = response.data as unknown as { authUrl?: string; state?: string }

    if (!data?.authUrl) {
      return {
        success: false,
        error: 'No authorization URL received',
      }
    }

    return {
      success: true,
      data: {
        url: data.authUrl,
      },
    }
  } catch (error) {
    console.error('OAuth initiation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate OAuth',
    }
  }
}

/**
 * Complete OAuth Flow (Callback Handler)
 *
 * Exchanges OAuth code for access token and creates session
 *
 * @param provider - OAuth provider
 * @param code - Authorization code from OAuth provider
 * @param state - State parameter for CSRF protection
 * @returns Session data
 */
export async function completeOAuthAction(
  provider: OAuthProvider,
  code: string,
  state?: string
): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    // Validate required parameters
    if (!code) {
      return {
        success: false,
        error: 'Missing authorization code',
      }
    }

    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Failed to initialize API client',
      }
    }

    // Exchange code for token and user data
    const endpoint = `/auth/${provider}/callback` as '/auth/google/callback'
    const response = await api.GET(endpoint, {
      params: {
        query: {
          code,
          ...(state && { state }),
        },
      },
    })

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'OAuth authentication failed',
      }
    }

    // Cast response to expected structure (OAuth returns similar to login)
    const oauthResponse = response.data as unknown as {
      user?: Record<string, unknown>
      token?: string
      refreshToken?: string
      expiresAt?: number | string
    }

    const { token: accessToken, refreshToken, expiresAt, user: apiUser } = oauthResponse

    if (!accessToken || !refreshToken || !expiresAt || !apiUser) {
      return {
        success: false,
        error: 'Invalid OAuth response - missing required fields',
      }
    }

    console.log('✅ OAuth authentication successful - storing tokens in Next.js httpOnly cookies')

    // Store tokens in Next.js httpOnly cookies (same as regular login)
    const expiresAtTimestamp = typeof expiresAt === 'string' ? parseInt(expiresAt) : expiresAt

    // Debug: Check if expiresAt is in seconds or milliseconds
    console.log('🔐 OAuth Token expiration debug:', {
      expiresAt,
      expiresAtTimestamp,
      now: Date.now(),
      isInMilliseconds: expiresAtTimestamp > Date.now(),
    })

    // If expiresAt is in seconds (Unix timestamp), convert to TTL in seconds
    // If expiresAt is in milliseconds, convert to seconds then calculate TTL
    let expiresInSeconds: number
    if (expiresAtTimestamp > Date.now()) {
      // expiresAt is in milliseconds (future timestamp > current ms)
      expiresInSeconds = Math.floor((expiresAtTimestamp - Date.now()) / 1000)
    } else {
      // expiresAt is in seconds (Unix timestamp)
      expiresInSeconds = expiresAtTimestamp - Math.floor(Date.now() / 1000)
    }

    console.log('🔐 OAuth Token TTL:', expiresInSeconds, 'seconds')

    const { setServerAuthTokens } = await import('@/lib/api/server')
    await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)

    // Return success - client will handle redirect
    return {
      success: true,
      data: { redirectUrl: '/' },
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth authentication failed',
    }
  }
}

/**
 * Link OAuth Account
 *
 * Links an OAuth provider to an existing authenticated account
 *
 * @param provider - OAuth provider to link
 * @param code - Authorization code
 * @returns Success status
 */
export async function linkOAuthAccountAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _provider: OAuthProvider,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _code: string
): Promise<ActionResult> {
  try {
    // TODO: Implement account linking when backend supports it
    // This would call an endpoint like POST /auth/{provider}/link

    return {
      success: false,
      error: 'OAuth account linking not yet implemented',
    }
  } catch (error) {
    console.error('OAuth link error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to link OAuth account',
    }
  }
}

/**
 * Unlink OAuth Account
 *
 * Removes OAuth provider connection from authenticated account
 *
 * @param provider - OAuth provider to unlink
 * @returns Success status
 */
export async function unlinkOAuthAccountAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _provider: OAuthProvider
): Promise<ActionResult> {
  try {
    // TODO: Implement account unlinking when backend supports it
    // This would call an endpoint like DELETE /auth/{provider}/unlink

    return {
      success: false,
      error: 'OAuth account unlinking not yet implemented',
    }
  } catch (error) {
    console.error('OAuth unlink error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unlink OAuth account',
    }
  }
}
