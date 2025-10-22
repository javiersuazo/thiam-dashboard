/**
 * Session Types - User session and authentication types
 */

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  emailVerified: boolean
  phoneVerified: boolean
  totpEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Account {
  id: string
  name: string
  type: 'Customer' | 'Caterer' | 'Partner' | 'Internal' | 'Both'
  email?: string
  phone?: string
  settings?: Record<string, unknown>
  createdAt: string
}

export interface Role {
  id: string
  name: string
  permissions: string[]
}

export interface SessionData {
  user: User
  accounts: Account[]
  activeAccountId: string
  roles: Role[]
  token: string
  expiresAt: string

  // Impersonation fields
  isImpersonating?: boolean
  adminUserId?: string
  impersonationSessionId?: string
}

export interface ImpersonationSession {
  id: string
  adminUserId: string
  impersonatedUserId: string
  impersonatedAccountId?: string
  reason: string
  startedAt: string
  endedAt?: string
}
