/**
 * Shared Action Types
 *
 * Common type definitions for Next.js Server Actions
 */

/**
 * Structured API Error Data
 * Matches the API's error response format
 */
export interface ApiErrorData {
  message: string
  key?: string
  code?: number
}

/**
 * Server Action Result
 *
 * Standard return type for all server actions
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      errorData?: ApiErrorData; // Structured error data from API
      fieldErrors?: Record<string, string[]>;
    }
