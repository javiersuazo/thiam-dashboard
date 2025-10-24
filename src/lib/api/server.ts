/**
 * Server-Side API Utilities
 *
 * Utilities for calling the API from Next.js Server Components and Server Actions.
 * Handles authentication via cookies (httpOnly for security).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { cookies } from 'next/headers'
import { createAuthenticatedClient } from './index'
import type { paths } from './generated/schema'

/**
 * Cookie name for storing the auth token
 */
const AUTH_COOKIE_NAME = 'auth_token'

/**
 * Cookie options for auth token
 * - httpOnly: Cannot be accessed by JavaScript (XSS protection)
 * - secure: Only sent over HTTPS in production
 * - sameSite: CSRF protection
 * - path: Available throughout the app
 */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

/**
 * Get authentication token from cookies (server-side only)
 *
 * @returns The auth token or null if not found
 *
 * @example Server Component
 * ```ts
 * import { getServerAuthToken } from '@/lib/api/server'
 *
 * export default async function Page() {
 *   const token = await getServerAuthToken()
 *   if (!token) {
 *     redirect('/signin')
 *   }
 *   // ...
 * }
 * ```
 */
export async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || null
}

/**
 * Set authentication token in cookies (server-side only)
 *
 * Use this after successful login in a Server Action.
 *
 * @param token - JWT token to store
 *
 * @example Server Action
 * ```ts
 * 'use server'
 *
 * import { setServerAuthToken } from '@/lib/api/server'
 *
 * export async function login(email: string, password: string) {
 *   // ... login logic ...
 *   const token = loginResponse.token
 *   await setServerAuthToken(token)
 *   redirect('/dashboard')
 * }
 * ```
 */
export async function setServerAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)
}

/**
 * Clear authentication token from cookies (server-side only)
 *
 * Use this for logout in a Server Action.
 *
 * @example Server Action
 * ```ts
 * 'use server'
 *
 * import { clearServerAuthToken } from '@/lib/api/server'
 *
 * export async function logout() {
 *   await clearServerAuthToken()
 *   redirect('/signin')
 * }
 * ```
 */
export async function clearServerAuthToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
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
 *   const { data, error } = await api.POST('/auth/login', {
 *     body: credentials
 *   })
 *   // ...
 * }
 * ```
 */
export function createPublicClient() {
  const { createPublicServerClient } = require('./index')
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

  // TODO: Update this to use your actual current user endpoint
  // This is a placeholder - adjust based on your API schema
  const { data, error } = await api.GET('/users/me' as any, {})

  if (error) {
    console.error('Failed to fetch current user:', error)
    return null
  }

  return data as any
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
