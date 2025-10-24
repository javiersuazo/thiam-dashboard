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
  resetPasswordAction,
} from './actions'

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

// Hooks will be exported when created
// export { useAuthForm } from './hooks/useAuthForm'
// export { use2FASetup } from './hooks/use2FASetup'
// etc.
