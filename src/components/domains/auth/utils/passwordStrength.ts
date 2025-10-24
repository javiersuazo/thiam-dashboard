/**
 * Password Strength Utilities
 *
 * Calculate password strength and provide feedback.
 */

import type { PasswordStrength, PasswordStrengthResult } from '../types/auth.types'
import { passwordRequirements } from '../validation/authSchemas'

/**
 * Calculate password strength score (0-4)
 *
 * Scoring criteria:
 * - Length (8+ chars = +1, 12+ chars = +1, 16+ chars = +1)
 * - Character variety (uppercase + lowercase + numbers + special = +1)
 * - No common patterns (-1)
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0

  let score = 0

  // Length scoring
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++

  // Character variety
  let varietyCount = 0
  if (passwordRequirements.hasUppercase(password)) varietyCount++
  if (passwordRequirements.hasLowercase(password)) varietyCount++
  if (passwordRequirements.hasNumber(password)) varietyCount++
  if (passwordRequirements.hasSpecialChar(password)) varietyCount++

  if (varietyCount >= 4) score++

  // Check for common patterns (reduce score)
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^111111/,
    /^000000/,
  ]

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 1)
  }

  return Math.min(4, score)
}

/**
 * Get password strength level from score
 */
export function getPasswordStrengthLevel(score: number): PasswordStrength {
  if (score <= 1) return 'weak'
  if (score === 2) return 'fair'
  if (score === 3) return 'good'
  return 'strong'
}

/**
 * Get feedback messages for password strength
 */
export function getPasswordFeedback(password: string): string[] {
  const feedback: string[] = []

  if (!password) {
    return ['Password is required']
  }

  // Check requirements
  if (!passwordRequirements.minLength(password)) {
    feedback.push('Use at least 8 characters')
  }

  if (!passwordRequirements.hasUppercase(password)) {
    feedback.push('Add at least one uppercase letter')
  }

  if (!passwordRequirements.hasLowercase(password)) {
    feedback.push('Add at least one lowercase letter')
  }

  if (!passwordRequirements.hasNumber(password)) {
    feedback.push('Add at least one number')
  }

  if (!passwordRequirements.hasSpecialChar(password)) {
    feedback.push('Add at least one special character (!@#$%^&*)')
  }

  // Positive feedback
  if (feedback.length === 0) {
    const score = calculatePasswordStrength(password)
    if (score >= 4) {
      feedback.push('Excellent! Your password is very strong')
    } else if (score === 3) {
      feedback.push('Good password strength')
    } else {
      feedback.push('Consider making your password longer or more complex')
    }
  }

  return feedback
}

/**
 * Check if password meets all requirements
 */
export function meetsPasswordRequirements(password: string): boolean {
  return (
    passwordRequirements.minLength(password) &&
    passwordRequirements.hasUppercase(password) &&
    passwordRequirements.hasLowercase(password) &&
    passwordRequirements.hasNumber(password) &&
    passwordRequirements.hasSpecialChar(password)
  )
}

/**
 * Evaluate password strength (full result)
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const score = calculatePasswordStrength(password)
  const strength = getPasswordStrengthLevel(score)
  const feedback = getPasswordFeedback(password)
  const meetsRequirements = meetsPasswordRequirements(password)

  return {
    strength,
    score,
    feedback,
    meetsRequirements,
  }
}

/**
 * Get color for password strength (for UI)
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'red'
    case 'fair':
      return 'orange'
    case 'good':
      return 'yellow'
    case 'strong':
      return 'green'
    default:
      return 'gray'
  }
}

/**
 * Get label for password strength (for UI)
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Weak'
    case 'fair':
      return 'Fair'
    case 'good':
      return 'Good'
    case 'strong':
      return 'Strong'
    default:
      return ''
  }
}
