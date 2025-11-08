import type {
  IPasskeyRepository,
  PasskeyCredential,
  PasskeyLoginResult,
} from '../../domain/repositories/IPasskeyRepository'
import type { ITokenStorage } from '../../domain/repositories/ITokenStorage'
import type { ISessionStorage } from '../../domain/repositories/ISessionStorage'
import { TokenTTL } from '../../domain/value-objects/TokenTTL'

export type BeginPasskeyLoginSuccess = {
  type: 'success'
  options: Record<string, unknown>
  sessionId: string
}

export type BeginPasskeyLoginError = {
  type: 'error'
  message: string
}

export type BeginPasskeyLoginResult = BeginPasskeyLoginSuccess | BeginPasskeyLoginError

export type FinishPasskeyLoginSuccess = {
  type: 'success'
  user: PasskeyLoginResult['user']
}

export type FinishPasskeyLoginError = {
  type: 'error'
  message: string
}

export type FinishPasskeyLoginResult = FinishPasskeyLoginSuccess | FinishPasskeyLoginError

export class PasskeyLoginUseCase {
  constructor(
    private passkeyRepo: IPasskeyRepository,
    private tokenStorage: ITokenStorage,
    private sessionStorage: ISessionStorage
  ) {}

  async beginLogin(email: string): Promise<BeginPasskeyLoginResult> {
    try {
      const result = await this.passkeyRepo.beginLogin(email)

      return {
        type: 'success',
        options: result.options,
        sessionId: result.sessionId,
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to begin passkey login',
      }
    }
  }

  async finishLogin(
    credential: PasskeyCredential,
    sessionId: string
  ): Promise<FinishPasskeyLoginResult> {
    try {
      const result = await this.passkeyRepo.finishLogin(credential, sessionId)

      const ttl = TokenTTL.fromExpiresAt(result.expiresAt)

      await this.tokenStorage.save({
        accessToken: result.token,
        refreshToken: result.refreshToken,
        expiresIn: ttl.toSeconds(),
      })

      await this.sessionStorage.save({
        user: {
          ...result.user,
          fullName: [result.user.firstName, result.user.lastName].filter(Boolean).join(' '),
        },
        token: result.token,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
        issuedAt: Date.now(),
      })

      return {
        type: 'success',
        user: result.user,
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Passkey login failed',
      }
    }
  }
}
