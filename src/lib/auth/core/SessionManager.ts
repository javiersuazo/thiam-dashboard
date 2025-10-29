/**
 * SessionManager Class
 *
 * Singleton class for managing user sessions.
 * Handles session CRUD operations, token refresh, and validation.
 */

import type { Session, SessionUser } from '@/components/features/session/types'
import { TokenManager } from './TokenManager'
import {
  getSession as getSessionFromCookie,
  saveSession as saveSessionToCookie,
  deleteSession as deleteSessionFromCookie,
} from '../session'

export class SessionManager {
  private static instance: SessionManager
  private tokenManager: TokenManager

  private constructor() {
    this.tokenManager = TokenManager.getInstance()
  }

  /**
   * Get SessionManager instance (Singleton)
   */
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  /**
   * Create a new session
   *
   * @param data - Session creation data
   * @returns Promise that resolves when session is saved
   */
  async createSession(data: {
    user: SessionUser
    token: string
    refreshToken: string
    expiresAt: number
  }): Promise<void> {
    const session: Session = {
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      issuedAt: Date.now(),
    }

    await this.saveSession(session)
  }

  /**
   * Get current session
   *
   * Validates token and returns session if valid.
   * Returns null if no session or session is invalid.
   *
   * @returns Session or null
   */
  async getSession(): Promise<Session | null> {
    const session = await getSessionFromCookie()

    if (!session) {
      return null
    }

    // Validate token structure
    if (!this.tokenManager.isValid(session.token)) {
      await this.clearSession()
      return null
    }

    // Check if token is expired
    if (this.tokenManager.isExpired(session.expiresAt)) {
      await this.clearSession()
      return null
    }

    return session
  }

  /**
   * Update session with new token data
   *
   * @param updates - Partial session updates
   * @returns Promise that resolves when session is updated
   */
  async updateSession(updates: Partial<Session>): Promise<void> {
    const current = await this.getSession()

    if (!current) {
      throw new Error('No session to update')
    }

    const updated: Session = {
      ...current,
      ...updates,
    }

    await this.saveSession(updated)
  }

  /**
   * Update only token data (after refresh)
   *
   * @param token - New access token
   * @param refreshToken - New refresh token
   * @param expiresAt - New expiration timestamp
   * @returns Promise that resolves when tokens are updated
   */
  async updateTokens(
    token: string,
    refreshToken: string,
    expiresAt: number
  ): Promise<void> {
    await this.updateSession({
      token,
      refreshToken,
      expiresAt,
    })
  }

  /**
   * Update user data in session
   *
   * @param user - Updated user data
   * @returns Promise that resolves when user is updated
   */
  async updateUser(user: Partial<SessionUser>): Promise<void> {
    const current = await this.getSession()

    if (!current) {
      throw new Error('No session to update')
    }

    const updatedUser: SessionUser = {
      ...current.user,
      ...user,
    }

    await this.updateSession({ user: updatedUser })
  }

  /**
   * Clear session (logout)
   *
   * @returns Promise that resolves when session is cleared
   */
  async clearSession(): Promise<void> {
    await deleteSessionFromCookie()
  }

  /**
   * Check if user is authenticated
   *
   * @returns true if valid session exists
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return session !== null
  }

  /**
   * Get current user
   *
   * @returns SessionUser or null
   */
  async getCurrentUser(): Promise<SessionUser | null> {
    const session = await this.getSession()
    return session?.user || null
  }

  /**
   * Get current access token
   *
   * @returns Access token or null
   */
  async getAccessToken(): Promise<string | null> {
    const session = await this.getSession()
    return session?.token || null
  }

  /**
   * Get current refresh token
   *
   * @returns Refresh token or null
   */
  async getRefreshToken(): Promise<string | null> {
    const session = await this.getSession()
    return session?.refreshToken || null
  }

  /**
   * Check if session should be refreshed
   *
   * Returns true if token expires in less than 5 minutes.
   *
   * @returns true if session should be refreshed
   */
  async shouldRefresh(): Promise<boolean> {
    const session = await this.getSession()

    if (!session) {
      return false
    }

    return this.tokenManager.shouldRefresh(session.expiresAt)
  }

  /**
   * Get time until session expires (in seconds)
   *
   * @returns Seconds until expiry or 0 if no session
   */
  async getTimeUntilExpiry(): Promise<number> {
    const session = await this.getSession()

    if (!session) {
      return 0
    }

    return this.tokenManager.getTimeUntilExpiry(session.expiresAt)
  }

  /**
   * Get formatted time remaining
   *
   * @returns Formatted string (e.g., "5m 30s") or "No session"
   */
  async getFormattedTimeRemaining(): Promise<string> {
    const session = await this.getSession()

    if (!session) {
      return 'No session'
    }

    return this.tokenManager.formatTimeRemaining(session.expiresAt)
  }

  /**
   * Validate session and return user
   *
   * Throws error if no valid session exists.
   * Use this in protected routes/actions.
   *
   * @throws Error if not authenticated
   * @returns SessionUser
   */
  async requireSession(): Promise<SessionUser> {
    const session = await this.getSession()

    if (!session) {
      throw new Error('Authentication required')
    }

    return session.user
  }

  /**
   * Save session to storage
   *
   * @param session - Session to save
   * @returns Promise that resolves when session is saved
   */
  private async saveSession(session: Session): Promise<void> {
    await saveSessionToCookie(session)
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()
