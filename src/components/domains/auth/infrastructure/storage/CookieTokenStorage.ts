import { cookies } from 'next/headers'
import type { ITokenStorage, TokenData } from '../../domain/repositories/ITokenStorage'

const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

export class CookieTokenStorage implements ITokenStorage {
  async save(tokens: TokenData): Promise<void> {
    const cookieStore = await cookies()

    cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expiresIn,
    })

    cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  async getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null
  }

  async getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null
  }

  async clear(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)
  }

  async exists(): Promise<boolean> {
    const token = await this.getAccessToken()
    return token !== null && token.length > 0
  }
}
