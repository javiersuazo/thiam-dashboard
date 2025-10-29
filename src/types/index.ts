/**
 * Global Types - Shared types across the application
 */

// Re-export session types
export * from '@/lib/session/types'

// Common entity types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  archivedAt?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// Status types based on Thiam API
export type RequestStatus =
  | 'submitted'
  | 'qualified'
  | 'open'
  | 'in_progress'
  | 'converted'
  | 'cancelled'
  | 'closed'

export type OfferStatus =
  | 'invited'
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'declined'
  | 'expired'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_preparation'
  | 'delivered'
  | 'cancelled'

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'paid'
  | 'overdue'
  | 'cancelled'

export type DeliveryStatus =
  | 'planned'
  | 'assigned'
  | 'en_route'
  | 'delivered'
  | 'failed'
  | 'cancelled'

// Re-export API types
export type { paths, components } from '@/lib/api/generated/schema'
