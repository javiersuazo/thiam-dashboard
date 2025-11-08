import type { IAuthRepository, LoginCredentials, LoginResult } from '../../domain/repositories/IAuthRepository'
import type { ITokenStorage } from '../../domain/repositories/ITokenStorage'
import type { ISessionStorage } from '../../domain/repositories/ISessionStorage'
import { TokenTTL } from '../../domain/value-objects/TokenTTL'

export type LoginSuccess = {
  type: 'success'
  user: LoginResult['user']
}

export type Login2FARequired = {
  type: 'needs2FA'
  challengeToken: string
  expiresAt: number
}

export type LoginError = {
  type: 'error'
  message: string
}

export type LoginUseCaseResult = LoginSuccess | Login2FARequired | LoginError

export class LoginUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private tokenStorage: ITokenStorage,
    private sessionStorage: ISessionStorage
  ) {}

  async execute(credentials: LoginCredentials): Promise<LoginUseCaseResult> {
    try {
      const result = await this.authRepo.authenticate(credentials)

      if ('totpRequired' in result) {
        return {
          type: 'needs2FA',
          challengeToken: result.challengeToken,
          expiresAt: result.expiresAt,
        }
      }

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
        message: error instanceof Error ? error.message : 'Authentication failed',
      }
    }
  }
}
