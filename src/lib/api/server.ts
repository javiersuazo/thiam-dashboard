/**
 * Server-Side API Utilities
 *
 * JWT-based authentication with httpOnly cookies.
 * Follows industry best practices for security.
 */

import { cookies } from 'next/headers'
import { createAuthenticatedClient, createPublicServerClient } from './index'

/**
 * Cookie names for JWT tokens
 */
const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

/**
 * Cookie options for JWT tokens
 */
const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // CSRF protection
  path: '/',
}

/**
 * Get access token from httpOnly cookie (server-side only)
 *
 * @returns The JWT access token or null if not found
 */
export async function getServerAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(ACCESS_TOKEN_COOKIE)

    if (!tokenCookie?.value) {
      return null
    }

    return tokenCookie.value
  } catch (error) {
    console.error('❌ getServerAuthToken - Error:', error)
    return null
  }
}

/**
 * Get refresh token from httpOnly cookie (server-side only)
 *
 * @returns The JWT refresh token or null if not found
 */
export async function getServerRefreshToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get(REFRESH_TOKEN_COOKIE)
    return tokenCookie?.value || null
  } catch (error) {
    console.error('Failed to get refresh token:', error)
    return null
  }
}

/**
 * Set JWT tokens in httpOnly cookies (server-side only)
 *
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @param expiresIn - Access token expiration in seconds (default: 900 = 15 min)
 */
export async function setServerAuthTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number = 900 // 15 minutes default
): Promise<void> {
  try {
    const cookieStore = await cookies()

    // Set access token (short-lived)
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      ...TOKEN_COOKIE_OPTIONS,
      maxAge: expiresIn,
    })

    // Set refresh token (long-lived - 7 days)
    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...TOKEN_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  } catch (error) {
    console.error('Failed to set auth tokens:', error)
    throw new Error('Could not save authentication tokens')
  }
}

/**
 * Clear authentication tokens from cookies (server-side only)
 */
export async function clearServerAuthTokens(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)
    console.log('✅ clearServerAuthTokens - Tokens cleared')
  } catch (error) {
    console.error('Failed to clear auth tokens:', error)
  }
}

/**
 * Create an unauthenticated API client for public endpoints
 *
 * Use this for public endpoints that don't require authentication:
 * - Login
 * - Signup
 * - Password reset
 * - Email verification
 *
 * @returns API client without authentication
 *
 * @example Server Action
 * ```ts
 * 'use server'
 *
 * import { createPublicClient } from '@/lib/api/server'
 *
 * export async function loginAction(credentials) {
 *   const api = createPublicClient()
 *   const { data, error } = await api.POST('/v1/auth/login', {
 *     body: credentials
 *   })
 *   // ...
 * }
 * ```
 */
export function createPublicClient() {
  return createPublicServerClient()
}

/**
 * Create an API client for server-side usage
 *
 * Automatically retrieves the auth token from cookies.
 * Use this in Server Components and Server Actions.
 *
 * @returns API client or null if not authenticated
 *
 * @example Server Component
 * ```ts
 * import { createServerClient } from '@/lib/api/server'
 *
 * export default async function AccountsPage() {
 *   const api = await createServerClient()
 *   if (!api) {
 *     redirect('/signin')
 *   }
 *
 *   const { data: accounts } = await api.GET('/accounts')
 *
 *   return (
 *     <div>
 *       {accounts?.map(account => (
 *         <div key={account.id}>{account.name}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Server Action
 * ```ts
 * 'use server'
 *
 * import { createServerClient } from '@/lib/api/server'
 *
 * export async function createAccount(formData: FormData) {
 *   const api = await createServerClient()
 *   if (!api) {
 *     throw new Error('Not authenticated')
 *   }
 *
 *   const { data, error } = await api.POST('/accounts', {
 *     body: {
 *       name: formData.get('name') as string,
 *       type: 'caterer',
 *     }
 *   })
 *
 *   if (error) throw new Error('Failed to create account')
 *   return data
 * }
 * ```
 */
export async function createServerClient() {
  const token = await getServerAuthToken()

  console.log('🔐 createServerClient - Token check:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 20)}...` : null,
  })

  if (!token) {
    return null
  }

  return createAuthenticatedClient(token)
}

/**
 * Require authentication for a server component or server action
 *
 * Throws an error if not authenticated, which can be caught by an error boundary
 * or handled by Next.js middleware.
 *
 * @returns The API client (guaranteed to be authenticated)
 * @throws Error if not authenticated
 *
 * @example Server Component
 * ```ts
 * import { requireServerAuth } from '@/lib/api/server'
 *
 * export default async function ProtectedPage() {
 *   const api = await requireServerAuth() // Throws if not authenticated
 *
 *   const { data } = await api.GET('/accounts')
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 */
export async function requireServerAuth() {
  const api = await createServerClient()

  if (!api) {
    throw new Error('Unauthorized: No authentication token found')
  }

  return api
}

/**
 * Get current user from server-side auth token
 *
 * Fetches the current user's profile using the auth token from cookies.
 *
 * @returns User object or null if not authenticated
 *
 * @example Server Component
 * ```ts
 * import { getCurrentUser } from '@/lib/api/server'
 *
 * export default async function ProfilePage() {
 *   const user = await getCurrentUser()
 *
 *   if (!user) {
 *     redirect('/signin')
 *   }
 *
 *   return <div>Welcome {user.name}</div>
 * }
 * ```
 */
export async function getCurrentUser() {
  const api = await createServerClient()

  if (!api) {
    return null
  }

  const { data, error } = await api.GET('/users/me', {})

  if (error) {
    console.error('Failed to fetch current user:', error)
    return null
  }

  return data
}

/**
 * Check if user is authenticated (server-side)
 *
 * Simple boolean check for authentication status.
 *
 * @returns true if authenticated, false otherwise
 *
 * @example Middleware
 * ```ts
 * import { isAuthenticated } from '@/lib/api/server'
 *
 * export async function middleware(request: Request) {
 *   if (!await isAuthenticated()) {
 *     return NextResponse.redirect('/signin')
 *   }
 * }
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getServerAuthToken()
  return token !== null
}
