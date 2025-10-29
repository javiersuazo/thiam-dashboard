/**
 * Auth Error Mapping Utility
 *
 * Maps API error responses to i18n translation keys.
 * This ensures all error messages are properly localized.
 *
 * The API returns errors in this format:
 * {
 *   code: 2101,                    // Numeric application code
 *   key: "INVALID_CREDENTIALS",    // Machine-readable key (best for i18n)
 *   message: "invalid credentials" // Human-readable English message
 * }
 */

/**
 * API Error Response Type
 */
export interface ApiErrorResponse {
  code?: number
  key?: string
  message?: string
}

/**
 * Auth Error Codes
 * These map to translation keys in messages/{locale}.json
 */
export const AUTH_ERROR_CODES = {
  // Common errors
  NETWORK_ERROR: 'common.errors.network',
  UNKNOWN_ERROR: 'common.errors.unknown',
  VALIDATION_ERROR: 'common.errors.validation',

  // Sign In errors
  INVALID_CREDENTIALS: 'auth.signin.errors.invalidCredentials',
  ACCOUNT_LOCKED: 'auth.signin.errors.accountLocked',
  EMAIL_NOT_VERIFIED: 'auth.signin.errors.emailNotVerified',
  SIGNIN_GENERIC: 'auth.signin.errors.generic',

  // Rate Limit errors
  RATE_LIMIT_EXCEEDED: 'auth.errors.rateLimitExceeded',
  TOO_MANY_LOGIN_ATTEMPTS: 'auth.errors.tooManyLoginAttempts',

  // Sign Up errors
  EMAIL_EXISTS: 'auth.signup.errors.emailExists',
  WEAK_PASSWORD: 'auth.signup.errors.weakPassword',
  SIGNUP_GENERIC: 'auth.signup.errors.generic',

  // Password Reset errors
  INVALID_TOKEN: 'auth.resetPassword.errors.invalidToken',
  PASSWORD_MISMATCH: 'auth.resetPassword.errors.passwordMismatch',
  RESET_GENERIC: 'auth.resetPassword.errors.generic',

  // 2FA errors
  INVALID_2FA_CODE: 'auth.twoFactor.errors.invalid',
  EXPIRED_2FA_CODE: 'auth.twoFactor.errors.expired',

  // Phone verification errors
  INVALID_PHONE_CODE: 'auth.phoneVerification.errors.invalid',

  // Email verification errors
  INVALID_VERIFICATION_TOKEN: 'auth.emailVerification.errors.invalidToken',
} as const

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES]

/**
 * Map API error response to error code (PRIORITY: Use this for structured API errors)
 *
 * This function handles the structured error response from the API:
 * Priority 1: Use the 'key' field (machine-readable, best for i18n)
 * Priority 2: Use the 'code' field (numeric application code)
 * Priority 3: Parse the 'message' field as fallback
 *
 * @param apiError - The error response from the API
 * @param context - The context (signin, signup, reset, etc.)
 * @returns Translation key for the error
 */
export function mapApiErrorResponse(
  apiError: ApiErrorResponse,
  context: 'signin' | 'signup' | 'reset' | 'generic' = 'generic'
): AuthErrorCode {
  // Priority 1: Use the key field (best for i18n)
  if (apiError.key) {
    switch (apiError.key) {
      // Auth errors
      case 'INVALID_CREDENTIALS':
        return AUTH_ERROR_CODES.INVALID_CREDENTIALS
      case 'ACCOUNT_LOCKED':
        return AUTH_ERROR_CODES.ACCOUNT_LOCKED
      case 'MISSING_TOKEN_CONTEXT':
      case 'REVOKE_FAILED':
      case 'PASSWORD_RESET_FAILED':
        return AUTH_ERROR_CODES.SIGNIN_GENERIC

      // Rate limit errors
      case 'RATE_LIMIT_EXCEEDED':
        return AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED
      case 'TOO_MANY_LOGIN_ATTEMPTS':
        return AUTH_ERROR_CODES.TOO_MANY_LOGIN_ATTEMPTS

      // Generic errors
      case 'INVALID_REQUEST':
        return AUTH_ERROR_CODES.VALIDATION_ERROR
      case 'UNAUTHORIZED':
        return AUTH_ERROR_CODES.INVALID_CREDENTIALS
      case 'FORBIDDEN':
        return AUTH_ERROR_CODES.ACCOUNT_LOCKED
      case 'CONFLICT':
        // Check message for more context
        const msg = apiError.message?.toLowerCase() || ''
        if (msg.includes('email')) {
          return AUTH_ERROR_CODES.EMAIL_EXISTS
        }
        if (msg.includes('phone')) {
          return AUTH_ERROR_CODES.EMAIL_EXISTS // Using same key for now
        }
        return AUTH_ERROR_CODES.VALIDATION_ERROR

      // If key doesn't match, fall through to code/message checking
    }
  }

  // Priority 2: Use numeric code
  if (apiError.code) {
    switch (apiError.code) {
      // Generic codes
      case 1001: // INVALID_REQUEST
        return AUTH_ERROR_CODES.VALIDATION_ERROR
      case 1002: // UNAUTHORIZED
        return AUTH_ERROR_CODES.INVALID_CREDENTIALS
      case 1003: // FORBIDDEN
        return AUTH_ERROR_CODES.ACCOUNT_LOCKED
      case 1004: // NOT_FOUND
        return AUTH_ERROR_CODES.INVALID_CREDENTIALS
      case 1009: // CONFLICT
        return AUTH_ERROR_CODES.EMAIL_EXISTS

      // Auth-specific codes
      case 2101: // INVALID_CREDENTIALS
        return AUTH_ERROR_CODES.INVALID_CREDENTIALS
      case 2102: // MISSING_TOKEN_CONTEXT
      case 2103: // REVOKE_FAILED
      case 2104: // PASSWORD_RESET_FAILED
        return context === 'signin'
          ? AUTH_ERROR_CODES.SIGNIN_GENERIC
          : AUTH_ERROR_CODES.UNKNOWN_ERROR
    }
  }

  // Priority 3: Parse message as fallback
  if (apiError.message) {
    return getErrorCode(apiError.message, context)
  }

  // Final fallback
  switch (context) {
    case 'signin':
      return AUTH_ERROR_CODES.SIGNIN_GENERIC
    case 'signup':
      return AUTH_ERROR_CODES.SIGNUP_GENERIC
    case 'reset':
      return AUTH_ERROR_CODES.RESET_GENERIC
    default:
      return AUTH_ERROR_CODES.UNKNOWN_ERROR
  }
}

/**
 * Map API error response to error code (LEGACY: For unstructured errors)
 *
 * This function analyzes the API error and returns the appropriate
 * translation key for displaying to the user.
 *
 * @deprecated Use mapApiErrorResponse for structured API errors
 */
export function mapApiErrorToCode(error: unknown, context: 'signin' | 'signup' | 'reset' | 'generic' = 'generic'): AuthErrorCode {
  // Handle network errors (fetch failed, timeout, etc.)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return AUTH_ERROR_CODES.NETWORK_ERROR
  }

  // Handle API error responses
  if (error && typeof error === 'object') {
    const apiError = error as Record<string, unknown>

    // Check for specific error codes from the API
    if (apiError.code || apiError.error_code || apiError.errorCode) {
      const code = apiError.code || apiError.error_code || apiError.errorCode

      // Map common API error codes to our error codes
      switch (code) {
        case 'invalid_credentials':
        case 'INVALID_CREDENTIALS':
        case 'invalid_password':
        case 'incorrect_password':
          return AUTH_ERROR_CODES.INVALID_CREDENTIALS

        case 'account_locked':
        case 'ACCOUNT_LOCKED':
          return AUTH_ERROR_CODES.ACCOUNT_LOCKED

        case 'email_not_verified':
        case 'EMAIL_NOT_VERIFIED':
          return AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED

        case 'email_exists':
        case 'EMAIL_EXISTS':
        case 'duplicate_email':
          return AUTH_ERROR_CODES.EMAIL_EXISTS

        case 'weak_password':
        case 'WEAK_PASSWORD':
        case 'password_too_weak':
          return AUTH_ERROR_CODES.WEAK_PASSWORD

        case 'invalid_token':
        case 'INVALID_TOKEN':
        case 'expired_token':
        case 'token_expired':
          return AUTH_ERROR_CODES.INVALID_TOKEN

        case 'invalid_2fa':
        case 'invalid_otp':
        case 'INVALID_2FA':
          return AUTH_ERROR_CODES.INVALID_2FA_CODE
      }
    }

    // Check for HTTP status codes
    if (apiError.status) {
      switch (apiError.status) {
        case 401:
          return context === 'signin'
            ? AUTH_ERROR_CODES.INVALID_CREDENTIALS
            : AUTH_ERROR_CODES.UNKNOWN_ERROR
        case 403:
          return AUTH_ERROR_CODES.ACCOUNT_LOCKED
        case 409:
          return AUTH_ERROR_CODES.EMAIL_EXISTS
        case 422:
          return AUTH_ERROR_CODES.VALIDATION_ERROR
        case 429:
          return AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED
      }
    }

    // Check error message content for keywords
    if (apiError.message && typeof apiError.message === 'string') {
      const msg = apiError.message.toLowerCase()

      if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('attempts')) {
        if (msg.includes('login') || msg.includes('authentication')) {
          return AUTH_ERROR_CODES.TOO_MANY_LOGIN_ATTEMPTS
        }
        return AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED
      }
      if (msg.includes('credential') || msg.includes('password') || msg.includes('email')) {
        return AUTH_ERROR_CODES.INVALID_CREDENTIALS
      }
      if (msg.includes('locked') || msg.includes('blocked')) {
        return AUTH_ERROR_CODES.ACCOUNT_LOCKED
      }
      if (msg.includes('verified') || msg.includes('verification')) {
        return AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED
      }
      if (msg.includes('exists') || msg.includes('duplicate')) {
        return AUTH_ERROR_CODES.EMAIL_EXISTS
      }
      if (msg.includes('token') || msg.includes('expired')) {
        return AUTH_ERROR_CODES.INVALID_TOKEN
      }
      if (msg.includes('network') || msg.includes('fetch')) {
        return AUTH_ERROR_CODES.NETWORK_ERROR
      }
    }
  }

  // Return context-specific generic error
  switch (context) {
    case 'signin':
      return AUTH_ERROR_CODES.SIGNIN_GENERIC
    case 'signup':
      return AUTH_ERROR_CODES.SIGNUP_GENERIC
    case 'reset':
      return AUTH_ERROR_CODES.RESET_GENERIC
    default:
      return AUTH_ERROR_CODES.UNKNOWN_ERROR
  }
}

/**
 * Extract error code from ActionResult
 */
export function getErrorCode(errorMessage: string, context: 'signin' | 'signup' | 'reset' | 'generic' = 'generic'): AuthErrorCode {
  // If the error message is already a translation key, return it
  if (errorMessage.startsWith('auth.') || errorMessage.startsWith('common.')) {
    return errorMessage as AuthErrorCode
  }

  // Otherwise, try to map it
  const msg = errorMessage.toLowerCase()

  if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('attempts')) {
    if (msg.includes('login') || msg.includes('authentication')) {
      return AUTH_ERROR_CODES.TOO_MANY_LOGIN_ATTEMPTS
    }
    return AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED
  }
  if (msg.includes('credential') || msg.includes('invalid') && (msg.includes('email') || msg.includes('password'))) {
    return AUTH_ERROR_CODES.INVALID_CREDENTIALS
  }
  if (msg.includes('locked') || msg.includes('blocked')) {
    return AUTH_ERROR_CODES.ACCOUNT_LOCKED
  }
  if (msg.includes('verified') || msg.includes('verification')) {
    return AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED
  }
  if (msg.includes('exists') || msg.includes('duplicate')) {
    return AUTH_ERROR_CODES.EMAIL_EXISTS
  }
  if (msg.includes('weak') || msg.includes('strength')) {
    return AUTH_ERROR_CODES.WEAK_PASSWORD
  }
  if (msg.includes('token') || msg.includes('expired')) {
    return AUTH_ERROR_CODES.INVALID_TOKEN
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return AUTH_ERROR_CODES.NETWORK_ERROR
  }

  // Return context-specific generic error
  switch (context) {
    case 'signin':
      return AUTH_ERROR_CODES.SIGNIN_GENERIC
    case 'signup':
      return AUTH_ERROR_CODES.SIGNUP_GENERIC
    case 'reset':
      return AUTH_ERROR_CODES.RESET_GENERIC
    default:
      return AUTH_ERROR_CODES.UNKNOWN_ERROR
  }
}
