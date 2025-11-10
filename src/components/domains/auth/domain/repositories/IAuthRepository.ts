export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
    role: string
    accountId: string
    has2FAEnabled: boolean
    emailVerified: boolean
    phoneVerified: boolean
  }
}

export interface TwoFactorChallenge {
  totpRequired: true
  challengeToken: string
  expiresAt: number
}

export type AuthenticationResult = LoginResult | TwoFactorChallenge

export interface RefreshResult {
  token: string
  refreshToken: string
  expiresAt: number
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  accountName: string
  accountType: 'customer' | 'caterer' | 'partner' | 'internal' | 'both'
}

export interface RegisterResult {
  userId: string
  accountId: string
  email: string
}

export interface IAuthRepository {
  authenticate(credentials: LoginCredentials): Promise<AuthenticationResult>
  refreshToken(refreshToken: string): Promise<RefreshResult>
  verify2FA(challengeToken: string, code: string): Promise<LoginResult>
  logout(): Promise<void>
  register(data: RegisterData): Promise<RegisterResult>
  verifyEmail(token: string): Promise<void>
  resendVerification(email: string): Promise<void>
}
