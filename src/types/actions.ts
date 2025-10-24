/**
 * Shared Action Types
 *
 * Common type definitions for Next.js Server Actions
 */

/**
 * Server Action Result
 *
 * Standard return type for all server actions
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
