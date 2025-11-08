import type { IAuthRepository } from '../../domain/repositories/IAuthRepository'
import type { ITokenStorage } from '../../domain/repositories/ITokenStorage'
import type { ISessionStorage } from '../../domain/repositories/ISessionStorage'
import { TokenTTL } from '../../domain/value-objects/TokenTTL'
import type { LoginSuccess, LoginError } from './LoginUseCase'

export type Verify2FAUseCaseResult = LoginSuccess | LoginError

export class Verify2FAUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private tokenStorage: ITokenStorage,
    private sessionStorage: ISessionStorage
  ) {}

  async execute(challengeToken: string, code: string): Promise<Verify2FAUseCaseResult> {
    try {
      const result = await this.authRepo.verify2FA(challengeToken, code)

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
        message: error instanceof Error ? error.message : '2FA verification failed',
      }
    }
  }
}
