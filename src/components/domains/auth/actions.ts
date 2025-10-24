'use server'

/**
 * Auth Server Actions
 *
 * Next.js Server Actions for authentication flows.
 * These run on the server and handle API calls + session management.
 */

import { redirect } from 'next/navigation'
import { createServerClient, createPublicClient } from '@/lib/api/server'
import { createSession, saveSession, deleteSession } from '@/lib/auth/session'
import { toSessionUser } from './utils/authHelpers'
import type { ActionResult } from '@/types/actions'
import type {
  LoginCredentials,
  LoginResponse,
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
): Promise<ActionResult<{ requiresTwoFactor: boolean }>> {
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

    const response = await api.POST('/auth/login', {
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    })

    // Handle API errors
    if (response.error) {
      console.error('Login API error:', response.error)
      return {
        success: false,
        error: response.error.message || 'Invalid email or password',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'Login failed',
      }
    }

    const loginResponse = response.data as unknown as LoginResponse

    // Check if 2FA is required
    if (loginResponse.requires2FA) {
      // For 2FA, we'll create a temporary session with limited access
      // The user will need to verify their 2FA code before getting full access
      return {
        success: true,
        data: { requiresTwoFactor: true },
      }
    }

    // Create session from auth user
    const authUser = loginResponse.user as unknown as AuthUser
    const sessionUser = toSessionUser(authUser)

    // Set session duration based on "remember me"
    // Remember me: 30 days, otherwise: 7 days
    const sessionDays = credentials.rememberMe ? 30 : 7
    const session = createSession(sessionUser, sessionDays)

    // Save session to httpOnly cookie
    await saveSession(session)

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
 * Signup Action
 *
 * Handles new user registration.
 * Creates account, creates session, and redirects on success.
 */
export async function signupAction(data: SignUpData): Promise<ActionResult<{ userId: string }>> {
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

      // Check for specific error messages
      const errorMessage = createUserResponse.error.message || 'Failed to create account'
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate')) {
        return {
          success: false,
          error: 'An account with this email already exists',
        }
      }

      return {
        success: false,
        error: errorMessage,
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

    // Step 3: Create session from the user data
    const user = createUserResponse.data
    const sessionUser = toSessionUser(user as unknown as AuthUser)
    const session = createSession(sessionUser, 7)

    // Save session to httpOnly cookie
    await saveSession(session)

    return {
      success: true,
      data: { userId: sessionUser.id },
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
    // Delete session cookie
    await deleteSession()
  } catch (error) {
    console.error('Logout action error:', error)
  }

  // Always redirect to login, even if deletion failed
  redirect('/signin')
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
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

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
 * Reset Password Action
 *
 * Resets password using OTT token and creates new session.
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

    const response = await api.POST('/auth/password/reset', {
      body: {
        token: data.token,
        newPassword: data.newPassword,
      },
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

    // Note: API returns access token, but we don't need to create a session here
    // The user can sign in normally after resetting their password
    // Or we could auto-login them by extracting user info from the token

    return {
      success: true,
      data: { userId: 'reset-successful' },
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
