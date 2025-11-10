import type { IAuthRepository } from '../../domain/repositories/IAuthRepository'

export type VerifySuccess = {
  type: 'success'
}

export type VerifyError = {
  type: 'error'
  message: string
}

export type VerifyUseCaseResult = VerifySuccess | VerifyError

export class EmailVerificationUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async verify(token: string): Promise<VerifyUseCaseResult> {
    try {
      await this.authRepo.verifyEmail(token)

      return {
        type: 'success',
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Email verification failed',
      }
    }
  }

  async resend(email: string): Promise<VerifyUseCaseResult> {
    try {
      await this.authRepo.resendVerification(email)

      return {
        type: 'success',
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to resend verification email',
      }
    }
  }
}
