/**
 * Auth Domain Types
 *
 * Type definitions for authentication domain.
 * These extend the API types with UI-specific properties.
 */

import type { components } from '@/lib/api/generated/schema'

/**
 * User from API
 */
export type ApiUser = components['schemas']['response.User']

/**
 * Auth User (enriched with session data)
 */
export interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: 'customer' | 'caterer' | 'admin' | 'ops' | 'finance' | 'sales'
  accountId: string
  has2FAEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Login Response from API
 */
export interface LoginResponse {
  token?: string
  requires2FA?: boolean
  tempToken?: string
  user?: ApiUser
}

/**
 * Sign Up Data
 */
export interface SignUpData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
  accountType: 'customer' | 'caterer'
  terms: boolean
}

/**
 * Sign Up Response
 */
export interface SignUpResponse {
  token: string
  user: ApiUser
}

/**
 * Two-Factor Setup Response (from API)
 */
export interface TwoFactorSetupResponse {
  secret: string
  qrCode: string
  issuer: string
  accountID: string
}

/**
 * Two-Factor Enable Response (from API)
 */
export interface TwoFactorEnableResponse {
  message: string
  backupCodes: string[]
}

/**
 * Backup Codes Response (from API)
 */
export interface BackupCodesResponse {
  codes: string[]
}

/**
 * Two-Factor Disable Response (from API)
 */
export interface TwoFactorDisableResponse {
  message: string
}

/**
 * Two-Factor Verification Data (for enabling 2FA)
 */
export interface TwoFactorVerifyData {
  code: string
}

/**
 * SMS Recovery Request Data
 */
export interface SMSRecoveryRequestData {
  email: string
}

/**
 * SMS Recovery Verify Data
 */
export interface SMSRecoveryVerifyData {
  email: string
  code: string
}

/**
 * Password Reset Method
 */
export type PasswordResetMethod = 'email' | 'sms'

/**
 * Forgot Password Request (Email)
 */
export interface ForgotPasswordEmailData {
  email: string
}

/**
 * Forgot Password Request (SMS)
 */
export interface ForgotPasswordSMSData {
  phone: string
}

/**
 * Reset Password Data (Email with OTT)
 */
export interface ResetPasswordEmailData {
  token: string
  newPassword: string
  confirmPassword: string
}

/**
 * Reset Password Data (SMS with code)
 */
export interface ResetPasswordSMSData {
  phone: string
  code: string
  newPassword: string
  confirmPassword: string
}

/**
 * OAuth Provider
 */
export type OAuthProvider = 'google' | 'twitter'

/**
 * Auth Error
 */
export interface AuthError {
  code: string
  message: string
  field?: string
}

/**
 * Auth State
 */
export type AuthState =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'requires2FA'
  | 'error'

/**
 * Password Strength Level
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

/**
 * Password Strength Result
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength
  score: number // 0-4
  feedback: string[]
  meetsRequirements: boolean
}

// ===========================
// Email Verification Types
// ===========================

export interface VerifyEmailData {
  token: string
}

export interface VerifyEmailResponse {
  userId: string
  email: string
  verified: boolean
}

export interface ResendVerificationData {
  email: string
}
