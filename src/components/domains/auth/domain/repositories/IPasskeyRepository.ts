export interface PasskeyRegistrationOptions {
  options: Record<string, unknown>
  sessionId: string
}

export interface PasskeyLoginOptions {
  options: Record<string, unknown>
  sessionId: string
}

export interface PasskeyCredential {
  id: string
  rawId: string
  response: Record<string, unknown>
  type: string
}

export interface PasskeyRegistrationResult {
  success: boolean
  passkeyId?: string
}

export interface PasskeyLoginResult {
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

export interface Passkey {
  id: string
  name: string
  createdAt: string
  lastUsed: string | null
}

export interface IPasskeyRepository {
  beginRegistration(name: string): Promise<PasskeyRegistrationOptions>
  finishRegistration(credential: PasskeyCredential, name: string, sessionId: string): Promise<PasskeyRegistrationResult>
  beginLogin(email: string): Promise<PasskeyLoginOptions>
  finishLogin(credential: PasskeyCredential, sessionId: string): Promise<PasskeyLoginResult>
  listPasskeys(): Promise<Passkey[]>
  deletePasskey(passkeyId: string): Promise<void>
  renamePasskey(passkeyId: string, newName: string): Promise<void>
}
