'use client'

/**
 * useRBAC Hook
 *
 * Client-side hook for checking user permissions and roles.
 * Works with session context/state.
 */

import { useCallback } from 'react'
import type { SessionUser } from '../session'
import type { UserRole, Permission } from '../rbac'
import { userHasPermission, userHasRole, userHasAnyRole } from '../rbac'

interface UseRBACProps {
  user: SessionUser | null
}

interface UseRBACReturn {
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  isAdmin: boolean
  isCaterer: boolean
  isCustomer: boolean
  isStaff: boolean
  isAuthenticated: boolean
}

/**
 * Hook for checking user permissions and roles
 *
 * @example
 * ```tsx
 * const { user } = useSession() // from session context
 * const { hasPermission, isAdmin } = useRBAC({ user })
 *
 * if (hasPermission('order:write')) {
 *   // Show edit button
 * }
 *
 * if (isAdmin) {
 *   // Show admin panel
 * }
 * ```
 */
export function useRBAC({ user }: UseRBACProps): UseRBACReturn {
  const hasPermission = useCallback(
    (permission: Permission) => {
      return userHasPermission(user, permission)
    },
    [user]
  )

  const hasRole = useCallback(
    (role: UserRole) => {
      return userHasRole(user, role)
    },
    [user]
  )

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => {
      return userHasAnyRole(user, roles)
    },
    [user]
  )

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin: user?.role === 'admin',
    isCaterer: user?.role === 'caterer',
    isCustomer: user?.role === 'customer',
    isStaff: user ? ['admin', 'ops', 'finance', 'sales'].includes(user.role) : false,
    isAuthenticated: !!user,
  }
}
