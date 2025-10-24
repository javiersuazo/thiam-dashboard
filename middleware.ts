/**
 * Next.js Middleware for Authentication & Route Protection
 *
 * Runs on every request to protected routes.
 * Validates session and enforces authentication requirements.
 *
 * Following Next.js 15 best practices:
 * - Edge runtime for performance
 * - Minimal logic (cookie check only)
 * - Pattern-based matching
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/two-step-verification',
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
 * Check if route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

/**
 * Check if route is an auth route (signin, signup, etc.)
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

/**
 * Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = hasValidSession(request)

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (hasSession && isAuthRoute(pathname)) {
      return NextResponse.redirect(new URL(DEFAULT_SIGNIN_REDIRECT, request.url))
    }
    return NextResponse.next()
  }

  // Protect all other routes - require authentication
  if (!hasSession) {
    // Store the attempted URL for redirect after login
    const signInUrl = new URL(DEFAULT_SIGNOUT_REDIRECT, request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // User is authenticated, allow access
  return NextResponse.next()
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
