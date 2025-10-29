/**
 * Request Domain Types
 *
 * Domain-specific types that extend/adapt API types for UI needs.
 * These types represent the "view model" layer.
 */

import type { components } from '@/lib/api/generated/schema'

// Base API type
type ApiRequest = components['schemas']['response.Request']

/**
 * Request View Model
 * Enriched request type with computed properties for UI
 */
export interface RequestViewModel extends ApiRequest {
  // Computed properties
  isActive: boolean
  isPending: boolean
  canEdit: boolean
  canCancel: boolean

  // Display helpers
  statusLabel: string
  statusColor: 'green' | 'yellow' | 'red' | 'gray'
  eventDateFormatted: string
  daysUntilEvent: number
}

/**
 * Request Filters
 * Filters for request list views
 */
export interface RequestFilters {
  status?: RequestStatus[]
  dateFrom?: string
  dateTo?: string
  customerId?: string
  minGuestCount?: number
  maxGuestCount?: number
  searchQuery?: string
}

/**
 * Request Form Data
 * Data structure for create/edit forms
 */
export interface RequestFormData {
  title: string
  description: string
  eventDate: string
  guestCount: number
  eventType: string
  dietaryRequirements?: string[]
  budgetMin?: number
  budgetMax?: number
  location: {
    address: string
    city: string
    state: string
    zipCode: string
  }
}

/**
 * Request Status
 * Possible statuses for a request
 */
export type RequestStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

/**
 * Request Actions
 * Available actions for a request based on status and permissions
 */
export interface RequestActions {
  canEdit: boolean
  canCancel: boolean
  canDuplicate: boolean
  canViewOffers: boolean
  canAcceptOffer: boolean
}
