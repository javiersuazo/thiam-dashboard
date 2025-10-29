/**
 * API Utility Functions
 *
 * Helper functions for common API operations and data transformations.
 */

/**
 * Type guard to check if a response has an error
 *
 * @example
 * ```ts
 * const response = await api.GET('/accounts')
 * if (hasError(response)) {
 *   console.error(response.error)
 *   return
 * }
 * // TypeScript knows response.data is defined here
 * console.log(response.data)
 * ```
 */
export function hasError<T>(response: { data?: T; error?: unknown }): response is { error: unknown; data?: never } {
  return response.error !== undefined
}

/**
 * Type guard to check if a response has data
 *
 * @example
 * ```ts
 * const response = await api.GET('/accounts')
 * if (hasData(response)) {
 *   // TypeScript knows response.data is defined
 *   console.log(response.data)
 * }
 * ```
 */
export function hasData<T>(response: { data?: T; error?: unknown }): response is { data: T; error?: never } {
  return response.data !== undefined && response.error === undefined
}

/**
 * Unwrap API response and throw on error
 *
 * Useful for Server Actions where you want to throw errors that can be caught
 * by error boundaries.
 *
 * @example Server Action
 * ```ts
 * 'use server'
 *
 * import { unwrapResponse } from '@/lib/api/utils'
 *
 * export async function getAccounts() {
 *   const api = await createServerClient()
 *   const response = await api.GET('/accounts')
 *   return unwrapResponse(response) // Throws on error, returns data on success
 * }
 * ```
 */
export function unwrapResponse<T>(response: { data?: T; error?: unknown }): T {
  if (hasError(response)) {
    throw new Error(
      typeof response.error === 'object' && response.error !== null && 'message' in response.error
        ? String(response.error.message)
        : 'API request failed'
    )
  }

  if (!response.data) {
    throw new Error('API returned no data')
  }

  return response.data
}

/**
 * Format API error for display
 *
 * Extracts a user-friendly error message from API error responses.
 *
 * @example
 * ```ts
 * const { error } = await api.POST('/accounts', { body: invalidData })
 * if (error) {
 *   toast.error(formatApiError(error))
 * }
 * ```
 */
export function formatApiError(error: unknown): string {
  if (!error) return 'An unknown error occurred'

  // If error is an object with a message property
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }

    // If error has a detail property (common in FastAPI/Python backends)
    if ('detail' in error && typeof error.detail === 'string') {
      return error.detail
    }

    // If error has validation errors array
    if ('detail' in error && Array.isArray(error.detail)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return error.detail.map((e: any) => e.msg || e.message).join(', ')
    }
  }

  // If error is a string
  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

/**
 * Build query string from params object
 *
 * Useful for constructing API query parameters.
 *
 * @example
 * ```ts
 * const params = buildQueryParams({
 *   limit: 10,
 *   offset: 0,
 *   status: 'active',
 *   search: undefined, // Will be omitted
 * })
 * // Result: { limit: 10, offset: 0, status: 'active' }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildQueryParams<T extends Record<string, any>>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  ) as Partial<T>
}

/**
 * Type helper to extract response type from an endpoint
 *
 * @example
 * ```ts
 * type Account = ApiResponse<'/accounts', 'get'>
 * // Same as: components['schemas']['response.Account'][]
 * ```
 */
export type ApiResponse<
  Path extends keyof import('./generated/schema').paths,
  Method extends keyof import('./generated/schema').paths[Path]
> = import('./generated/schema').paths[Path][Method] extends {
  responses: { 200: { content: { 'application/json': infer T } } }
}
  ? T
  : never

/**
 * Type helper to extract request body type from an endpoint
 *
 * @example
 * ```ts
 * type CreateAccountBody = ApiRequestBody<'/accounts', 'post'>
 * // Same as: components['schemas']['request.CreateAccount']
 * ```
 */
export type ApiRequestBody<
  Path extends keyof import('./generated/schema').paths,
  Method extends keyof import('./generated/schema').paths[Path]
> = import('./generated/schema').paths[Path][Method] extends {
  requestBody: { content: { 'application/json': infer T } }
}
  ? T
  : never

/**
 * Pagination helper
 *
 * Calculates pagination parameters for API requests.
 *
 * @example
 * ```ts
 * const { limit, offset } = getPaginationParams(2, 10) // page 2, 10 items per page
 * // Result: { limit: 10, offset: 10 }
 *
 * const { data } = await api.GET('/accounts', {
 *   params: { query: getPaginationParams(page, pageSize) }
 * })
 * ```
 */
export function getPaginationParams(page: number, pageSize: number) {
  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }
}

/**
 * Calculate total pages from total count
 *
 * @example
 * ```ts
 * const totalPages = getTotalPages(45, 10) // 45 items, 10 per page
 * // Result: 5
 * ```
 */
export function getTotalPages(totalCount: number, pageSize: number): number {
  return Math.ceil(totalCount / pageSize)
}

/**
 * Delay/sleep utility for testing retry logic
 *
 * @example
 * ```ts
 * await delay(1000) // Wait 1 second
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if code is running on server or client
 */
export const isServer = typeof window === 'undefined'
export const isClient = typeof window !== 'undefined'

/**
 * Type-safe localStorage wrapper
 *
 * Safely access localStorage with fallback for SSR.
 */
export const storage = {
  get: (key: string): string | null => {
    if (isClient) {
      return localStorage.getItem(key)
    }
    return null
  },

  set: (key: string, value: string): void => {
    if (isClient) {
      localStorage.setItem(key, value)
    }
  },

  remove: (key: string): void => {
    if (isClient) {
      localStorage.removeItem(key)
    }
  },

  clear: (): void => {
    if (isClient) {
      localStorage.clear()
    }
  },
}

/**
 * Type-safe sessionStorage wrapper
 *
 * Safely access sessionStorage with fallback for SSR.
 */
export const sessionStore = {
  get: (key: string): string | null => {
    if (isClient) {
      return sessionStorage.getItem(key)
    }
    return null
  },

  set: (key: string, value: string): void => {
    if (isClient) {
      sessionStorage.setItem(key, value)
    }
  },

  remove: (key: string): void => {
    if (isClient) {
      sessionStorage.removeItem(key)
    }
  },

  clear: (): void => {
    if (isClient) {
      sessionStorage.clear()
    }
  },
}
