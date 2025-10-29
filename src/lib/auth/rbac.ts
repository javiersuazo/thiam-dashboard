/**
 * Role-Based Access Control (RBAC) Helpers
 *
 * Utilities for checking user permissions based on roles.
 * Follows the principle of least privilege.
 */

import { getSession } from './session'
import type { SessionUser } from './session'

/**
 * User Roles (from API)
 */
export type UserRole = 'customer' | 'caterer' | 'admin' | 'ops' | 'finance' | 'sales'

/**
 * Role hierarchy (higher index = more permissions)
 * Used for role comparisons
 */
const ROLE_HIERARCHY: UserRole[] = ['customer', 'caterer', 'sales', 'finance', 'ops', 'admin']

/**
 * Permissions mapped to roles
 */
export const PERMISSIONS: Record<string, UserRole[]> = {
  // Customer permissions
  'customer:read': ['customer', 'caterer', 'sales', 'finance', 'ops', 'admin'],
  'customer:write': ['customer', 'sales', 'finance', 'ops', 'admin'],
  'customer:delete': ['admin'],

  // Caterer permissions
  'caterer:read': ['caterer', 'sales', 'finance', 'ops', 'admin'],
  'caterer:write': ['caterer', 'ops', 'admin'],
  'caterer:delete': ['admin'],

  // Order permissions
  'order:read': ['customer', 'caterer', 'sales', 'finance', 'ops', 'admin'],
  'order:write': ['customer', 'caterer', 'sales', 'ops', 'admin'],
  'order:delete': ['ops', 'admin'],

  // Invoice permissions
  'invoice:read': ['customer', 'caterer', 'finance', 'ops', 'admin'],
  'invoice:write': ['finance', 'ops', 'admin'],
  'invoice:delete': ['admin'],

  // Payment permissions
  'payment:read': ['customer', 'caterer', 'finance', 'ops', 'admin'],
  'payment:write': ['finance', 'ops', 'admin'],
  'payment:delete': ['admin'],

  // Admin permissions
  'admin:access': ['admin'],
  'admin:settings': ['admin'],
  'admin:users': ['ops', 'admin'],
  'admin:analytics': ['finance', 'ops', 'admin'],
}

export type Permission = keyof typeof PERMISSIONS

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles.includes(role)
}

/**
 * Check if a role is at least as powerful as another role
 */
export function roleIsAtLeast(role: UserRole, minimumRole: UserRole): boolean {
  const roleIndex = ROLE_HIERARCHY.indexOf(role)
  const minimumIndex = ROLE_HIERARCHY.indexOf(minimumRole)
  return roleIndex >= minimumIndex
}

/**
 * Check if user has a specific permission (server-side)
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await getSession()
  if (!session?.user) return false
  return roleHasPermission(session.user.role, permission)
}

/**
 * Check if user has a specific role (server-side)
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role === role
}

/**
 * Check if user has any of the specified roles (server-side)
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const session = await getSession()
  if (!session?.user) return false
  return roles.includes(session.user.role)
}

/**
 * Require authentication (server-side)
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required')
  }
  return session.user
}

/**
 * Require specific permission (server-side)
 * Throws error if user doesn't have permission
 */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireAuth()
  if (!roleHasPermission(user.role, permission)) {
    throw new Error(`Forbidden: Missing permission '${permission}'`)
  }
  return user
}

/**
 * Require specific role (server-side)
 * Throws error if user doesn't have role
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error(`Forbidden: Requires '${role}' role`)
  }
  return user
}

/**
 * Require any of the specified roles (server-side)
 * Throws error if user doesn't have any of the roles
 */
export async function requireAnyRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: Requires one of [${roles.join(', ')}] roles`)
  }
  return user
}

/**
 * Client-side permission check helper
 */
export function userHasPermission(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false
  return roleHasPermission(user.role, permission)
}

/**
 * Client-side role check helper
 */
export function userHasRole(user: SessionUser | null, role: UserRole): boolean {
  if (!user) return false
  return user.role === role
}

/**
 * Client-side multi-role check helper
 */
export function userHasAnyRole(user: SessionUser | null, roles: UserRole[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Quick role checkers
 */
export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === 'admin'
}

export function isCaterer(user: SessionUser | null): boolean {
  return user?.role === 'caterer'
}

export function isCustomer(user: SessionUser | null): boolean {
  return user?.role === 'customer'
}

export function isStaff(user: SessionUser | null): boolean {
  return userHasAnyRole(user, ['admin', 'ops', 'finance', 'sales'])
}
