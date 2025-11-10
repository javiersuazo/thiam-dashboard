'use server'

import { createServerClient } from '@/lib/api/server'
import type { ActionResult } from '@/types/actions'

type MFASetupResponse = {
  secret: string
  qr_code_url: string
  backup_codes: string[]
}

type MFAStatusResponse = {
  mfa_enabled: boolean
  backup_codes_remaining: number
}

export async function setupMFAAction(): Promise<ActionResult<MFASetupResponse>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const response = await api.POST('/api/v1/mfa/setup', {})

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Failed to setup MFA',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'MFA setup failed',
      }
    }

    return {
      success: true,
      data: response.data as unknown as MFASetupResponse,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function verifyMFASetupAction(code: string): Promise<ActionResult<void>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const response = await api.POST('/api/v1/mfa/verify-setup', {
      body: { code },
    })

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Failed to verify MFA code',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function disableMFAAction(password: string, code: string): Promise<ActionResult<void>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const response = await api.POST('/api/v1/mfa/disable', {
      body: { password, code },
    })

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Failed to disable MFA',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function getMFAStatusAction(): Promise<ActionResult<MFAStatusResponse>> {
  try {
    const api = await createServerClient()
    if (!api) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const response = await api.GET('/api/v1/mfa/status', {})

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Failed to get MFA status',
      }
    }

    if (!response.data) {
      return {
        success: false,
        error: 'Failed to get MFA status',
      }
    }

    return {
      success: true,
      data: response.data as unknown as MFAStatusResponse,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
