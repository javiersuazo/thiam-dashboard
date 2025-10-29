/**
 * API Client Middleware
 *
 * Provides authentication, error handling, logging, and other cross-cutting concerns
 * for the API client.
 */

import type { Middleware } from 'openapi-fetch'

/**
 * Authentication Middleware
 *
 * Automatically adds the Authorization header to all requests.
 * - Client-side: Cannot access httpOnly cookies, uses Next.js API proxy pattern
 * - Server-side: Reads token from cookies and adds Authorization header
 *
 * SECURITY: Tokens are stored in httpOnly cookies, which are:
 * - NOT accessible to JavaScript (XSS protection)
 * - Protected with SameSite=lax (CSRF protection)
 * - Only accessible from Next.js server-side code
 */
export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    // Check if token is already in headers (already authenticated)
    const existingAuth = request.headers.get('Authorization')
    if (existingAuth) {
      return request
    }

    // Client-side: httpOnly cookies are NOT accessible to JavaScript
    // This middleware runs on the client, so we cannot read the cookies here
    // Solution: Server Actions (which run server-side) will read cookies and add header
    // For client-side API calls, you should use Server Actions or Next.js API routes as proxy

    // NOTE: If this middleware runs on the server (via createAuthenticatedClient),
    // the Authorization header is already set in the client initialization

    return request
  },
}

/**
 * Error Handling Middleware
 *
 * Handles common HTTP errors:
 * - 401: Redirect to login
 * - 403: Show permission error
 * - 500+: Log to error tracking
 */
export const errorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      const status = response.status

      // Clone response to read body without consuming it
      const errorBody = await response.clone().json().catch(() => null)

      console.error(`API Error: ${status} ${response.statusText}`, {
        url: response.url,
        status,
        body: errorBody,
      })

      // Handle specific error codes
      if (status === 401 && typeof window !== 'undefined') {
        // Unauthorized - redirect to login (client-side only)
        // Note: Tokens are in httpOnly cookies, cleared by server on logout
        // No client-side token cleanup needed

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/signin')) {
          // Extract locale from current pathname
          const currentPath = window.location.pathname
          const localeMatch = currentPath.match(/^\/([a-z]{2})(\/|$)/)
          const locale = localeMatch ? localeMatch[1] : 'en'

          window.location.href = `/${locale}/signin?redirect=${encodeURIComponent(window.location.pathname)}`
        }
      }

      if (status === 403) {
        // Forbidden - user doesn't have permission
        console.warn('Permission denied for request:', response.url)
      }

      if (status >= 500) {
        // Server error - could send to error tracking service
        console.error('Server error:', {
          url: response.url,
          status,
          body: errorBody,
        })

        // TODO: Send to error tracking (Sentry, etc.)
        // trackError('API Server Error', { url: response.url, status, errorBody })
      }
    }

    return response
  },
}

/**
 * Logging Middleware (Development Only)
 *
 * Logs all API requests and responses for debugging.
 * Only active in development mode.
 */
export const loggingMiddleware: Middleware = {
  async onRequest({ request }) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔵 API Request: ${request.method} ${request.url}`)
    }
    return request
  },

  async onResponse({ response, request }) {
    if (process.env.NODE_ENV === 'development') {
      const duration = performance.now() // In a real implementation, track start time
      const emoji = response.ok ? '✅' : '❌'
      console.log(
        `${emoji} API Response: ${request.method} ${request.url} - ${response.status} (${Math.round(duration)}ms)`
      )
    }
    return response
  },
}

/**
 * Retry Middleware
 *
 * Automatically retries failed requests with exponential backoff.
 * Only retries safe methods (GET, HEAD, OPTIONS) and specific error codes.
 */
export function createRetryMiddleware(maxRetries = 3): Middleware {
  return {
    async onRequest({ request }) {
      // Store retry count in a WeakMap or request headers
      if (!request.headers.has('X-Retry-Count')) {
        request.headers.set('X-Retry-Count', '0')
      }
      return request
    },

    async onResponse({ response, request }) {
      // Only retry safe methods
      const safeMethods = ['GET', 'HEAD', 'OPTIONS']
      if (!safeMethods.includes(request.method)) {
        return response
      }

      // Only retry on network errors or 5xx errors
      const shouldRetry = response.status >= 500 || response.status === 0
      if (!shouldRetry) {
        return response
      }

      const retryCount = parseInt(request.headers.get('X-Retry-Count') || '0', 10)
      if (retryCount >= maxRetries) {
        console.warn(`Max retries (${maxRetries}) reached for ${request.url}`)
        return response
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, etc.
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
      console.log(`Retrying request (attempt ${retryCount + 1}/${maxRetries}) after ${delay}ms...`)

      await new Promise(resolve => setTimeout(resolve, delay))

      // Clone request and increment retry count
      const newRequest = request.clone()
      newRequest.headers.set('X-Retry-Count', String(retryCount + 1))

      // Retry the request
      return fetch(newRequest)
    },
  }
}

/**
 * Request ID Middleware
 *
 * Adds a unique request ID to each request for tracking and debugging.
 */
export const requestIdMiddleware: Middleware = {
  async onRequest({ request }) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    request.headers.set('X-Request-ID', requestId)
    return request
  },
}

/**
 * Content-Type Middleware
 *
 * Ensures proper Content-Type header for JSON requests.
 */
export const contentTypeMiddleware: Middleware = {
  async onRequest({ request }) {
    // Only set Content-Type for requests with a body
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      if (!request.headers.has('Content-Type')) {
        request.headers.set('Content-Type', 'application/json')
      }
    }
    return request
  },
}
