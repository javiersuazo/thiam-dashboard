/**
 * Auth Domain - Public API
 *
 * Barrel export for the auth domain.
 * Only export what other domains/features need to use.
 */

// Types
export type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  SignUpData,
  SignUpResponse,
  TwoFactorSetupResponse,
  TwoFactorEnableResponse,
  TwoFactorDisableResponse,
  BackupCodesResponse,
  TwoFactorVerifyData,
  SMSRecoveryRequestData,
  SMSRecoveryVerifyData,
  PasswordResetMethod,
  ForgotPasswordEmailData,
  ForgotPasswordSMSData,
  ResetPasswordEmailData,
  ResetPasswordSMSData,
  VerifyEmailData,
  VerifyEmailResponse,
  ResendVerificationData,
  OAuthProvider,
  AuthError,
  AuthState,
  PasswordStrength,
  PasswordStrengthResult,
} from './types/auth.types'

// Validation Schemas
export {
  loginSchema,
  signupSchema,
  twoFactorVerifySchema,
  smsRecoveryRequestSchema,
  smsRecoveryVerifySchema,
  forgotPasswordEmailSchema,
  forgotPasswordSMSSchema,
  resetPasswordEmailSchema,
  resetPasswordSMSSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  phoneVerificationSchema,
  totpCodeSchema,
  smsCodeSchema,
  isValidEmail,
  isValidPhone,
  validatePasswordStrength,
  passwordRequirements,
} from './validation/authSchemas'

export type {
  LoginFormData,
  SignUpFormData,
  TwoFactorVerifyFormData,
  SMSRecoveryRequestFormData,
  SMSRecoveryVerifyFormData,
  ForgotPasswordEmailFormData,
  ForgotPasswordSMSFormData,
  ResetPasswordEmailFormData,
  ResetPasswordSMSFormData,
  VerifyEmailFormData,
  ResendVerificationFormData,
  PhoneVerificationFormData,
} from './validation/authSchemas'

// Utilities
export {
  formatPhone,
  formatPhoneDisplay,
  isValidEmailFormat,
  getInitials,
  getFullName,
  toSessionUser,
  hasRole,
  isAdmin,
  isCaterer,
  isCustomer,
  maskEmail,
  maskPhone,
  calculateSessionExpiry,
  isSessionExpired,
  getSessionTimeRemaining,
  formatTimeRemaining,
} from './utils/authHelpers'

export {
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  getPasswordFeedback,
  meetsPasswordRequirements,
  evaluatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from './utils/passwordStrength'

export {
  createSession,
  loadSessionFromStorage,
  saveSessionToStorage,
  clearSessionFromStorage,
  shouldRefreshSession,
  getSessionAge,
  isSessionFresh,
} from './utils/sessionHelpers'

// Server Actions
export {
  loginAction,
  verify2FALoginAction,
  signupAction,
  logoutAction,
  refreshSessionAction,
  getCurrentSessionAction,
  setup2FAAction,
  enable2FAAction,
  disable2FAAction,
  regenerateBackupCodesAction,
  requestSMSRecoveryAction,
  verifySMSRecoveryAction,
  forgotPasswordAction,
  forgotPasswordPhoneAction,
  resetPasswordAction,
  verifyEmailAction,
  resendVerificationAction,
} from './actions'

// OAuth Actions (exported separately to avoid 'use server' file restrictions)
export {
  initiateOAuthAction,
  completeOAuthAction,
  linkOAuthAccountAction,
  unlinkOAuthAccountAction,
} from './actions/oauthActions'

// Components
export { default as SignInForm } from './components/SignInForm'
export { default as SignUpForm } from './components/SignUpForm'
export { default as TwoFactorSetup } from './components/TwoFactorSetup'
export { default as TwoFactorEnable } from './components/TwoFactorEnable'
export { default as BackupCodes } from './components/BackupCodes'
export { default as TwoFactorSetupFlow } from './components/TwoFactorSetupFlow'
export { default as TwoFactorSettings } from './components/TwoFactorSettings'
export { default as SMSRecoveryRequest } from './components/SMSRecoveryRequest'
export { default as SMSRecoveryVerify } from './components/SMSRecoveryVerify'
export { default as SMSRecoveryFlow } from './components/SMSRecoveryFlow'
export { default as ForgotPasswordForm } from './components/ForgotPasswordForm'
export { default as ResetPasswordForm } from './components/ResetPasswordForm'
export { default as EmailVerificationSent } from './components/EmailVerificationSent'
export { default as VerifyEmail } from './components/VerifyEmail'
export { default as TwoFactorVerifyLogin } from './components/TwoFactorVerifyLogin'
export { default as BackupCodeVerifyLogin } from './components/BackupCodeVerifyLogin'
export {
  GoogleLoginButton,
  TwitterLoginButton,
  OAuthButtonsGroup,
} from './components/OAuthButtons'
export { default as PhoneVerificationRequest } from './components/PhoneVerificationRequest'
export { default as PhoneVerificationCode } from './components/PhoneVerificationCode'
export { default as PhoneVerificationFlow } from './components/PhoneVerificationFlow'
export { default as PasskeyEnrollmentPrompt } from './components/PasskeyEnrollmentPrompt'

// Hooks will be exported when created
// export { useAuthForm } from './hooks/useAuthForm'
// export { use2FASetup } from './hooks/use2FASetup'
// etc.
