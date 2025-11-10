import type { IAuthRepository } from '../../domain/repositories/IAuthRepository'
import type { ITokenStorage } from '../../domain/repositories/ITokenStorage'
import type { ISessionStorage } from '../../domain/repositories/ISessionStorage'
import { TokenTTL } from '../../domain/value-objects/TokenTTL'

export type RefreshSuccess = {
  type: 'success'
  token: string
  refreshToken: string
  expiresAt: number
}

export type RefreshError = {
  type: 'error'
  message: string
}

export type RefreshTokenUseCaseResult = RefreshSuccess | RefreshError

export class RefreshTokenUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private tokenStorage: ITokenStorage,
    private sessionStorage: ISessionStorage
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenUseCaseResult> {
    try {
      const result = await this.authRepo.refreshToken(refreshToken)

      const ttl = TokenTTL.fromExpiresAt(result.expiresAt)

      await this.tokenStorage.save({
        accessToken: result.token,
        refreshToken: result.refreshToken,
        expiresIn: ttl.toSeconds(),
      })

      await this.sessionStorage.updateTokens(
        result.token,
        result.refreshToken,
        result.expiresAt
      )

      return {
        type: 'success',
        token: result.token,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Token refresh failed',
      }
    }
  }
}
