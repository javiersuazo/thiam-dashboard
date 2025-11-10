/**
 * Auth Validation Schemas
 *
 * Zod schemas for validating authentication forms.
 * All schemas include detailed error messages for better UX.
 */

import { z } from 'zod'

/**
 * Email validation
 */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long')
  .toLowerCase()
  .trim()

/**
 * Password validation
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

/**
 * Phone number validation (international format)
 */
const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (E.164 format)')
  .transform((val) => val.replace(/\s+/g, '')) // Remove spaces

/**
 * Name validation
 */
const nameSchema = z
  .string()
  .min(1, 'This field is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim()

/**
 * TOTP code validation (6 digits)
 */
export const totpCodeSchema = z
  .string()
  .length(6, 'Code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Code must only contain numbers')

/**
 * SMS code validation (6 digits)
 */
export const smsCodeSchema = z
  .string()
  .length(6, 'Code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Code must only contain numbers')

/**
 * OTT (One-Time Token) validation
 */
const ottTokenSchema = z
  .string()
  .min(1, 'Token is required')
  .max(500, 'Invalid token format')

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'), // Don't validate format on login
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Sign Up Schema
 */
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: nameSchema,
    lastName: nameSchema,
    phone: phoneSchema.optional(),
    accountName: z.string().min(1).max(200).optional(),
    accountType: z.enum(['customer', 'caterer'], {
      message: 'Please select an account type (customer or caterer)',
    }),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signupSchema>

/**
 * Two-Factor Verification Schema
 */
export const twoFactorVerifySchema = z.object({
  code: totpCodeSchema,
})

export type TwoFactorVerifyFormData = z.infer<typeof twoFactorVerifySchema>

/**
 * Two-Factor Setup Schema
 */
export const twoFactorSetupSchema = z.object({
  verificationCode: totpCodeSchema,
})

export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>

/**
 * Forgot Password Email Schema
 */
export const forgotPasswordEmailSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordEmailFormData = z.infer<typeof forgotPasswordEmailSchema>

/**
 * Forgot Password SMS Schema
 */
export const forgotPasswordSMSSchema = z.object({
  phone: phoneSchema,
})

export type ForgotPasswordSMSFormData = z.infer<typeof forgotPasswordSMSSchema>

/**
 * Reset Password Email Schema (with OTT)
 */
export const resetPasswordEmailSchema = z
  .object({
    token: ottTokenSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordEmailFormData = z.infer<typeof resetPasswordEmailSchema>

/**
 * Reset Password SMS Schema (with code)
 */
export const resetPasswordSMSSchema = z
  .object({
    phone: phoneSchema,
    code: smsCodeSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordSMSFormData = z.infer<typeof resetPasswordSMSSchema>

/**
 * Phone Verification Schema
 */
export const phoneVerificationSchema = z.object({
  phone: phoneSchema,
  code: smsCodeSchema,
})

export type PhoneVerificationFormData = z.infer<typeof phoneVerificationSchema>

/**
 * SMS Recovery Request Schema
 */
export const smsRecoveryRequestSchema = z.object({
  email: emailSchema,
})

export type SMSRecoveryRequestFormData = z.infer<typeof smsRecoveryRequestSchema>

/**
 * SMS Recovery Verify Schema
 */
export const smsRecoveryVerifySchema = z.object({
  email: emailSchema,
  code: smsCodeSchema,
})

export type SMSRecoveryVerifyFormData = z.infer<typeof smsRecoveryVerifySchema>

/**
 * Email Verification Schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>

/**
 * Resend Verification Email Schema
 */
export const resendVerificationSchema = z.object({
  email: emailSchema,
})

export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>

/**
 * Password strength requirements checker
 * Returns validation errors for password strength indicator
 */
export const passwordRequirements = {
  minLength: (password: string) => password.length >= 8,
  hasUppercase: (password: string) => /[A-Z]/.test(password),
  hasLowercase: (password: string) => /[a-z]/.test(password),
  hasNumber: (password: string) => /[0-9]/.test(password),
  hasSpecialChar: (password: string) => /[^A-Za-z0-9]/.test(password),
}

/**
 * Helper to validate email format (for real-time validation)
 */
export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

/**
 * Helper to validate phone format (for real-time validation)
 */
export function isValidPhone(phone: string): boolean {
  try {
    phoneSchema.parse(phone)
    return true
  } catch {
    return false
  }
}

/**
 * Helper to validate password strength (for real-time validation)
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  try {
    passwordSchema.parse(password)
    return { isValid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((err) => err.message),
      }
    }
    return { isValid: false, errors: ['Invalid password'] }
  }
}
