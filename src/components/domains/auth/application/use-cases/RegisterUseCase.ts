import type { IAuthRepository, RegisterData, RegisterResult } from '../../domain/repositories/IAuthRepository'

export type RegisterSuccess = {
  type: 'success'
  result: RegisterResult
}

export type RegisterError = {
  type: 'error'
  message: string
}

export type RegisterUseCaseResult = RegisterSuccess | RegisterError

export class RegisterUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(data: RegisterData): Promise<RegisterUseCaseResult> {
    try {
      const result = await this.authRepo.register(data)

      return {
        type: 'success',
        result,
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }
}
