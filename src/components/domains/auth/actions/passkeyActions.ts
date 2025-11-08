'use server'

import type { ActionResult } from '@/types/actions'
import type { PasskeyCredential } from '../domain/repositories/IPasskeyRepository'

export async function beginPasskeyRegistrationAction(
  name: string
): Promise<ActionResult<{ options: Record<string, unknown>; sessionId: string }>> {
  try {
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: 'Passkey name is required',
      }
    }

    const { createPasskeyRegistrationUseCase } = await import('../application/factory')
    const passkeyRegistrationUseCase = createPasskeyRegistrationUseCase()
    const result = await passkeyRegistrationUseCase.beginRegistration(name)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    return {
      success: true,
      data: {
        options: result.options,
        sessionId: result.sessionId,
      },
    }
  } catch (error) {
    console.error('Begin passkey registration action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function finishPasskeyRegistrationAction(
  credential: PasskeyCredential,
  name: string,
  sessionId: string
): Promise<ActionResult<{ passkeyId?: string }>> {
  try {
    if (!credential || !sessionId) {
      return {
        success: false,
        error: 'Invalid registration data',
      }
    }

    const { createPasskeyRegistrationUseCase } = await import('../application/factory')
    const passkeyRegistrationUseCase = createPasskeyRegistrationUseCase()
    const result = await passkeyRegistrationUseCase.finishRegistration(credential, name, sessionId)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    return {
      success: true,
      data: {
        passkeyId: result.passkeyId,
      },
    }
  } catch (error) {
    console.error('Finish passkey registration action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function beginPasskeyLoginAction(
  email: string
): Promise<ActionResult<{ options: Record<string, unknown>; sessionId: string }>> {
  try {
    if (!email || email.trim().length === 0) {
      return {
        success: false,
        error: 'Email is required',
      }
    }

    const { createPasskeyLoginUseCase } = await import('../application/factory')
    const passkeyLoginUseCase = createPasskeyLoginUseCase()
    const result = await passkeyLoginUseCase.beginLogin(email)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    return {
      success: true,
      data: {
        options: result.options,
        sessionId: result.sessionId,
      },
    }
  } catch (error) {
    console.error('Begin passkey login action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function finishPasskeyLoginAction(
  credential: PasskeyCredential,
  sessionId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    if (!credential || !sessionId) {
      return {
        success: false,
        error: 'Invalid login data',
      }
    }

    const { createPasskeyLoginUseCase } = await import('../application/factory')
    const passkeyLoginUseCase = createPasskeyLoginUseCase()
    const result = await passkeyLoginUseCase.finishLogin(credential, sessionId)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    return {
      success: true,
      data: { success: true },
    }
  } catch (error) {
    console.error('Finish passkey login action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function listPasskeysAction(): Promise<
  ActionResult<{
    passkeys: Array<{
      id: string
      name: string
      createdAt: string
      lastUsed: string | null
    }>
  }>
> {
  try {
    const { createPasskeyManagementUseCase } = await import('../application/factory')
    const passkeyManagementUseCase = createPasskeyManagementUseCase()
    const result = await passkeyManagementUseCase.listPasskeys()

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    return {
      success: true,
      data: {
        passkeys: result.passkeys,
      },
    }
  } catch (error) {
    console.error('List passkeys action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function deletePasskeyAction(passkeyId: string): Promise<ActionResult> {
  try {
    if (!passkeyId) {
      return {
        success: false,
        error: 'Passkey ID is required',
      }
    }

    const { createPasskeyManagementUseCase } = await import('../application/factory')
    const passkeyManagementUseCase = createPasskeyManagementUseCase()
    const result = await passkeyManagementUseCase.deletePasskey(passkeyId)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Delete passkey action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function renamePasskeyAction(
  passkeyId: string,
  newName: string
): Promise<ActionResult> {
  try {
    if (!passkeyId || !newName || newName.trim().length === 0) {
      return {
        success: false,
        error: 'Passkey ID and new name are required',
      }
    }

    const { createPasskeyManagementUseCase } = await import('../application/factory')
    const passkeyManagementUseCase = createPasskeyManagementUseCase()
    const result = await passkeyManagementUseCase.renamePasskey(passkeyId, newName)

    if (result.type === 'error') {
      return {
        success: false,
        error: result.message,
      }
    }

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error('Rename passkey action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
