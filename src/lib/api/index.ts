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

const API_BASE_URL = 'http://localhost:8080/api'

// Log API configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Client Configuration:', {
    baseUrl: API_BASE_URL,
    note: 'Schema paths include /v1/ prefix (e.g., /v1/accounts/{id})',
    env: process.env.NEXT_PUBLIC_API_URL,
  })
}

/**
 * Main API client for client-side usage
 *
 * Automatically includes:
 * - Authentication (from httpOnly cookies - sent automatically by browser)
 * - Error handling (401 redirect, etc.)
 * - Request logging (dev mode)
 * - Request IDs
 * - Content-Type headers
 * - Retry logic for failed requests
 */
const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include', // CRITICAL: Send cookies with cross-origin requests
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
 *
 * SECURITY NOTE:
 * Authentication is handled via httpOnly cookies which are:
 * - Automatically sent with every request by the browser
 * - NOT accessible to JavaScript (XSS protection)
 * - Protected with SameSite=lax (CSRF protection)
 */
export const api = client

/**
 * @deprecated Use server-side logout action instead
 * @see logoutAction in @/components/domains/auth/actions
 *
 * This function is deprecated because auth tokens are now stored in httpOnly cookies
 * which can only be cleared server-side. Use the logoutAction server action instead.
 */
export function logout(): void {
  console.warn('logout() is deprecated. Use logoutAction() server action instead.')

  if (typeof window !== 'undefined') {
    // Extract locale from current pathname (e.g., /en/dashboard -> en)
    const currentPath = window.location.pathname
    const localeMatch = currentPath.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'en' // Default to 'en' if no locale found

    window.location.href = `/${locale}/signin`
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
    baseUrl: API_BASE_URL,
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
 *   const { data, error } = await api.POST('/v1/auth/login', {
 *     body: credentials
 *   })
 *   return data
 * }
 * ```
 */
export function createPublicServerClient() {
  const publicClient = createClient<paths>({
    baseUrl: API_BASE_URL,
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
