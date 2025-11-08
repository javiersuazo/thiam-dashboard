import type { IAuthRepository } from '../../domain/repositories/IAuthRepository'
import type { ITokenStorage } from '../../domain/repositories/ITokenStorage'
import type { ISessionStorage } from '../../domain/repositories/ISessionStorage'

export type LogoutSuccess = {
  type: 'success'
}

export type LogoutError = {
  type: 'error'
  message: string
}

export type LogoutUseCaseResult = LogoutSuccess | LogoutError

export class LogoutUseCase {
  constructor(
    private authRepo: IAuthRepository,
    private tokenStorage: ITokenStorage,
    private sessionStorage: ISessionStorage
  ) {}

  async execute(): Promise<LogoutUseCaseResult> {
    try {
      await this.authRepo.logout()
      await this.tokenStorage.clear()
      await this.sessionStorage.clear()

      return {
        type: 'success',
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Logout failed',
      }
    }
  }
}
