export interface SessionData {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    fullName: string
    phone: string | null
    role: 'customer' | 'caterer' | 'admin' | 'ops' | 'finance' | 'sales'
    accountId: string
    has2FAEnabled: boolean
    emailVerified: boolean
    phoneVerified: boolean
  }
  token: string
  refreshToken: string
  expiresAt: number
  issuedAt: number
}

export interface ISessionStorage {
  save(session: SessionData): Promise<void>
  get(): Promise<SessionData | null>
  clear(): Promise<void>
  exists(): Promise<boolean>
  updateTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void>
}
