/**
 * TokenManager Class
 *
 * Singleton class for managing JWT tokens.
 * Handles token validation, expiration checks, and refresh timing.
 */

interface TokenPayload {
  exp?: number // Expiration timestamp
  iat?: number // Issued at timestamp
  sub?: string // Subject (user ID)
  email?: string
  [key: string]: unknown
}

export class TokenManager {
  private static instance: TokenManager

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get TokenManager instance (Singleton)
   */
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  /**
   * Check if token is expired
   *
   * @param expiresAt - Unix timestamp (seconds or milliseconds)
   * @returns true if token is expired
   */
  isExpired(expiresAt: number): boolean {
    const now = Date.now()
    // Handle both seconds and milliseconds timestamps
    const expiryMs = expiresAt < 10000000000 ? expiresAt * 1000 : expiresAt
    return now >= expiryMs
  }

  /**
   * Check if token should be refreshed (5 minutes before expiry)
   *
   * @param expiresAt - Unix timestamp (seconds or milliseconds)
   * @returns true if token should be refreshed
   */
  shouldRefresh(expiresAt: number): boolean {
    const now = Date.now()
    // Handle both seconds and milliseconds timestamps
    const expiryMs = expiresAt < 10000000000 ? expiresAt * 1000 : expiresAt
    const fiveMinutes = 5 * 60 * 1000

    // Refresh if token expires in less than 5 minutes and is not yet expired
    return expiryMs - now < fiveMinutes && expiryMs > now
  }

  /**
   * Decode JWT token (without verification)
   *
   * Note: This does NOT verify the signature, only decodes the payload.
   * Use this for reading token data, not for security decisions.
   *
   * @param token - JWT token string
   * @returns Decoded payload or null if invalid
   */
  decode(token: string): TokenPayload | null {
    try {
      if (!this.isValid(token)) {
        return null
      }

      const parts = token.split('.')
      const payload = parts[1]

      // Decode base64url
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded) as TokenPayload
    } catch {
      return null
    }
  }

  /**
   * Get time until token expires (in seconds)
   *
   * @param expiresAt - Unix timestamp (seconds or milliseconds)
   * @returns Seconds until expiry (0 if expired)
   */
  getTimeUntilExpiry(expiresAt: number): number {
    const now = Date.now()
    // Handle both seconds and milliseconds timestamps
    const expiryMs = expiresAt < 10000000000 ? expiresAt * 1000 : expiresAt
    const remainingMs = expiryMs - now

    return Math.max(0, Math.floor(remainingMs / 1000))
  }

  /**
   * Validate token structure (basic check)
   *
   * @param token - JWT token string
   * @returns true if token has valid JWT structure
   */
  isValid(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false
    }

    const parts = token.split('.')
    return parts.length === 3
  }

  /**
   * Get expiration from token payload
   *
   * @param token - JWT token string
   * @returns Unix timestamp or null if not found
   */
  getExpiration(token: string): number | null {
    const payload = this.decode(token)
    return payload?.exp || null
  }

  /**
   * Get issued-at time from token payload
   *
   * @param token - JWT token string
   * @returns Unix timestamp or null if not found
   */
  getIssuedAt(token: string): number | null {
    const payload = this.decode(token)
    return payload?.iat || null
  }

  /**
   * Get user ID from token payload
   *
   * @param token - JWT token string
   * @returns User ID or null if not found
   */
  getUserId(token: string): string | null {
    const payload = this.decode(token)
    return (payload?.sub as string) || null
  }

  /**
   * Get email from token payload
   *
   * @param token - JWT token string
   * @returns Email or null if not found
   */
  getEmail(token: string): string | null {
    const payload = this.decode(token)
    return (payload?.email as string) || null
  }

  /**
   * Check if token will expire within specified minutes
   *
   * @param expiresAt - Unix timestamp
   * @param minutes - Minutes threshold
   * @returns true if token expires within specified minutes
   */
  expiresWithin(expiresAt: number, minutes: number): boolean {
    const now = Date.now()
    const expiryMs = expiresAt < 10000000000 ? expiresAt * 1000 : expiresAt
    const threshold = minutes * 60 * 1000

    return expiryMs - now < threshold && expiryMs > now
  }

  /**
   * Format time remaining for display
   *
   * @param expiresAt - Unix timestamp
   * @returns Formatted string (e.g., "5m 30s", "2h 15m", "Expired")
   */
  formatTimeRemaining(expiresAt: number): string {
    const seconds = this.getTimeUntilExpiry(expiresAt)

    if (seconds <= 0) {
      return 'Expired'
    }

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }

    if (minutes > 0) {
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
    }

    return `${secs}s`
  }

  /**
   * Calculate when to schedule next refresh check
   *
   * Returns milliseconds until next check should occur.
   * If token expires in >10 min: check in 5 min
   * If token expires in 5-10 min: check in 1 min
   * If token expires in <5 min: check in 30 sec
   *
   * @param expiresAt - Unix timestamp
   * @returns Milliseconds until next check
   */
  getNextCheckInterval(expiresAt: number): number {
    const timeRemaining = this.getTimeUntilExpiry(expiresAt)

    if (timeRemaining > 10 * 60) {
      // More than 10 minutes remaining: check in 5 minutes
      return 5 * 60 * 1000
    }

    if (timeRemaining > 5 * 60) {
      // 5-10 minutes remaining: check every minute
      return 60 * 1000
    }

    if (timeRemaining > 0) {
      // Less than 5 minutes: check every 30 seconds
      return 30 * 1000
    }

    // Expired: check immediately
    return 0
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance()
