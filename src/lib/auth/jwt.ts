/**
 * JWT Utilities
 *
 * Utilities for decoding and working with JWT tokens.
 * Uses jose library for secure JWT handling.
 */

import { decodeJwt, type JWTPayload } from 'jose'

/**
 * JWT Claims (standard + custom)
 */
export interface TokenClaims extends JWTPayload {
  email?: string
  sub?: string // Standard JWT claim for user ID
  user_id?: string // Alternative user ID claim
  account_id?: string // Account ID (hardcoded for now, will be dynamic later)
  exp?: number // Expiry timestamp
  iat?: number // Issued at timestamp
}

/**
 * Decode JWT token without verification
 *
 * IMPORTANT: This only decodes the token to read claims.
 * It does NOT verify the signature. The backend should verify tokens on each request.
 *
 * @param token - JWT token string
 * @returns Decoded token claims
 *
 * @example
 * ```ts
 * const claims = decodeToken(token)
 * console.log(claims.email) // user@example.com
 * console.log(claims.sub)   // user-id-123
 * ```
 */
export function decodeToken(token: string): TokenClaims {
  try {
    const payload = decodeJwt(token)
    return payload as TokenClaims
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    throw new Error('Invalid token format')
  }
}

/**
 * Extract user ID from token
 *
 * Tries to get user ID from standard `sub` claim or custom `user_id` claim
 *
 * @param token - JWT token string
 * @returns User ID or null if not found
 */
export function getUserIdFromToken(token: string): string | null {
  try {
    const claims = decodeToken(token)
    return claims.sub || claims.user_id || null
  } catch {
    return null
  }
}

/**
 * Extract email from token
 *
 * @param token - JWT token string
 * @returns Email or null if not found
 */
export function getEmailFromToken(token: string): string | null {
  try {
    const claims = decodeToken(token)
    return claims.email || null
  } catch {
    return null
  }
}

/**
 * Check if token is expired (client-side check only)
 *
 * NOTE: This is a convenience check only. The backend should always
 * verify token expiry on each request.
 *
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const claims = decodeToken(token)
    if (!claims.exp) return false

    // exp is in seconds, Date.now() is in milliseconds
    return claims.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

/**
 * Get token expiry date
 *
 * @param token - JWT token string
 * @returns Date object or null if no expiry
 */
export function getTokenExpiry(token: string): Date | null {
  try {
    const claims = decodeToken(token)
    if (!claims.exp) return null

    return new Date(claims.exp * 1000)
  } catch {
    return null
  }
}

/**
 * Log token claims (for debugging)
 *
 * IMPORTANT: Only use in development. Never log tokens in production.
 */
export function debugToken(token: string): void {
  if (process.env.NODE_ENV === 'production') {
    console.warn('debugToken should not be called in production')
    return
  }

  try {
    const claims = decodeToken(token)
    console.log('🔐 JWT Token Claims:', {
      email: claims.email,
      sub: claims.sub,
      user_id: claims.user_id,
      exp: claims.exp ? new Date(claims.exp * 1000).toISOString() : 'none',
      iat: claims.iat ? new Date(claims.iat * 1000).toISOString() : 'none',
      isExpired: claims.exp ? claims.exp * 1000 < Date.now() : false,
    })
  } catch (error) {
    console.error('Failed to decode token:', error)
  }
}
