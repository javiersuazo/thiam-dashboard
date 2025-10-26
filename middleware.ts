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

  // Step 1: Handle i18n routing FIRST - let next-intl handle locale detection & redirects
  const intlResponse = intlMiddleware(request)

  // Get the final pathname after intl processing
  const finalPathname = intlResponse.headers.get('x-middleware-request-x-nextUrl-pathname') || pathname

  // Step 2: Run authentication checks on the final pathname
  const hasSession = hasValidSession(request)

  // Extract locale from final pathname
  const localeMatch = finalPathname.match(/^\/([a-z]{2})(?:\/|$)/)
  const locale = localeMatch?.[1] || routing.defaultLocale

  // Step 3: Check if this is a public route
  if (isPublicRoute(finalPathname)) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (hasSession && isAuthRoute(finalPathname)) {
      const redirectPath = `/${locale}${DEFAULT_SIGNIN_REDIRECT}`
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return intlResponse
  }

  // Step 4: Protect all other routes - require authentication
  if (!hasSession) {
    // Store the attempted URL for redirect after login
    const redirectPath = `/${locale}${DEFAULT_SIGNOUT_REDIRECT}`
    const signInUrl = new URL(redirectPath, request.url)
    signInUrl.searchParams.set('callbackUrl', finalPathname)
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
