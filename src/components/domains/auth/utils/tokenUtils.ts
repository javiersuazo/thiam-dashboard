/**
 * Token Utility Functions
 *
 * Helper functions for JWT token management and validation.
 */

/**
 * Check if token is expired
 *
 * @param expiresAt - Unix timestamp (in seconds or milliseconds)
 * @returns true if token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  const now = Date.now()
  // Handle both seconds and milliseconds timestamps
  const expiryMs = expiresAt < 10000000000 ? expiresAt * 1000 : expiresAt
  return now >= expiryMs
}

/**
 * Check if token should be refreshed (5 minutes before expiry)
 *
 * @param expiresAt - Unix timestamp (in seconds or milliseconds)
 * @returns true if token should be refreshed
 */
export function shouldRefreshToken(expiresAt: number): boolean {
  const now = Date.now()
  // Handle both seconds and milliseconds timestamps
  const expiryMs = expiresAt < 10000000000 ? expiresAt * 1000 : expiresAt
  const fiveMinutes = 5 * 60 * 1000

  // Refresh if token expires in less than 5 minutes
  return expiryMs - now < fiveMinutes && expiryMs > now
}

/**
 * Get time until token expires (in seconds)
 *
 * @param expiresAt - Unix timestamp (in seconds or milliseconds)
 * @returns seconds until expiry (0 if expired)
 */
export function getTimeUntilExpiry(expiresAt: number): number {
  const now = Date.now()
  // Handle both seconds and milliseconds timestamps
  const expiryMs = expiresAt < 10000000000 ? expiresAt * 1000 : expiresAt
  const remainingMs = expiryMs - now

  return Math.max(0, Math.floor(remainingMs / 1000))
}

/**
 * Decode JWT token payload (without verification)
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJwtToken<T = Record<string, unknown>>(token: string): T | null {
  try {
    if (!token || typeof token !== 'string') {
      return null
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

/**
 * Validate JWT token structure (basic check)
 *
 * @param token - JWT token string
 * @returns true if token has valid structure
 */
export function isValidTokenStructure(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }

  const parts = token.split('.')
  return parts.length === 3
}

/**
 * Get token expiry from JWT payload
 *
 * @param token - JWT token string
 * @returns Unix timestamp or null if not found
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtToken<{ exp?: number }>(token)
  return payload?.exp || null
}

/**
 * Format time remaining for display
 *
 * @param seconds - Seconds remaining
 * @returns Formatted string (e.g., "5m 30s", "2h 15m")
 */
export function formatTimeRemaining(seconds: number): string {
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
