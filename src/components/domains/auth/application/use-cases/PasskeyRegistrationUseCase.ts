import type {
  IPasskeyRepository,
  PasskeyRegistrationOptions,
  PasskeyCredential,
} from '../../domain/repositories/IPasskeyRepository'

export type BeginPasskeyRegistrationSuccess = {
  type: 'success'
  options: Record<string, unknown>
  sessionId: string
}

export type BeginPasskeyRegistrationError = {
  type: 'error'
  message: string
}

export type BeginPasskeyRegistrationResult =
  | BeginPasskeyRegistrationSuccess
  | BeginPasskeyRegistrationError

export type FinishPasskeyRegistrationSuccess = {
  type: 'success'
  passkeyId?: string
}

export type FinishPasskeyRegistrationError = {
  type: 'error'
  message: string
}

export type FinishPasskeyRegistrationResult =
  | FinishPasskeyRegistrationSuccess
  | FinishPasskeyRegistrationError

export class PasskeyRegistrationUseCase {
  constructor(private passkeyRepo: IPasskeyRepository) {}

  async beginRegistration(name: string): Promise<BeginPasskeyRegistrationResult> {
    try {
      const result = await this.passkeyRepo.beginRegistration(name)

      return {
        type: 'success',
        options: result.options,
        sessionId: result.sessionId,
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to begin passkey registration',
      }
    }
  }

  async finishRegistration(
    credential: PasskeyCredential,
    name: string,
    sessionId: string
  ): Promise<FinishPasskeyRegistrationResult> {
    try {
      const result = await this.passkeyRepo.finishRegistration(credential, name, sessionId)

      return {
        type: 'success',
        passkeyId: result.passkeyId,
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to finish passkey registration',
      }
    }
  }
}
