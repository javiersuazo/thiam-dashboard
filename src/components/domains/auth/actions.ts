'use server'

/**
 * Auth Server Actions
 *
 * Next.js Server Actions for authentication flows.
 * These run on the server and handle API calls + session management.
 */

import { redirect } from 'next/navigation'
import { createServerClient, createPublicClient } from '@/lib/api/server'
import type { ActionResult } from '@/types/actions'

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

export async function loginAction(
  credentials: LoginCredentials
): Promise<ActionResult<{ requiresTwoFactor: boolean; challengeToken?: string; email?: string }>> {
  try {
    const validation = loginSchema.safeParse(credentials)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid credentials',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const { createLoginUseCase } = await import('./application/factory')
    const loginUseCase = createLoginUseCase()
    const result = await loginUseCase.execute(credentials)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    if (result.type === 'needs2FA') {
      return {
        success: true,
        data: {
          requiresTwoFactor: true,
          challengeToken: result.challengeToken,
          email: credentials.email,
        },
      }
    }

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

    const { createVerify2FAUseCase } = await import('./application/factory')
    const verify2FAUseCase = createVerify2FAUseCase()
    const result = await verify2FAUseCase.execute(challengeToken, code)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

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
): Promise<ActionResult<{ userId: string; accountId: string; email: string }>> {
  try {
    const validation = signupSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid signup data',
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const accountName = data.accountName || `${data.firstName} ${data.lastName}'s Account`

    const { createRegisterUseCase } = await import('./application/factory')
    const registerUseCase = createRegisterUseCase()
    const result = await registerUseCase.execute({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      ...(data.phone && { phone: data.phone }),
      accountName,
      accountType: data.accountType,
    })

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    console.log('✅ Signup successful - verification email sent')

    return {
      success: true,
      data: {
        userId: result.result.userId,
        accountId: result.result.accountId,
        email: result.result.email,
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
    const { createLogoutUseCase } = await import('./application/factory')
    const logoutUseCase = createLogoutUseCase()
    await logoutUseCase.execute()
  } catch (error) {
    console.error('Logout action error:', error)
  }

  redirect('/signin')
}

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

    const { createRefreshTokenUseCase } = await import('./application/factory')
    const refreshTokenUseCase = createRefreshTokenUseCase()
    const result = await refreshTokenUseCase.execute(refreshToken)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    return {
      success: true,
      data: {
        token: result.token,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
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
    const response = await api.POST('/v1/auth/2fa/setup', {})

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

    const response = await api.POST('/v1/auth/2fa/enable', {
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

    const response = await api.POST('/v1/auth/2fa/disable', {})

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

    const response = await api.POST('/v1/auth/2fa/backup-codes', {})

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
    await api.POST('/v1/auth/2fa/recovery/sms', {
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

    const response = await api.POST('/v1/auth/2fa/recovery/verify', {
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
    await api.POST('/v1/auth/password/forgot', {
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
    await api.POST('/v1/auth/password/forgot/phone', {
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
    const response = await api.POST('/v1/auth/password/reset', {
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
    const validation = verifyEmailSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid verification token',
      }
    }

    const { createEmailVerificationUseCase } = await import('./application/factory')
    const emailVerificationUseCase = createEmailVerificationUseCase()
    const result = await emailVerificationUseCase.verify(data.token)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    return {
      success: true,
      data: { message: 'Email verified successfully' },
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
    const validation = resendVerificationSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid email address',
      }
    }

    const { createEmailVerificationUseCase } = await import('./application/factory')
    const emailVerificationUseCase = createEmailVerificationUseCase()
    await emailVerificationUseCase.resend(data.email)

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Resend verification action error:', error)
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

    const response = await api.GET('/v1/auth/email/verify', {
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
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return {
        success: false,
        error: 'Invalid email address',
      }
    }

    const api = createPublicClient()

    await api.POST('/api/v1/auth/passwordless/magic-link/send', {
      body: {
        email: data.email,
      },
    })

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Request passwordless email action error:', error)
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
    if (!data.phone || !/^\+[1-9]\d{1,14}$/.test(data.phone)) {
      return {
        success: false,
        error: 'Invalid phone number format. Use E.164 format (e.g., +14155552671)',
      }
    }

    const api = createPublicClient()

    await api.POST('/api/v1/auth/passwordless/sms/send', {
      body: {
        phone: data.phone,
      },
    })

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Request passwordless phone action error:', error)
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
export async function passkeyLoginBeginAction(): Promise<ActionResult<{ publicKey: unknown; sessionId: string }>> {
  try {
    const api = createPublicClient()

    console.log('🔐 Passkey Login Begin - Calling /api/v1/passkeys/login/begin')

    const response = await api.POST('/api/v1/passkeys/login/begin', {
      body: { email: '' },
    })

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

    const challengeData = response.data as { options: unknown; session_id: string }

    return {
      success: true,
      data: {
        publicKey: challengeData.options,
        sessionId: challengeData.session_id,
      },
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
  authResponse: unknown,
  sessionId?: string
): Promise<ActionResult<{ requiresTwoFactor: boolean }>> {
  try {
    const api = createPublicClient()

    console.log('🔐 Passkey Login Finish - Calling /api/v1/passkeys/login/finish')

    if (!sessionId) {
      return {
        success: false,
        error: 'Session ID is required',
      }
    }

    const response = await api.POST('/api/v1/passkeys/login/finish', {
      body: {
        credential: authResponse,
        session_id: sessionId,
      },
    })

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

    const authResult = response.data as {
      access_token?: string
      refresh_token?: string
      expires_at?: number
      user_id?: string
      email?: string
    }

    const { access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt } = authResult

    if (!accessToken || !refreshToken || !expiresAt) {
      return {
        success: false,
        error: 'Invalid authentication response',
      }
    }

    console.log('✅ Passkey authentication successful - storing tokens in Next.js httpOnly cookies')

    const expiresInSeconds = expiresAt - Math.floor(Date.now() / 1000)
    const { setServerAuthTokens } = await import('@/lib/api/server')
    await setServerAuthTokens(accessToken, refreshToken, expiresInSeconds)

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
    const response = (await (api as any).POST('/v1/auth/webauthn/register/begin')) as {
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
    const response = (await (api as any).POST('/v1/auth/webauthn/register/finish', {
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
    const response = (await (api as any).GET('/v1/auth/webauthn/credentials')) as {
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
    const response = (await (api as any).DELETE('/v1/auth/webauthn/credentials/{id}', {
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

    const response = await api.POST('/api/v1/auth/passwordless/magic-link/verify', {
      body: {
        token: data.token,
      },
    })

    if (response.error) {
      console.error('Passwordless verify API error:', response.error)
      const apiError = response.error as any
      const errorMessage = apiError.message || 'Invalid or expired token'
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

    const responseData = response.data as {
      access_token?: string
      refresh_token?: string
      expires_at?: number
      user_id?: string
      email?: string
    }

    if (!responseData.access_token || !responseData.refresh_token || !responseData.expires_at) {
      return {
        success: false,
        error: 'Invalid response from server',
      }
    }

    console.log('✅ Passwordless login successful - storing tokens in Next.js httpOnly cookies')

    const expiresInSeconds = responseData.expires_at - Math.floor(Date.now() / 1000)
    const { setServerAuthTokens } = await import('@/lib/api/server')
    await setServerAuthTokens(responseData.access_token, responseData.refresh_token, expiresInSeconds)

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
