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
  setServerAuthTokens,
  clearServerAuthTokens
} from '@/lib/api/server'
import { createSession, saveSession } from '@/lib/auth/session'
import { toSessionUser } from './utils/authHelpers'
import { debugToken } from '@/lib/auth/jwt'
import type { ActionResult } from '@/types/actions'
import type {
  LoginCredentials,
  SignUpData,
  AuthUser,
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

    console.log('✅ Login successful - storing JWT tokens in httpOnly cookies')

    // Debug: Log token in development
    if (process.env.NODE_ENV === 'development') {
      debugToken(accessToken)
    }

    // Calculate token expiration in seconds
    // expiresAt is a Unix timestamp (API returns seconds, not milliseconds)
    const expiresAtTimestamp = typeof expiresAt === 'string' ? parseInt(expiresAt) : expiresAt
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const expiresInSeconds = expiresAtTimestamp - nowInSeconds

    console.log('🔐 Token expiration:', {
      expiresAtTimestamp,
      nowInSeconds,
      expiresInSeconds,
      expiresInAbout: `${Math.floor(expiresInSeconds / 60)} minutes`,
    })

    // Store JWT tokens in httpOnly cookies
    await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)

    return {
      success: true,
      data: { requiresTwoFactor: false },
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

    console.log('✅ 2FA verified successfully - using user data from API response')

    // Map API user to AuthUser (user object is already in the response!)
    const authUser: AuthUser = {
      id: (apiUser.id as string) || 'unknown',
      email: (apiUser.email as string) || '',
      firstName: (apiUser.firstName as string) || null,
      lastName: (apiUser.lastName as string) || null,
      phone: (apiUser.phone as string) || null,
      role: 'customer', // TODO: Get from API when available
      accountId: (apiUser.id as string) || 'unknown', // TODO: Get from API when available
      has2FAEnabled: (apiUser.totpEnabled as boolean) || false,
      emailVerified: false, // TODO: Get from API when available
      phoneVerified: false, // TODO: Get from API when available
      createdAt: (apiUser.createdAt as string) || new Date().toISOString(),
    }

    const sessionUser = toSessionUser(authUser)

    // Create session with token, refreshToken, and expiresAt
    const expiresAtTimestamp = typeof expiresAt === 'string' ? parseInt(expiresAt) : expiresAt
    const session = createSession(sessionUser, accessToken, refreshToken, expiresAtTimestamp)

    // Save session to httpOnly cookie
    await saveSession(session)

    // Note: Client component handles clearing sessionStorage (challengeToken, loginEmail)
    // Server actions cannot access browser APIs like sessionStorage

    return {
      success: true,
      data: { requiresTwoFactor: false },
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

    // Step 2: Automatically log in the user
    const loginResponse = await api.POST('/auth/login', {
      body: {
        email: data.email,
        password: data.password,
      },
    })

    if (loginResponse.error) {
      console.error('Auto-login after signup failed:', loginResponse.error)
      return {
        success: false,
        error: 'Account created but login failed. Please try signing in manually.',
      }
    }

    if (!loginResponse.data) {
      return {
        success: false,
        error: 'Account created but login failed. Please try signing in manually.',
      }
    }

    // Step 3: Get token and user profile from login response
    const loginData = loginResponse.data as {
      token?: string
      refreshToken?: string
      expiresAt?: number | string
      user?: {
        id?: string
        email?: string
        firstName?: string
        lastName?: string
        phone?: string
        status?: string
        totpEnabled?: boolean
        createdAt?: string
        updatedAt?: string
      }
    }

    const { token, refreshToken, expiresAt, user: apiUser } = loginData

    if (!token) {
      return {
        success: false,
        error: 'Account created but login failed. No token received.',
      }
    }

    if (!refreshToken) {
      return {
        success: false,
        error: 'Account created but login failed. No refresh token received.',
      }
    }

    if (!expiresAt) {
      return {
        success: false,
        error: 'Account created but login failed. No expiration time received.',
      }
    }

    if (!apiUser) {
      return {
        success: false,
        error: 'Account created but login failed. No user data received.',
      }
    }

    console.log('✅ Signup successful - using user data from API response (no /me call needed)')

    // Map API user to AuthUser
    const authUser: AuthUser = {
      id: apiUser.id || 'unknown',
      email: apiUser.email || data.email,
      firstName: apiUser.firstName || null,
      lastName: apiUser.lastName || null,
      phone: apiUser.phone || null,
      role: 'customer', // TODO: Get from API when available
      accountId: apiUser.id || 'unknown', // TODO: Get from API when available
      has2FAEnabled: apiUser.totpEnabled || false,
      emailVerified: false, // TODO: Get from API when available
      phoneVerified: false, // TODO: Get from API when available
      createdAt: apiUser.createdAt || new Date().toISOString(),
    }

    const sessionUser = toSessionUser(authUser)

    // Create session with token, refreshToken, and expiresAt
    const expiresAtTimestamp = typeof expiresAt === 'string' ? parseInt(expiresAt) : expiresAt
    const session = createSession(sessionUser, token, refreshToken, expiresAtTimestamp)

    // Save session to httpOnly cookie
    await saveSession(session)

    return {
      success: true,
      data: { userId: sessionUser.id, emailVerified: authUser.emailVerified },
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

    console.log('✅ Password reset successful - using user data from API response (no /me call needed)')

    // Map API user to AuthUser (user object is already in the response!)
    const authUser: AuthUser = {
      id: (apiUser.id as string) || 'unknown',
      email: (apiUser.email as string) || '',
      firstName: (apiUser.firstName as string) || null,
      lastName: (apiUser.lastName as string) || null,
      phone: (apiUser.phone as string) || null,
      role: 'customer',
      accountId: (apiUser.id as string) || 'unknown',
      has2FAEnabled: (apiUser.totpEnabled as boolean) || false,
      emailVerified: false,
      phoneVerified: false,
      createdAt: (apiUser.createdAt as string) || new Date().toISOString(),
    }

    const sessionUser = toSessionUser(authUser)

    // Create session with token, refreshToken, and expiresAt
    const expiresAtTimestamp = typeof expiresAt === 'string' ? parseInt(expiresAt) : expiresAt
    const session = createSession(sessionUser, accessToken, refreshToken, expiresAtTimestamp)

    // Save session to httpOnly cookie
    await saveSession(session)

    return {
      success: true,
      data: { userId: sessionUser.id },
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

    const sessionUser = toSessionUser(responseData.user as AuthUser)

    const session = createSession(
      sessionUser,
      responseData.token,
      responseData.refreshToken,
      responseData.expiresAt || 0
    )

    await saveSession(session)

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
