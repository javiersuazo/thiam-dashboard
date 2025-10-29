'use client'

/**
 * ProtectedRoute Component
 *
 * Client-side route guard for protecting components/pages.
 * Shows loading state while checking auth, redirects if unauthorized.
 *
 * Note: Server-side protection via middleware is preferred for pages.
 * This component is useful for client-side navigation and component-level guards.
 */

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { SessionUser } from '../session'
import type { UserRole, Permission } from '../rbac'
import { userHasPermission, userHasAnyRole } from '../rbac'

interface ProtectedRouteProps {
  children: ReactNode
  user: SessionUser | null
  loading?: boolean
  requireAuth?: boolean
  requireRoles?: UserRole[]
  requirePermissions?: Permission[]
  fallback?: ReactNode
  redirectTo?: string
}

/**
 * Protected Route Component
 *
 * @example
 * ```tsx
 * // Require authentication
 * <ProtectedRoute user={user} loading={loading} requireAuth>
 *   <AdminPanel />
 * </ProtectedRoute>
 *
 * // Require specific roles
 * <ProtectedRoute user={user} requireRoles={['admin', 'ops']}>
 *   <SettingsPage />
 * </ProtectedRoute>
 *
 * // Require permissions
 * <ProtectedRoute user={user} requirePermissions={['order:write']}>
 *   <EditOrderButton />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  user,
  loading = false,
  requireAuth = true,
  requireRoles,
  requirePermissions,
  fallback,
  redirectTo = '/signin',
}: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return

    // Check authentication
    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    // Check roles
    if (requireRoles && !userHasAnyRole(user, requireRoles)) {
      router.push('/error-403') // Forbidden
      return
    }

    // Check permissions
    if (requirePermissions) {
      const hasAllPermissions = requirePermissions.every((permission) =>
        userHasPermission(user, permission)
      )
      if (!hasAllPermissions) {
        router.push('/error-403') // Forbidden
        return
      }
    }
  }, [loading, user, requireAuth, requireRoles, requirePermissions, router, redirectTo])

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
        </div>
      )
    )
  }

  // Check authentication
  if (requireAuth && !user) {
    return fallback || null
  }

  // Check roles
  if (requireRoles && !userHasAnyRole(user, requireRoles)) {
    return fallback || null
  }

  // Check permissions
  if (requirePermissions) {
    const hasAllPermissions = requirePermissions.every((permission) =>
      userHasPermission(user, permission)
    )
    if (!hasAllPermissions) {
      return fallback || null
    }
  }

  // User is authorized, render children
  return <>{children}</>
}
