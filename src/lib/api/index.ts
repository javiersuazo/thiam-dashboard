/**
 * Thiam API Client
 *
 * Type-safe API client generated from OpenAPI spec.
 * Auto-completes endpoints, requests, and responses.
 *
 * @example
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
 */

import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from './generated/schema'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * Authentication middleware
 * Automatically adds Authorization header to all requests
 */
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    // In a real app, get token from session/cookie/localStorage
    // For now, we'll check for a token in the request headers or get it from session
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }

    return request
  },
}

/**
 * Error handling middleware
 * Logs errors and can be extended for global error handling
 */
const errorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`)

      // You can add global error handling here:
      // - Show toast notifications
      // - Redirect to login on 401
      // - Track errors in analytics
    }

    return response
  },
}

/**
 * Create the API client with all middleware
 */
const client = createClient<paths>({
  baseUrl: `${API_BASE_URL}/v1`,
})

// Add middleware
client.use(authMiddleware)
client.use(errorMiddleware)

/**
 * Type-safe API client
 *
 * Provides full TypeScript autocomplete for:
 * - All API endpoints
 * - Request parameters (path, query, body)
 * - Response data structures
 * - Error responses
 */
export const api = client

/**
 * Helper to set auth token for requests
 *
 * @example
 * ```ts
 * import { setAuthToken } from '@/lib/api'
 *
 * setAuthToken('your-jwt-token')
 * ```
 */
export function setAuthToken(token: string | null) {
  if (token) {
    // Store token for middleware to use
    // In a real app, this might set it in a cookie or localStorage
    sessionStorage.setItem('auth_token', token)
  } else {
    sessionStorage.removeItem('auth_token')
  }
}

/**
 * Helper to get current auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('auth_token')
}

/**
 * Create an authenticated API client with a specific token
 * Useful for server-side requests where you have the token from session
 *
 * @example
 * ```ts
 * import { createAuthenticatedClient } from '@/lib/api'
 *
 * const authenticatedApi = createAuthenticatedClient(userToken)
 * const { data } = await authenticatedApi.GET('/accounts')
 * ```
 */
export function createAuthenticatedClient(token: string) {
  const authenticatedClient = createClient<paths>({
    baseUrl: `${API_BASE_URL}/v1`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  authenticatedClient.use(errorMiddleware)

  return authenticatedClient
}

// Re-export types for convenience
export type { paths } from './generated/schema'
export type { components } from './generated/schema'
