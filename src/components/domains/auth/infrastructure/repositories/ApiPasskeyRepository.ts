import type {
  IPasskeyRepository,
  PasskeyRegistrationOptions,
  PasskeyLoginOptions,
  PasskeyCredential,
  PasskeyRegistrationResult,
  PasskeyLoginResult,
  Passkey,
} from '../../domain/repositories/IPasskeyRepository'
import { createPublicClient } from '@/lib/api/server'

export class ApiPasskeyRepository implements IPasskeyRepository {
  async beginRegistration(name: string): Promise<PasskeyRegistrationOptions> {
    const api = createPublicClient()

    const { data, error } = await api.POST('/api/v1/passkeys/register/begin', {
      body: { name },
    })

    if (error || !data) {
      throw new Error((error as any)?.message || 'Failed to begin passkey registration')
    }

    const apiData = data as {
      options: Record<string, unknown>
      session_id: string
    }

    return {
      options: apiData.options,
      sessionId: apiData.session_id,
    }
  }

  async finishRegistration(
    credential: PasskeyCredential,
    name: string,
    sessionId: string
  ): Promise<PasskeyRegistrationResult> {
    const api = createPublicClient()

    const { data, error } = await api.POST('/api/v1/passkeys/register/finish', {
      body: {
        credential,
        name,
        session_id: sessionId,
      },
    })

    if (error) {
      throw new Error((error as any)?.message || 'Failed to finish passkey registration')
    }

    const apiData = (data || {}) as {
      passkey_id?: string
    }

    return {
      success: true,
      passkeyId: apiData.passkey_id,
    }
  }

  async beginLogin(email: string): Promise<PasskeyLoginOptions> {
    const api = createPublicClient()

    const { data, error } = await api.POST('/api/v1/passkeys/login/begin', {
      body: { email },
    })

    if (error || !data) {
      throw new Error((error as any)?.message || 'Failed to begin passkey login')
    }

    const apiData = data as {
      options: Record<string, unknown>
      session_id: string
    }

    return {
      options: apiData.options,
      sessionId: apiData.session_id,
    }
  }

  async finishLogin(credential: PasskeyCredential, sessionId: string): Promise<PasskeyLoginResult> {
    const api = createPublicClient()

    const { data, error } = await api.POST('/api/v1/passkeys/login/finish', {
      body: {
        credential,
        session_id: sessionId,
      },
    })

    if (error || !data) {
      throw new Error((error as any)?.message || 'Passkey login failed')
    }

    const apiData = data as {
      access_token: string
      refresh_token: string
      expires_at: number
      user_id: string
      email: string
      first_name: string
      last_name: string
      phone?: string
    }

    if (!apiData.access_token || !apiData.refresh_token) {
      throw new Error('Invalid response from server - missing tokens')
    }

    return {
      token: apiData.access_token,
      refreshToken: apiData.refresh_token,
      expiresAt: apiData.expires_at * 1000,
      user: {
        id: apiData.user_id,
        email: apiData.email,
        firstName: apiData.first_name || null,
        lastName: apiData.last_name || null,
        phone: apiData.phone || null,
        role: 'customer',
        accountId: '',
        has2FAEnabled: false,
        emailVerified: true,
        phoneVerified: false,
      },
    }
  }

  async listPasskeys(): Promise<Passkey[]> {
    const api = createPublicClient()

    const { data, error } = await api.GET('/api/v1/passkeys')

    if (error) {
      throw new Error((error as any)?.message || 'Failed to list passkeys')
    }

    const apiData = (data || {}) as {
      passkeys?: Array<{
        id: string
        name: string
        created_at: string
        last_used?: string
      }>
    }

    return (apiData.passkeys || []).map(pk => ({
      id: pk.id,
      name: pk.name,
      createdAt: pk.created_at,
      lastUsed: pk.last_used || null,
    }))
  }

  async deletePasskey(passkeyId: string): Promise<void> {
    const api = createPublicClient()

    const { error } = await api.DELETE('/api/v1/passkeys/{id}', {
      params: { path: { id: passkeyId } },
    })

    if (error) {
      throw new Error((error as any)?.message || 'Failed to delete passkey')
    }
  }

  async renamePasskey(passkeyId: string, newName: string): Promise<void> {
    const api = createPublicClient()

    const { error } = await api.PATCH('/api/v1/passkeys/{id}', {
      params: { path: { id: passkeyId } },
      body: { name: newName },
    })

    if (error) {
      throw new Error((error as any)?.message || 'Failed to rename passkey')
    }
  }
}
