import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import type { ISessionStorage, SessionData } from '../../domain/repositories/ISessionStorage'

const SESSION_COOKIE_NAME = 'thiam_session'
const SESSION_PASSWORD = process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export class IronSessionStorage implements ISessionStorage {
  private async getSession() {
    const cookieStore = await cookies()
    return getIronSession<SessionData>(cookieStore, {
      cookieName: SESSION_COOKIE_NAME,
      password: SESSION_PASSWORD,
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
      },
    })
  }

  async save(session: SessionData): Promise<void> {
    const ironSession = await this.getSession()
    ironSession.user = session.user
    ironSession.token = session.token
    ironSession.refreshToken = session.refreshToken
    ironSession.expiresAt = session.expiresAt
    ironSession.issuedAt = session.issuedAt
    await ironSession.save()
  }

  async get(): Promise<SessionData | null> {
    const ironSession = await this.getSession()

    if (!ironSession.user || !ironSession.token) {
      return null
    }

    return {
      user: ironSession.user,
      token: ironSession.token,
      refreshToken: ironSession.refreshToken,
      expiresAt: ironSession.expiresAt,
      issuedAt: ironSession.issuedAt,
    }
  }

  async clear(): Promise<void> {
    const ironSession = await this.getSession()
    ironSession.destroy()
  }

  async exists(): Promise<boolean> {
    const session = await this.get()
    return session !== null
  }

  async updateTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {
    const ironSession = await this.getSession()
    ironSession.token = accessToken
    ironSession.refreshToken = refreshToken
    ironSession.expiresAt = expiresAt
    await ironSession.save()
  }
}
