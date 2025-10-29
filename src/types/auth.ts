/**
 * Auth Type Definitions
 *
 * Centralized type definitions for authentication
 * Aligned with actual API responses (swagger.json)
 */

/**
 * Token data returned from API
 * Used in: login, signup, password reset, 2FA verify, token refresh
 */
export interface TokenData {
  token: string // Access token (JWT)
  refreshToken: string // Refresh token
  expiresAt: number // Unix timestamp when token expires
}

/**
 * Complete session data stored in cookies
 * Includes token data + user information
 */
export interface SessionData extends TokenData {
  user: SessionUser
  createdAt: number // When session was created
}

/**
 * User information stored in session
 * Simplified version of full user object
 */
export interface SessionUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: UserRole
  accountId: string
  has2FAEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
}

/**
 * User roles in the system
 */
export type UserRole = 'customer' | 'caterer' | 'admin' | 'ops' | 'finance' | 'sales'

/**
 * JWT token payload (decoded)
 */
export interface TokenPayload {
  exp: number // Expiration timestamp
  iat: number // Issued at timestamp
  sub: string // Subject (user ID)
  email: string
}

/**
 * API response type for login/signup/reset
 * Matches actual API response from swagger.json
 */
export interface AuthResponse {
  token: string
  refreshToken: string
  expiresAt: number
  totpEnabled: boolean
  user: ApiUser
}

/**
 * API user object
 * Matches response.User from swagger.json
 */
export interface ApiUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  status: string
  totpEnabled: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 2FA challenge response
 */
export interface TwoFactorChallenge {
  challengeToken: string
  expiresAt: string
  message: string
}

/**
 * Login response can be either auth tokens or 2FA challenge
 */
export type LoginResponse = AuthResponse | TwoFactorChallenge

/**
 * Type guard for AuthResponse
 */
export function isAuthResponse(response: LoginResponse): response is AuthResponse {
  return 'token' in response && 'refreshToken' in response
}

/**
 * Type guard for TwoFactorChallenge
 */
export function isTwoFactorChallenge(response: LoginResponse): response is TwoFactorChallenge {
  return 'challengeToken' in response
}
