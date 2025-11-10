import type { IPasskeyRepository, Passkey } from '../../domain/repositories/IPasskeyRepository'

export type ListPasskeysSuccess = {
  type: 'success'
  passkeys: Passkey[]
}

export type ListPasskeysError = {
  type: 'error'
  message: string
}

export type ListPasskeysResult = ListPasskeysSuccess | ListPasskeysError

export type DeletePasskeySuccess = {
  type: 'success'
}

export type DeletePasskeyError = {
  type: 'error'
  message: string
}

export type DeletePasskeyResult = DeletePasskeySuccess | DeletePasskeyError

export type RenamePasskeySuccess = {
  type: 'success'
}

export type RenamePasskeyError = {
  type: 'error'
  message: string
}

export type RenamePasskeyResult = RenamePasskeySuccess | RenamePasskeyError

export class PasskeyManagementUseCase {
  constructor(private passkeyRepo: IPasskeyRepository) {}

  async listPasskeys(): Promise<ListPasskeysResult> {
    try {
      const passkeys = await this.passkeyRepo.listPasskeys()

      return {
        type: 'success',
        passkeys,
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to list passkeys',
      }
    }
  }

  async deletePasskey(passkeyId: string): Promise<DeletePasskeyResult> {
    try {
      await this.passkeyRepo.deletePasskey(passkeyId)

      return {
        type: 'success',
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete passkey',
      }
    }
  }

  async renamePasskey(passkeyId: string, newName: string): Promise<RenamePasskeyResult> {
    try {
      await this.passkeyRepo.renamePasskey(passkeyId, newName)

      return {
        type: 'success',
      }
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to rename passkey',
      }
    }
  }
}
