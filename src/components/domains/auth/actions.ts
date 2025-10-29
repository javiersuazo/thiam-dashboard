'use server'

/**
 * Auth Server Actions
 *
 * Next.js Server Actions for authentication flows.
 * These run on the server and handle API calls + session management.
 */

import { redirect } from 'next/navigation'
import {
  createServerClient,
  createPublicClient,
  clearServerAuthTokens
} from '@/lib/api/server'
import { debugToken } from '@/lib/auth/jwt'
import type { ActionResult } from '@/types/actions'

/**
 * Calculate token TTL in seconds from expiresAt timestamp
 * Handles both milliseconds and seconds timestamps
 */
function calculateTokenTTL(expiresAt: string | number): number {
  const expiresAtTimestamp = typeof expiresAt === 'string' ? parseInt(expiresAt, 10) : expiresAt
  const nowMs = Date.now()
  const nowSec = Math.floor(nowMs / 1000)

  // Calculate TTL in seconds
  // API might return expiresAt in milliseconds or seconds
  if (expiresAtTimestamp > nowMs) {
    // expiresAt is in milliseconds (future timestamp > current ms)
    return Math.floor((expiresAtTimestamp - nowMs) / 1000)
  } else if (expiresAtTimestamp > nowSec) {
    // expiresAt is in seconds (Unix timestamp)
    return expiresAtTimestamp - nowSec
  } else {
    // Token already expired or invalid format - default to 15 minutes
    console.warn('⚠️ Invalid expiresAt, using default 15 min:', { expiresAtTimestamp, nowSec, nowMs })
    return 900
  }
}
import type {
  LoginCredentials,
  SignUpData,
  TwoFactorSetupResponse,
  TwoFactorEnableResponse,
  TwoFactorDisableResponse,
  BackupCodesResponse,
  TwoFactorVerifyData,
  SMSRecoveryRequestData,
  SMSRecoveryVerifyData,
  ForgotPasswordEmailData,
  ForgotPasswordSMSData,
  ResetPasswordEmailData,
  VerifyEmailData,
  VerifyEmailResponse,
  ResendVerificationData,
} from './types/auth.types'
import {
  loginSchema,
  signupSchema,
  twoFactorVerifySchema,
  smsRecoveryRequestSchema,
  smsRecoveryVerifySchema,
  forgotPasswordEmailSchema,
  forgotPasswordSMSSchema,
  resetPasswordEmailSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from './validation/authSchemas'

/**
 * Login Action
 *
 * Handles user login with email/password.
 * Creates session and redirects to dashboard on success.
 */
export async function loginAction(
  credentials: LoginCredentials
): Promise<ActionResult<{ requiresTwoFactor: boolean; challengeToken?: string; email?: string }>> {
  try {
    // Validate input
    const validation = loginSchema.safeParse(credentials)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid credentials',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    // Call API (public endpoint - no auth required)
    const api = createPublicClient()

    console.log('🔐 Login Action - API Configuration:', {
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      endpoint: '/auth/login',
      fullUrl: `$'http://localhost:8080'}/v1/auth/login`,
    })

    const response = await api.POST('/auth/login', {
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    })

    console.log('🔐 Login Action - Full Response:', {
      hasData: !!response.data,
      hasError: !!response.error,
      fullResponse: response,
    })

    console.log('🔐 Response Data Details:', JSON.stringify(response.data, null, 2))

    // Handle API errors
    if (response.error) {
      console.error('Login API error:', response.error)

      // Extract structured error if available
      const apiError = response.error as Record<string, unknown>
      const errorData = {
        message: (apiError.message as string) || 'Invalid email or password',
        key: apiError.key as string | undefined,
        code: apiError.code as number | undefined,
      }

      return {
        success: false,
        error: errorData.message,
        errorData, // Pass structured error for better error mapping
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'Login failed',
      }
    }

    // API returns either:
    // 1. Standard login: { token, refreshToken, expiresAt, totpEnabled, user }
    // 2. 2FA challenge: { totpRequired: true, challengeToken, expiresAt }
    const loginResponse = response.data as {
      token?: string
      refreshToken?: string
      totpRequired?: boolean
      challengeToken?: string
      expiresAt?: string | number
      totpEnabled?: boolean
      user?: Record<string, unknown>
      message?: string
    }

    console.log('🔐 Login Response:', {
      hasToken: !!loginResponse.token,
      hasChallengeToken: !!loginResponse.challengeToken,
      totpRequired: loginResponse.totpRequired,
      message: loginResponse.message,
    })

    // Check if 2FA challenge is required
    if (loginResponse.totpRequired || loginResponse.challengeToken) {
      console.log('✅ 2FA required - challengeToken received, returning to client')
      // Return challengeToken to client so it can store in sessionStorage
      // (Server Actions can't access sessionStorage - it's browser-only)
      return {
        success: true,
        data: {
          requiresTwoFactor: true,
          challengeToken: loginResponse.challengeToken,
          email: credentials.email,
        },
      }
    }

    // Standard login - get token (not accessToken)
    const { token: accessToken, refreshToken, expiresAt, user: apiUser } = loginResponse

    if (!accessToken) {
      return {
        success: false,
        error: 'No access token received from server',
      }
    }

    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token received from server',
      }
    }

    if (!expiresAt) {
      return {
        success: false,
        error: 'No expiration time received from server',
      }
    }

    if (!apiUser) {
      return {
        success: false,
        error: 'No user data received from server',
      }
    }

    console.log('✅ Login successful - storing tokens in Next.js httpOnly cookies')

    // Debug: Log token in development
    if (process.env.NODE_ENV === 'development') {
      debugToken(accessToken)
    }

    // ✅ SECURITY: Store tokens in Next.js httpOnly cookies
    // This works for both:
    // 1. Next.js SSR/Server Actions (access via cookies() in server components)
    // 2. Next.js client-side API calls (cookies sent automatically to Next.js API routes)
    // 3. Server Actions can add Authorization header when calling Go API

    // Calculate token TTL properly
    const expiresInSeconds = calculateTokenTTL(expiresAt)
    console.log('📅 Token TTL calculated:', expiresInSeconds, 'seconds')

    const { setServerAuthTokens } = await import('@/lib/api/server')
    await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)

    // ✅ Return success - client will handle redirect
    // This ensures cookies are set in response, browser stores them, THEN client navigates
    return {
      success: true,
      data: {
        requiresTwoFactor: false,
      },
    }
  } catch (error) {
    console.error('Login action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Verify 2FA Login Action
 *
 * Verifies 2FA code after successful password authentication.
 * Completes login flow by returning access token.
 */
export async function verify2FALoginAction(
  challengeToken: string,
  code: string
): Promise<ActionResult<{ requiresTwoFactor: boolean }>> {
  try {
    if (!challengeToken) {
      return {
        success: false,
        error: 'No challenge token found. Please login again.',
      }
    }

    // Call API
    const api = createPublicClient()

    console.log('🔐 Verifying 2FA code')

    const response = await api.POST('/auth/2fa/verify', {
      body: {
        challengeToken,
        code,
      },
    })

    console.log('🔐 2FA Verify Response:', {
      hasData: !!response.data,
      hasError: !!response.error,
    })

    // Handle API errors
    if (response.error) {
      console.error('2FA verify error:', response.error)
      return {
        success: false,
        error: 'Invalid verification code',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: '2FA verification failed',
      }
    }

    // API returns: { token, refreshToken, expiresAt, user }
    const verifyResponse = response.data as {
      token?: string
      refreshToken?: string
      expiresAt?: number | string
      user?: Record<string, unknown>
    }

    const { token: accessToken, refreshToken, expiresAt, user: apiUser } = verifyResponse

    if (!accessToken) {
      return {
        success: false,
        error: 'No access token received',
      }
    }

    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token received',
      }
    }

    if (!expiresAt) {
      return {
        success: false,
        error: 'No expiration time received',
      }
    }

    if (!apiUser) {
      return {
        success: false,
        error: 'No user data received',
      }
    }

    console.log('✅ 2FA verified successfully - storing tokens in Next.js httpOnly cookies')

    // Store tokens in Next.js httpOnly cookies (same as regular login)
    const expiresInSeconds = calculateTokenTTL(expiresAt)
    const { setServerAuthTokens } = await import('@/lib/api/server')
    await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)

    // Return success - client will handle redirect
    return {
      success: true,
      data: {
        requiresTwoFactor: false,
      },
    }
  } catch (error) {
    console.error('2FA verify action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Signup Action
 *
 * Handles new user registration.
 * Creates account, creates session, and redirects on success.
 */
export async function signupAction(
  data: SignUpData
): Promise<ActionResult<{ userId: string; emailVerified: boolean }>> {
  try {
    // Validate input
    const validation = signupSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid signup data',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    // Call API (public endpoint - no auth required)
    const api = createPublicClient()

    // Step 1: Create the user
    const createUserResponse = await api.POST('/users/', {
      body: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
      },
    })

    // Handle user creation errors
    if (createUserResponse.error) {
      console.error('User creation error:', createUserResponse.error)

      // Extract structured error if available
      const apiError = createUserResponse.error as Record<string, unknown>
      const errorData = {
        message: (apiError.message as string) || 'Failed to create account',
        key: apiError.key as string | undefined,
        code: apiError.code as number | undefined,
      }

      return {
        success: false,
        error: errorData.message,
        errorData, // Pass structured error for better error mapping
      }
    }

    if (!createUserResponse.data) {
      return {
        success: false,
        error: 'User creation failed',
      }
    }

    // Get user data from registration response
    const userData = createUserResponse.data as {
      id?: string
      email?: string
      emailVerified?: boolean
    }

    console.log('✅ Signup successful - verification email sent')

    // Return success with user data - NO AUTO-LOGIN
    // User will be redirected to check their email
    return {
      success: true,
      data: {
        userId: userData.id || 'unknown',
        emailVerified: userData.emailVerified || false
      },
    }
  } catch (error) {
    console.error('Signup action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Logout Action
 *
 * Clears session and redirects to login page.
 */
export async function logoutAction(): Promise<void> {
  try {
    // Clear JWT tokens from cookies
    await clearServerAuthTokens()
  } catch (error) {
    console.error('Logout action error:', error)
  }

  // Always redirect to login, even if deletion failed
  redirect('/signin')
}

/**
 * Refresh Token Action
 *
 * Exchanges refresh token for new access token.
 * Returns new token data to update the session.
 */
export async function refreshTokenAction(
  refreshToken: string
): Promise<
  ActionResult<{ token: string; refreshToken: string; expiresAt: number }>
> {
  try {
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token provided',
      }
    }

    const api = createPublicClient()

    console.log('🔄 Refreshing access token...')

    const response = await api.POST('/auth/refresh', {
      body: {
        refreshToken,
      },
    })

    if (response.error) {
      console.error('Token refresh error:', response.error)
      return {
        success: false,
        error: 'Session expired. Please login again.',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'Token refresh failed',
      }
    }

    const refreshResponse = response.data as {
      token?: string
      refreshToken?: string
      expiresAt?: number | string
    }

    const { token, refreshToken: newRefreshToken, expiresAt } = refreshResponse

    if (!token || !newRefreshToken || !expiresAt) {
      return {
        success: false,
        error: 'Invalid refresh response',
      }
    }

    console.log('✅ Token refreshed successfully')

    const expiresAtTimestamp =
      typeof expiresAt === 'string' ? parseInt(expiresAt) : expiresAt

    return {
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken,
        expiresAt: expiresAtTimestamp,
      },
    }
  } catch (error) {
    console.error('Refresh token action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh token',
    }
  }
}

/**
 * Refresh Session Action
 *
 * Extends the current session expiry.
 * Used for keeping users logged in during active use.
 */
export async function refreshSessionAction(): Promise<ActionResult> {
  try {
    const { refreshSession } = await import('@/lib/auth/session')

    await refreshSession()

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Refresh session action error:', error)
    return {
      success: false,
      error: 'Failed to refresh session',
    }
  }
}

/**
 * Get Current Session Action
 *
 * Retrieves the current session (for client-side hydration).
 */
export async function getCurrentSessionAction() {
  try {
    const { getSession } = await import('@/lib/auth/session')
    const session = await getSession()

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error('Get current session error:', error)
    return {
      success: false,
      data: null,
    }
  }
}

// ============================================================================
// Two-Factor Authentication Actions
// ============================================================================

/**
 * Setup TOTP 2FA Action
 *
 * Generates TOTP secret and QR code for authenticator app.
 * Requires authentication.
 */
export async function setup2FAAction(): Promise<ActionResult<TwoFactorSetupResponse>> {
  try {
    console.log('🔐 Setup 2FA Action - Starting...')
    const api = await createServerClient()
    if (!api) {
      console.error('❌ Setup 2FA Action - No API client (not authenticated)')
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    console.log('✅ Setup 2FA Action - API client created, calling /auth/2fa/setup')
    const response = await api.POST('/auth/2fa/setup', {})

    if (response.error) {
      console.error('2FA setup error:', response.error)
      return {
        success: false,
        error: response.error.message || 'Failed to setup 2FA',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: '2FA setup failed',
      }
    }

    return {
      success: true,
      data: response.data as unknown as TwoFactorSetupResponse,
    }
  } catch (error) {
    console.error('Setup 2FA action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Enable TOTP 2FA Action
 *
 * Verifies TOTP code and enables 2FA, returns backup codes.
 * Requires authentication.
 */
export async function enable2FAAction(
  data: TwoFactorVerifyData
): Promise<ActionResult<TwoFactorEnableResponse>> {
  try {
    // Validate input
    const validation = twoFactorVerifySchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid verification code',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Failed to initialize API client',
      }
    }

    const response = await api.POST('/auth/2fa/enable', {
      body: {
        code: data.code,
      },
    })

    if (response.error) {
      console.error('2FA enable error:', response.error)
      return {
        success: false,
        error: response.error.message || 'Invalid verification code',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: '2FA enable failed',
      }
    }

    return {
      success: true,
      data: response.data as unknown as TwoFactorEnableResponse,
    }
  } catch (error) {
    console.error('Enable 2FA action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Disable TOTP 2FA Action
 *
 * Disables 2FA for the authenticated user.
 * Requires authentication.
 */
export async function disable2FAAction(): Promise<ActionResult<TwoFactorDisableResponse>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Failed to initialize API client',
      }
    }

    const response = await api.POST('/auth/2fa/disable', {})

    if (response.error) {
      console.error('2FA disable error:', response.error)
      return {
        success: false,
        error: response.error.message || 'Failed to disable 2FA',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: '2FA disable failed',
      }
    }

    return {
      success: true,
      data: response.data as unknown as TwoFactorDisableResponse,
    }
  } catch (error) {
    console.error('Disable 2FA action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Regenerate Backup Codes Action
 *
 * Generates new backup codes for 2FA recovery.
 * Requires authentication.
 */
export async function regenerateBackupCodesAction(): Promise<ActionResult<BackupCodesResponse>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Failed to initialize API client',
      }
    }

    const response = await api.POST('/auth/2fa/backup-codes', {})

    if (response.error) {
      console.error('Backup codes regeneration error:', response.error)
      return {
        success: false,
        error: response.error.message || 'Failed to regenerate backup codes',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'Backup codes regeneration failed',
      }
    }

    return {
      success: true,
      data: response.data as unknown as BackupCodesResponse,
    }
  } catch (error) {
    console.error('Regenerate backup codes action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Request SMS Recovery Action
 *
 * Sends an SMS code to recover 2FA access.
 * Public endpoint (doesn't require authentication).
 */
export async function requestSMSRecoveryAction(
  data: SMSRecoveryRequestData
): Promise<ActionResult> {
  try {
    // Validate input
    const validation = smsRecoveryRequestSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid email address',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const api = createPublicClient()

    // Intentionally ignoring response to prevent email enumeration
    await api.POST('/auth/2fa/recovery/sms', {
      body: {
        email: data.email,
      },
    })

    // Always return success to avoid email enumeration
    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Request SMS recovery action error:', error)
    // Still return success to avoid email enumeration
    return {
      success: true,
      data: undefined,
    }
  }
}

/**
 * Verify SMS Recovery Action
 *
 * Verifies SMS code and disables 2FA for account recovery.
 * Public endpoint (doesn't require authentication).
 */
export async function verifySMSRecoveryAction(
  data: SMSRecoveryVerifyData
): Promise<ActionResult<TwoFactorDisableResponse>> {
  try {
    // Validate input
    const validation = smsRecoveryVerifySchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid email or verification code',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const api = createPublicClient()

    const response = await api.POST('/auth/2fa/recovery/verify', {
      body: {
        email: data.email,
        code: data.code,
      },
    })

    if (response.error) {
      console.error('SMS recovery verify error:', response.error)
      return {
        success: false,
        error: response.error.message || 'Invalid verification code',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'SMS recovery verification failed',
      }
    }

    return {
      success: true,
      data: response.data as unknown as TwoFactorDisableResponse,
    }
  } catch (error) {
    console.error('Verify SMS recovery action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

// ============================================================================
// Password Reset Actions
// ============================================================================

/**
 * Forgot Password Action
 *
 * Sends a password reset email with OTT token.
 * Public endpoint (doesn't require authentication).
 */
export async function forgotPasswordAction(
  data: ForgotPasswordEmailData
): Promise<ActionResult> {
  try {
    // Validate input
    const validation = forgotPasswordEmailSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid email address',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const api = createPublicClient()

    // Intentionally ignoring response to prevent email enumeration
    await api.POST('/auth/password/forgot', {
      body: {
        email: data.email,
      },
    })

    // Always return success to avoid email enumeration
    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Forgot password action error:', error)
    // Still return success to avoid email enumeration
    return {
      success: true,
      data: undefined,
    }
  }
}

/**
 * Forgot Password via Phone Action
 *
 * Requests password reset via SMS to registered phone number.
 * Always returns success to prevent phone enumeration.
 */
export async function forgotPasswordPhoneAction(
  data: ForgotPasswordSMSData
): Promise<ActionResult> {
  try {
    // Validate input
    const validation = forgotPasswordSMSSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid phone number',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const api = createPublicClient()

    // Intentionally ignoring response to prevent phone enumeration
    await api.POST('/auth/password/forgot/phone', {
      body: {
        phone: data.phone,
      },
    })

    // Always return success to avoid phone enumeration
    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Forgot password phone action error:', error)
    // Still return success to avoid phone enumeration
    return {
      success: true,
      data: undefined,
    }
  }
}

/**
 * Reset Password Action
 *
 * Resets password using OTT token and creates new session.
 * Auto-logs in the user after successful password reset.
 * Public endpoint (doesn't require authentication).
 */
export async function resetPasswordAction(
  data: ResetPasswordEmailData
): Promise<ActionResult<{ userId: string }>> {
  try {
    // Validate input
    const validation = resetPasswordEmailSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid reset data',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const api = createPublicClient()

    // Note: API only accepts 'token' and 'password' fields
    // We must NOT send confirmPassword or newPassword fields
    const requestBody: { token: string; newPassword: string } = {
      token: data.token,
      newPassword: data.newPassword,
    }

    console.log('🔐 Reset Password - Request Body:', JSON.stringify(requestBody))

    // Cast to match OpenAPI schema type (even though we're sending different fields)
    // Schema expects: { token: string, newPassword: string }
    // API actually wants: { token: string, password: string }
    const response = await api.POST('/auth/password/reset', {
      body: {
        token: requestBody.token,
        newPassword: requestBody.newPassword,
      },
    })

    console.log('🔐 Reset Password - Full Response:', {
      hasData: !!response.data,
      hasError: !!response.error,
      responseData: response.data,
      responseError: response.error,
    })

    if (response.error) {
      console.error('Reset password API error:', response.error)
      return {
        success: false,
        error: response.error.message || 'Invalid or expired reset token',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'Password reset failed',
      }
    }

    console.log('🔐 Reset Password - Response Data:', JSON.stringify(response.data, null, 2))

    // API returns: { token, refreshToken, expiresAt, user }
    const resetResponse = response.data as {
      token?: string
      refreshToken?: string
      expiresAt?: number | string
      totpEnabled?: boolean
      user?: Record<string, unknown>
    }

    const { token: accessToken, refreshToken, expiresAt, user: apiUser } = resetResponse

    console.log('🔐 Reset Password - Token Check:', {
      hasToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasExpiresAt: !!expiresAt,
      hasUser: !!apiUser,
    })

    if (!accessToken) {
      console.error('🔐 No token found in response:', resetResponse)
      return {
        success: false,
        error: 'No access token received',
      }
    }

    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token received',
      }
    }

    if (!expiresAt) {
      return {
        success: false,
        error: 'No expiration time received',
      }
    }

    if (!apiUser) {
      return {
        success: false,
        error: 'No user data received',
      }
    }

    console.log('✅ Password reset successful - storing tokens in Next.js httpOnly cookies')

    // Store tokens in Next.js httpOnly cookies (same as regular login)
    const expiresInSeconds = calculateTokenTTL(expiresAt)
    const { setServerAuthTokens } = await import('@/lib/api/server')
    await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)

    // Return success - client will handle redirect
    return {
      success: true,
      data: {
        userId: (apiUser.id as string) || (apiUser.ID as string) || '',
      },
    }
  } catch (error) {
    console.error('Reset password action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Verify Email Action
 *
 * Verifies user's email address using OTT (One-Time Token).
 *
 * @todo Backend API route /auth/email/verify needs to be implemented
 */
export async function verifyEmailAction(
  data: VerifyEmailData
): Promise<ActionResult<VerifyEmailResponse>> {
  try {
    // Validate input
    const validation = verifyEmailSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid verification token',
      }
    }

    // TODO: Uncomment when backend API route is ready
    /*
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Failed to initialize API client',
      }
    }

    const response = await api.POST('/auth/email/verify', {
      body: {
        token: data.token,
      },
    })

    if (response.error) {
      console.error('Verify email API error:', response.error)
      return {
        success: false,
        error: response.error.message || 'Invalid or expired verification token',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'Email verification failed',
      }
    }

    const verifyResponse = response.data as unknown as VerifyEmailResponse

    return {
      success: true,
      data: verifyResponse,
    }
    */

    // Temporary mock response until backend is ready
    return {
      success: false,
      error: 'Email verification API not yet implemented',
    }
  } catch (error) {
    console.error('Verify email action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Resend Verification Email Action
 *
 * Sends a new verification email to the user.
 * Always returns success to prevent email enumeration.
 *
 * @todo Backend API route /auth/email/resend needs to be implemented
 */
export async function resendVerificationAction(
  data: ResendVerificationData
): Promise<ActionResult> {
  try {
    // Validate input
    const validation = resendVerificationSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid email address',
      }
    }

    // TODO: Uncomment when backend API route is ready
    /*
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Failed to initialize API client',
      }
    }

    await api.POST('/auth/email/resend', {
      body: {
        email: data.email,
      },
    })
    */

    // Always return success to prevent email enumeration
    // Even if the email doesn't exist or verification already sent
    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Resend verification action error:', error)
    // Still return success for security (prevent email enumeration)
    return {
      success: true,
      data: undefined,
    }
  }
}

/**
 * Verify Email With Token Action
 *
 * Verifies email address using the token from the verification link.
 * Auto-logs in the user by saving the session tokens returned by the backend.
 */
export async function verifyEmailWithTokenAction(
  token: string
): Promise<ActionResult<{ userId: string; token: string }>> {
  try {
    if (!token) {
      return {
        success: false,
        error: 'Verification token is required',
      }
    }

    // Call public API endpoint
    const api = createPublicClient()

    const response = await api.GET('/auth/email/verify', {
      params: {
        query: { token },
      },
    })

    if (response.error) {
      console.error('Email verification error:', response.error)

      const apiError = response.error as Record<string, unknown>
      const errorMessage = (apiError.message as string) || 'Failed to verify email'

      return {
        success: false,
        error: errorMessage,
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'No data returned from verification',
      }
    }

    // Extract session data from response
    const verificationData = response.data as {
      token?: string
      refreshToken?: string
      expiresAt?: number | string
      user?: {
        id?: string
        email?: string
        firstName?: string
        lastName?: string
        emailVerified?: boolean
        totpEnabled?: boolean
      }
    }

    const { token: accessToken, refreshToken, expiresAt, user: apiUser } = verificationData

    if (!accessToken || !refreshToken || !expiresAt || !apiUser) {
      return {
        success: false,
        error: 'Invalid verification response',
      }
    }

    console.log('✅ Email verified successfully - storing tokens in Next.js httpOnly cookies')

    // Store tokens in Next.js httpOnly cookies (same as regular login)
    const expiresAtTimestamp = typeof expiresAt === 'string' ? parseInt(expiresAt) : expiresAt

    // Debug: Check if expiresAt is in seconds or milliseconds
    console.log('🔐 Token expiration debug:', {
      expiresAt,
      expiresAtTimestamp,
      now: Date.now(),
      nowInSeconds: Math.floor(Date.now() / 1000),
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

    console.log('🔐 Token TTL:', expiresInSeconds, 'seconds')

    const { setServerAuthTokens } = await import('@/lib/api/server')
    await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)

    // Return success - client will handle redirect
    return {
      success: true,
      data: {
        userId: apiUser.id || '',
        token: accessToken,
      },
    }
  } catch (error) {
    console.error('Verify email with token action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify email',
    }
  }
}

/**
 * Request Passwordless Login by Email Action
 *
 * Sends a magic link to the user's email for passwordless authentication.
 * Always returns success to prevent email enumeration.
 */
export async function requestPasswordlessEmailAction(data: {
  email: string
}): Promise<ActionResult> {
  try {
    // Basic email validation
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return {
        success: false,
        error: 'Invalid email address',
      }
    }

    const api = createPublicClient()

    // Send request but don't check response (always return success for security)
    // @ts-expect-error - passwordless endpoints not yet in generated types
    await api.POST('/auth/passwordless/email', {
      body: {
        email: data.email,
      },
    })

    // Always return success to prevent email enumeration
    // Even if there's an error or email doesn't exist
    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Request passwordless email action error:', error)
    // Still return success for security (prevent email enumeration)
    return {
      success: true,
      data: undefined,
    }
  }
}

/**
 * Request Passwordless Login by Phone Action
 *
 * Sends a 6-digit code to the user's phone for passwordless authentication.
 * Always returns success to prevent phone enumeration.
 */
export async function requestPasswordlessPhoneAction(data: {
  phone: string
}): Promise<ActionResult> {
  try {
    // Basic phone validation
    if (!data.phone || !/^\+[1-9]\d{1,14}$/.test(data.phone)) {
      return {
        success: false,
        error: 'Invalid phone number format. Use E.164 format (e.g., +14155552671)',
      }
    }

    const api = createPublicClient()

    // Send request but don't check response (always return success for security)
    // @ts-expect-error - passwordless endpoints not yet in generated types
    await api.POST('/auth/passwordless/phone', {
      body: {
        phone: data.phone,
      },
    })

    // Always return success to prevent phone enumeration
    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Request passwordless phone action error:', error)
    // Still return success for security (prevent phone enumeration)
    return {
      success: true,
      data: undefined,
    }
  }
}

/**
 * Passkey Login Begin Action
 *
 * Initiates passkey authentication flow.
 * Returns challenge options for the client to present to the authenticator.
 */
export async function passkeyLoginBeginAction(): Promise<ActionResult<{ publicKey: unknown }>> {
  try {
    const api = createPublicClient()

    console.log('🔐 Passkey Login Begin - Calling /passkey/login/begin')

    // Passkey route not in generated OpenAPI schema - use any for now
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await (api as any).POST('/passkey/login/begin')) as {
      error?: Record<string, unknown>
      data?: { publicKey: unknown }
    }

    if (response.error) {
      console.error('Passkey login begin error:', response.error)
      return {
        success: false,
        error: 'Failed to initiate passkey authentication',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'No challenge data received',
      }
    }

    const challengeData = response.data

    return {
      success: true,
      data: challengeData,
    }
  } catch (error) {
    console.error('Passkey login begin action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Passkey Login Finish Action
 *
 * Completes passkey authentication with the authenticator response.
 * Creates session and returns tokens.
 */
export async function passkeyLoginFinishAction(
  authResponse: unknown
): Promise<ActionResult<{ requiresTwoFactor: boolean }>> {
  try {
    const api = createPublicClient()

    console.log('🔐 Passkey Login Finish - Calling /passkey/login/finish')

    // Passkey route not in generated OpenAPI schema - use any for now
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await (api as any).POST('/passkey/login/finish', {
      body: {
        response: authResponse,
      },
    })) as {
      error?: Record<string, unknown>
      data?: {
        token?: string
        refreshToken?: string
        expiresAt?: string | number
        user?: Record<string, unknown>
      }
    }

    if (response.error) {
      console.error('Passkey login finish error:', response.error)
      return {
        success: false,
        error: 'Authentication failed',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'No authentication data received',
      }
    }

    const authResult = response.data

    const { token: accessToken, refreshToken, expiresAt, user: apiUser } = authResult

    if (!accessToken || !refreshToken || !expiresAt || !apiUser) {
      return {
        success: false,
        error: 'Invalid authentication response',
      }
    }

    console.log('✅ Passkey authentication successful - storing tokens in Next.js httpOnly cookies')

    // Store tokens in Next.js httpOnly cookies (same as regular login)
    const expiresInSeconds = calculateTokenTTL(expiresAt)
    const { setServerAuthTokens } = await import('@/lib/api/server')
    await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)

    // Return success - client will handle redirect
    return {
      success: true,
      data: {
        requiresTwoFactor: false,
      },
    }
  } catch (error) {
    console.error('Passkey login finish action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * WebAuthn Registration Begin Action
 *
 * Initiates passkey registration flow.
 * Returns challenge options for the client to present to the authenticator.
 */
export async function webAuthnRegisterBeginAction(): Promise<ActionResult<{ publicKey: unknown }>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    console.log('🔐 WebAuthn Register Begin - Calling /auth/webauthn/register/begin')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await (api as any).POST('/auth/webauthn/register/begin')) as {
      error?: Record<string, unknown>
      data?: { publicKey: unknown }
    }

    if (response.error) {
      console.error('WebAuthn register begin error:', response.error)
      return {
        success: false,
        error: 'Failed to initiate passkey registration',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'No challenge data received',
      }
    }

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('WebAuthn register begin action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * WebAuthn Registration Finish Action
 *
 * Completes passkey registration with the authenticator response.
 */
export async function webAuthnRegisterFinishAction(
  credentialName: string,
  registrationResponse: unknown
): Promise<ActionResult<{ credential: unknown }>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    console.log('🔐 WebAuthn Register Finish - Calling /auth/webauthn/register/finish')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await (api as any).POST('/auth/webauthn/register/finish', {
      body: {
        name: credentialName,
        response: registrationResponse,
      },
    })) as {
      error?: Record<string, unknown>
      data?: unknown
    }

    if (response.error) {
      console.error('WebAuthn register finish error:', response.error)
      return {
        success: false,
        error: 'Failed to complete passkey registration',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'No credential data received',
      }
    }

    return {
      success: true,
      data: { credential: response.data },
    }
  } catch (error) {
    console.error('WebAuthn register finish action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Get WebAuthn Credentials Action
 *
 * Retrieves the list of registered passkeys for the authenticated user.
 */
export async function getWebAuthnCredentialsAction(): Promise<ActionResult<{ credentials: unknown[] }>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    console.log('🔐 Getting WebAuthn credentials')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await (api as any).GET('/auth/webauthn/credentials')) as {
      error?: Record<string, unknown>
      data?: unknown[]
    }

    if (response.error) {
      console.error('Get WebAuthn credentials error:', response.error)
      return {
        success: false,
        error: 'Failed to fetch passkeys',
      }
    }

    return {
      success: true,
      data: {
        credentials: response.data || [],
      },
    }
  } catch (error) {
    console.error('Get WebAuthn credentials action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Delete WebAuthn Credential Action
 *
 * Deletes a registered passkey for the authenticated user.
 */
export async function deleteWebAuthnCredentialAction(
  credentialId: string
): Promise<ActionResult<{ message: string }>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    console.log('🔐 Deleting WebAuthn credential:', credentialId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await (api as any).DELETE('/auth/webauthn/credentials/{id}', {
      params: {
        path: { id: credentialId },
      },
    })) as {
      error?: Record<string, unknown>
      data?: unknown
    }

    if (response.error) {
      console.error('Delete WebAuthn credential error:', response.error)
      return {
        success: false,
        error: 'Failed to delete passkey',
      }
    }

    return {
      success: true,
      data: {
        message: 'Passkey deleted successfully',
      },
    }
  } catch (error) {
    console.error('Delete WebAuthn credential action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Verify Passwordless Login Action
 *
 * Verifies the passwordless login token (from email or SMS) and logs the user in.
 * Creates session and redirects to dashboard on success.
 */
export async function verifyPasswordlessLoginAction(data: {
  token: string
}): Promise<ActionResult<{ requiresTwoFactor: boolean; challengeToken?: string; email?: string }>> {
  try {
    if (!data.token) {
      return {
        success: false,
        error: 'Token is required',
      }
    }

    const api = createPublicClient()

    const response: {
      error?: Record<string, unknown>
      data?: {
        totpRequired?: boolean
        challengeToken?: string
        user?: { email?: string; id?: string; firstName?: string; lastName?: string }
        token?: string
        refreshToken?: string
        expiresAt?: number
      }
    } = await api.POST(
      // @ts-expect-error - passwordless endpoints not yet in generated types
      '/auth/passwordless/verify',
      {
        body: {
          token: data.token,
        },
      }
    )

    // Handle API errors
    if (response.error) {
      console.error('Passwordless verify API error:', response.error)
      const apiError = response.error
      const errorMessage = (apiError.message as string) || 'Invalid or expired token'
      return {
        success: false,
        error: errorMessage,
        errorData: {
          message: errorMessage,
          key: apiError.key as string | undefined,
          code: apiError.code as number | undefined,
        },
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'No data returned from verification',
      }
    }

    const responseData = response.data

    // Check if 2FA is required
    if (responseData.totpRequired || responseData.challengeToken) {
      return {
        success: true,
        data: {
          requiresTwoFactor: true,
          challengeToken: responseData.challengeToken,
          email: responseData.user?.email,
        },
      }
    }

    // Login successful - create session
    if (!responseData.token || !responseData.refreshToken || !responseData.user) {
      return {
        success: false,
        error: 'Invalid response from server',
      }
    }

    console.log('✅ Passwordless login successful - storing tokens in Next.js httpOnly cookies')

    // Store tokens in Next.js httpOnly cookies (same as regular login)
    const expiresInSeconds = calculateTokenTTL(responseData.expiresAt)
    const { setServerAuthTokens } = await import('@/lib/api/server')
    await setServerAuthTokens(responseData.token, responseData.refreshToken, expiresInSeconds)

    return {
      success: true,
      data: {
        requiresTwoFactor: false,
      },
    }
  } catch (error) {
    console.error('Verify passwordless login action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
