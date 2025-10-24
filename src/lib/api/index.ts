/**
 * Thiam API Client
 *
 * Type-safe API client using openapi-fetch with full TypeScript support.
 * Works in both client-side and server-side contexts (Server Components, Server Actions, etc.)
 *
 * @example Client-side usage
 * ```ts
 * import { api } from '@/lib/api'
 *
 * // Type-safe GET request
 * const { data, error } = await api.GET('/accounts', {
 *   params: { query: { limit: 10, offset: 0 } }
 * })
 *
 * // Type-safe POST request
 * const { data, error } = await api.POST('/accounts', {
 *   body: { name: 'My Company', type: 'caterer' }
 * })
 * ```
 *
 * @example Server-side usage
 * ```ts
 * import { createServerClient } from '@/lib/api'
 *
 * // In a Server Component or Server Action
 * const api = await createServerClient()
 * const { data } = await api.GET('/accounts')
 * ```
 */

import createClient from 'openapi-fetch'
import type { paths } from './generated/schema'
import {
  authMiddleware,
  errorMiddleware,
  loggingMiddleware,
  createRetryMiddleware,
  requestIdMiddleware,
  contentTypeMiddleware,
} from './middleware'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * Main API client for client-side usage
 *
 * Automatically includes:
 * - Authentication (from sessionStorage)
 * - Error handling (401 redirect, etc.)
 * - Request logging (dev mode)
 * - Request IDs
 * - Content-Type headers
 * - Retry logic for failed requests
 */
const client = createClient<paths>({
  baseUrl: `${API_BASE_URL}/v1`,
})

// Add middleware in order
client.use(requestIdMiddleware)
client.use(contentTypeMiddleware)
client.use(authMiddleware)
client.use(loggingMiddleware)
client.use(errorMiddleware)
client.use(createRetryMiddleware(3)) // Retry up to 3 times

/**
 * Type-safe API client for browser usage
 *
 * Use this in:
 * - Client Components
 * - React Query hooks
 * - Event handlers
 * - Client-side utilities
 */
export const api = client

/**
 * Set authentication token
 *
 * Stores the token for future API requests.
 * Token is stored in sessionStorage (client-side only).
 *
 * @example
 * ```ts
 * import { setAuthToken } from '@/lib/api'
 *
 * // After successful login
 * setAuthToken(loginResponse.token)
 * ```
 */
export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') {
    console.warn('setAuthToken called on server-side - this is a no-op')
    return
  }

  if (token) {
    sessionStorage.setItem('auth_token', token)
  } else {
    sessionStorage.removeItem('auth_token')
  }
}

/**
 * Get current authentication token
 *
 * @returns The current auth token or null
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('auth_token')
}

/**
 * Clear authentication token and logout
 *
 * Removes the token and redirects to login page.
 *
 * @example
 * ```ts
 * import { logout } from '@/lib/api'
 *
 * function handleLogout() {
 *   logout()
 * }
 * ```
 */
export function logout(): void {
  setAuthToken(null)

  if (typeof window !== 'undefined') {
    window.location.href = '/signin'
  }
}

/**
 * Create an authenticated API client with a specific token
 *
 * Useful for:
 * - Server-side requests with a known token
 * - Testing
 * - Service-to-service calls
 *
 * @param token - JWT token to use for authentication
 *
 * @example Server Action
 * ```ts
 * import { createAuthenticatedClient } from '@/lib/api'
 *
 * export async function getAccounts(token: string) {
 *   const api = createAuthenticatedClient(token)
 *   const { data, error } = await api.GET('/accounts')
 *   return data
 * }
 * ```
 */
export function createAuthenticatedClient(token: string) {
  const authenticatedClient = createClient<paths>({
    baseUrl: `${API_BASE_URL}/v1`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // Add middleware (except auth middleware since we have the token)
  authenticatedClient.use(requestIdMiddleware)
  authenticatedClient.use(contentTypeMiddleware)
  authenticatedClient.use(loggingMiddleware)
  authenticatedClient.use(errorMiddleware)
  authenticatedClient.use(createRetryMiddleware(3))

  return authenticatedClient
}

/**
 * Create a public API client for unauthenticated endpoints
 *
 * Use for public endpoints like:
 * - Login
 * - Signup
 * - Password reset
 * - Email verification
 *
 * @example Server Action
 * ```ts
 * import { createPublicServerClient } from '@/lib/api'
 *
 * export async function loginAction(credentials) {
 *   const api = createPublicServerClient()
 *   const { data, error } = await api.POST('/auth/login', {
 *     body: credentials
 *   })
 *   return data
 * }
 * ```
 */
export function createPublicServerClient() {
  const publicClient = createClient<paths>({
    baseUrl: `${API_BASE_URL}/v1`,
  })

  // Add middleware (no auth middleware for public endpoints)
  publicClient.use(requestIdMiddleware)
  publicClient.use(contentTypeMiddleware)
  publicClient.use(loggingMiddleware)
  publicClient.use(errorMiddleware)
  publicClient.use(createRetryMiddleware(3))

  return publicClient
}

// Re-export types for convenience
export type { paths } from './generated/schema'
export type { components } from './generated/schema'
