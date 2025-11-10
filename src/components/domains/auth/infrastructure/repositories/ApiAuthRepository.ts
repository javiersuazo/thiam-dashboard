import type {
  IAuthRepository,
  LoginCredentials,
  AuthenticationResult,
  RefreshResult,
  LoginResult,
  RegisterData,
  RegisterResult,
} from '../../domain/repositories/IAuthRepository'
import { createPublicClient } from '@/lib/api/server'

export class ApiAuthRepository implements IAuthRepository {
  async authenticate(credentials: LoginCredentials & { mfaCode?: string }): Promise<AuthenticationResult> {
    const api = createPublicClient()

    const { data, error, response } = await api.POST('/api/v1/auth/login', {
      body: {
        email: credentials.email,
        password: credentials.password,
        ...(credentials.mfaCode && { mfa_code: credentials.mfaCode }),
      },
    })

    // Handle MFA required error (401 with MFA_REQUIRED code)
    if (error && response?.status === 401) {
      const errorData = error as any

      // Check if MFA is required
      if (errorData.code === 'MFA_REQUIRED' || errorData.error_key === 'errors.auth.mfa_required') {
        return {
          totpRequired: true,
          challengeToken: '', // New API doesn't use challenge tokens
          expiresAt: 0, // Not used in new flow
        }
      }

      // Invalid MFA code
      if (errorData.code === 'INVALID_MFA_CODE' || errorData.error_key === 'errors.auth.invalid_mfa_code') {
        throw new Error('Invalid MFA code')
      }
    }

    if (error || !data) {
      throw new Error((error as any)?.message || 'Authentication failed')
    }

    // Map snake_case API response to camelCase domain model
    const apiData = data as {
      access_token: string
      refresh_token: string
      expires_at: number
      session_id: string
      user_id: string
      email: string
      first_name: string
      last_name: string
      phone?: string
    }

    if (!apiData.access_token || !apiData.refresh_token) {
      throw new Error('Invalid response from server - missing tokens')
    }

    return {
      token: apiData.access_token,
      refreshToken: apiData.refresh_token,
      expiresAt: apiData.expires_at * 1000, // Convert Unix seconds to milliseconds
      user: {
        id: apiData.user_id,
        email: apiData.email,
        firstName: apiData.first_name || null,
        lastName: apiData.last_name || null,
        phone: apiData.phone || null,
        role: 'customer', // TODO: Get from account type when available
        accountId: '', // TODO: Get from user profile
        has2FAEnabled: false, // TODO: Get from user profile or MFA status endpoint
        emailVerified: true, // Assume true if login succeeded
        phoneVerified: false, // TODO: Get from user profile
      },
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshResult> {
    const api = createPublicClient()

    const { data, error } = await api.POST('/api/v1/auth/refresh', {
      body: { refresh_token: refreshToken },
    })

    if (error || !data) {
      throw new Error('Token refresh failed')
    }

    const apiData = data as {
      access_token: string
      refresh_token: string
      expires_at: number
    }

    if (!apiData.access_token || !apiData.refresh_token) {
      throw new Error('Invalid refresh response')
    }

    return {
      token: apiData.access_token,
      refreshToken: apiData.refresh_token,
      expiresAt: apiData.expires_at * 1000, // Convert Unix seconds to milliseconds
    }
  }

  async verify2FA(challengeToken: string, code: string): Promise<LoginResult> {
    // NEW API: MFA is handled by retrying login with mfa_code
    // This method is kept for backward compatibility but should use authenticate()
    throw new Error('verify2FA is deprecated - use authenticate() with mfaCode instead')
  }

  async logout(): Promise<void> {
    const api = createPublicClient()

    try {
      await api.POST('/api/v1/auth/logout', {})
    } catch (error) {
      // Logout errors are non-critical - tokens will expire anyway
      console.warn('Logout API call failed:', error)
    }
  }

  async register(data: RegisterData): Promise<RegisterResult> {
    const api = createPublicClient()

    const { data: result, error } = await api.POST('/api/v1/auth/register', {
      body: {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        ...(data.phone && { phone: data.phone }),
        account_name: data.accountName,
        account_type: data.accountType,
      },
    })

    if (error || !result) {
      throw new Error((error as any)?.message || 'Registration failed')
    }

    const apiData = result as {
      user_id: string
      account_id: string
      email: string
    }

    return {
      userId: apiData.user_id,
      accountId: apiData.account_id,
      email: apiData.email,
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const api = createPublicClient()

    const { error } = await api.POST('/api/v1/auth/email-verification/verify', {
      body: { token },
    })

    if (error) {
      throw new Error((error as any)?.message || 'Email verification failed')
    }
  }

  async resendVerification(email: string): Promise<void> {
    const api = createPublicClient()

    const { error } = await api.POST('/api/v1/auth/email-verification/resend', {
      body: { email },
    })

    if (error) {
      throw new Error((error as any)?.message || 'Failed to resend verification email')
    }
  }
}
