/**
 * Next.js Middleware for i18n & Authentication
 *
 * Runs on every request to:
 * 1. Handle locale routing (i18n)
 * 2. Validate session and enforce authentication requirements
 *
 * Following Next.js 15 best practices:
 * - Edge runtime for performance
 * - Minimal logic (cookie check only)
 * - Pattern-based matching
 */

import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './src/i18n/routing'

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/two-step-verification',
  '/oauth-callback',
  '/success',
  '/coming-soon',
  '/error-404',
  '/error-500',
  '/error-503',
  '/maintenance',
]

/**
 * Auth routes that authenticated users shouldn't access
 * Will redirect to dashboard if already logged in
 */
const AUTH_ROUTES = ['/signin', '/signup', '/forgot-password', '/reset-password']

/**
 * Default redirect destinations
 */
const DEFAULT_SIGNIN_REDIRECT = '/' // Dashboard
const DEFAULT_SIGNOUT_REDIRECT = '/signin'

/**
 * Session cookie name
 * Must match the cookie name in @/lib/auth/session.ts
 */
const SESSION_COOKIE_NAME = 'thiam_session'

/**
 * Check if user has a valid session
 */
function hasValidSession(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
  return !!sessionCookie?.value
}

/**
 * Strip locale prefix from pathname
 */
function stripLocale(pathname: string): string {
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  if (localeMatch && routing.locales.includes(localeMatch[1] as any)) {
    return pathname.slice(localeMatch[1].length + 1) || '/'
  }
  return pathname
}

/**
 * Check if route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  const path = stripLocale(pathname)
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}

/**
 * Check if route is an auth route (signin, signup, etc.)
 */
function isAuthRoute(pathname: string): boolean {
  const path = stripLocale(pathname)
  return AUTH_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}

/**
 * i18n middleware
 */
const intlMiddleware = createMiddleware(routing)

/**
 * Combined middleware function
 * Handles both i18n routing and authentication
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = hasValidSession(request)

  // Step 1: Handle i18n routing first
  // This ensures locale prefixes are properly handled
  const intlResponse = intlMiddleware(request)

  // Step 2: Run authentication checks
  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (hasSession && isAuthRoute(pathname)) {
      // Preserve locale in redirect
      const locale = pathname.match(/^\/([a-z]{2})(?:\/|$)/)?.[1] || ''
      const redirectPath = locale ? `/${locale}${DEFAULT_SIGNIN_REDIRECT}` : DEFAULT_SIGNIN_REDIRECT
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return intlResponse
  }

  // Protect all other routes - require authentication
  if (!hasSession) {
    // Store the attempted URL for redirect after login
    const locale = pathname.match(/^\/([a-z]{2})(?:\/|$)/)?.[1] || ''
    const redirectPath = locale ? `/${locale}${DEFAULT_SIGNOUT_REDIRECT}` : DEFAULT_SIGNOUT_REDIRECT
    const signInUrl = new URL(redirectPath, request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // User is authenticated, allow access
  return intlResponse
}

/**
 * Middleware configuration
 *
 * matcher: Defines which routes the middleware runs on
 * - Excludes: _next/static, _next/image, favicon.ico, public files
 * - Includes: All other routes (API routes, pages, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/session (allow public session check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/session|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
