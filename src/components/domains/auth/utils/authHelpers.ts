/**
 * Auth Helper Utilities
 *
 * Pure functions for auth-related operations.
 * No side effects, no API calls.
 */

import type { AuthUser } from '../types/auth.types'
import type { SessionUser } from '@/components/features/session/types'

/**
 * Format phone number to E.164 format
 *
 * @example
 * formatPhone('(555) 123-4567') // '+15551234567'
 * formatPhone('+1 555 123 4567') // '+15551234567'
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // If doesn't start with +, assume US number and prepend +1
  if (!cleaned.startsWith('+')) {
    return `+1${cleaned}`
  }

  return cleaned
}

/**
 * Format phone number for display
 *
 * @example
 * formatPhoneDisplay('+15551234567') // '(555) 123-4567'
 */
export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  // US phone number
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const areaCode = cleaned.slice(1, 4)
    const prefix = cleaned.slice(4, 7)
    const line = cleaned.slice(7)
    return `(${areaCode}) ${prefix}-${line}`
  }

  // 10-digit number (assume US)
  if (cleaned.length === 10) {
    const areaCode = cleaned.slice(0, 3)
    const prefix = cleaned.slice(3, 6)
    const line = cleaned.slice(6)
    return `(${areaCode}) ${prefix}-${line}`
  }

  // International or other format
  return phone
}

/**
 * Validate email format (basic check)
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Get initials from name
 *
 * @example
 * getInitials('John', 'Doe') // 'JD'
 * getInitials('John', null) // 'J'
 */
export function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0]?.toUpperCase() || ''
  const last = lastName?.[0]?.toUpperCase() || ''
  return `${first}${last}`.trim() || '?'
}

/**
 * Get full name from user
 *
 * @example
 * getFullName({ firstName: 'John', lastName: 'Doe' }) // 'John Doe'
 * getFullName({ firstName: 'John', lastName: null }) // 'John'
 */
export function getFullName(user: { firstName: string | null; lastName: string | null }): string {
  const parts = [user.firstName, user.lastName].filter(Boolean)
  return parts.join(' ') || 'Unknown User'
}

/**
 * Convert AuthUser to SessionUser
 */
export function toSessionUser(authUser: AuthUser): SessionUser {
  return {
    id: authUser.id,
    email: authUser.email,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    fullName: getFullName(authUser),
    role: authUser.role,
    accountId: authUser.accountId,
    has2FAEnabled: authUser.has2FAEnabled,
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(
  user: SessionUser | null,
  roles: SessionUser['role'] | SessionUser['role'][]
): boolean {
  if (!user) return false

  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  return allowedRoles.includes(user.role)
}

/**
 * Check if user is admin
 */
export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, 'admin')
}

/**
 * Check if user is caterer
 */
export function isCaterer(user: SessionUser | null): boolean {
  return hasRole(user, 'caterer')
}

/**
 * Check if user is customer
 */
export function isCustomer(user: SessionUser | null): boolean {
  return hasRole(user, 'customer')
}

/**
 * Mask email for display (security)
 *
 * @example
 * maskEmail('john.doe@example.com') // 'j***e@example.com'
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email

  if (local.length <= 2) {
    return `${local[0]}***@${domain}`
  }

  const masked = `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
  return `${masked}@${domain}`
}

/**
 * Mask phone number for display (security)
 *
 * @example
 * maskPhone('+15551234567') // '+1 (***) ***-4567'
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const last4 = cleaned.slice(-4)
    return `+1 (***) ***-${last4}`
  }

  if (cleaned.length === 10) {
    const last4 = cleaned.slice(-4)
    return `(***) ***-${last4}`
  }

  // For other formats, show last 4 digits
  if (cleaned.length >= 4) {
    const last4 = cleaned.slice(-4)
    return `***${last4}`
  }

  return '***'
}

/**
 * Generate a random verification code (for testing/demo)
 */
export function generateMockVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Calculate session expiry timestamp
 *
 * @param days Number of days until expiry
 * @returns Timestamp in milliseconds
 */
export function calculateSessionExpiry(days: number = 7): number {
  return Date.now() + days * 24 * 60 * 60 * 1000
}

/**
 * Check if session is expired
 */
export function isSessionExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt
}

/**
 * Get time until session expires (in minutes)
 */
export function getSessionTimeRemaining(expiresAt: number): number {
  const remaining = expiresAt - Date.now()
  return Math.max(0, Math.floor(remaining / (60 * 1000)))
}

/**
 * Format time remaining for display
 *
 * @example
 * formatTimeRemaining(90) // '1h 30m'
 * formatTimeRemaining(45) // '45m'
 */
export function formatTimeRemaining(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${minutes}m`
}
