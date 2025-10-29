/**
 * Request Domain Utilities
 *
 * Pure functions for request-related calculations and transformations.
 * No side effects, no API calls - just data transformations.
 *
 * NOTE: This is a placeholder/reference implementation. Some functions use
 * field names that don't exist in the actual API schema. These should be
 * updated when building the actual Request domain features.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { RequestViewModel, RequestStatus, RequestActions } from '../types/request.types'
import type { components } from '@/lib/api/generated/schema'

type ApiRequest = components['schemas']['response.Request']

/**
 * Transform API request to view model
 * Adds computed properties for UI consumption
 *
 * NOTE: This is a placeholder implementation. The actual API schema uses different
 * field names than this reference implementation. Update this when building the
 * actual Request domain features.
 */
export function toRequestViewModel(apiRequest: ApiRequest): RequestViewModel {
  const now = new Date()
  // TODO: Update to use actual field from API schema (e.g., requestedDates)
  const eventDate = new Date((apiRequest as any).event_date || apiRequest.createdAt || now)
  const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return {
    ...apiRequest,
    isActive: (apiRequest.status as any) === 'active',
    isPending: (apiRequest.status as any) === 'pending',
    canEdit: ['draft', 'pending'].includes(apiRequest.status as any),
    canCancel: !['cancelled', 'completed'].includes(apiRequest.status as any),
    statusLabel: getStatusLabel(apiRequest.status as unknown as RequestStatus),
    statusColor: getStatusColor(apiRequest.status as unknown as RequestStatus),
    eventDateFormatted: formatEventDate((apiRequest as any).event_date || apiRequest.createdAt || ''),
    daysUntilEvent,
  }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    draft: 'Draft',
    pending: 'Pending Review',
    active: 'Active - Accepting Offers',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return labels[status] || status
}

/**
 * Get status color for badges/indicators
 */
export function getStatusColor(status: RequestStatus): 'green' | 'yellow' | 'red' | 'gray' {
  const colors: Record<RequestStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
    draft: 'gray',
    pending: 'yellow',
    active: 'green',
    in_progress: 'yellow',
    completed: 'green',
    cancelled: 'red',
  }

  return colors[status] || 'gray'
}

/**
 * Format event date for display
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Calculate available actions for a request
 * Based on status and user permissions
 */
export function getRequestActions(
  request: ApiRequest,
  userPermissions: string[]
): RequestActions {
  const canEdit = userPermissions.includes('requests:update') &&
    ['draft', 'pending'].includes(request.status as any)

  const canCancel = userPermissions.includes('requests:cancel') &&
    !['cancelled', 'completed'].includes(request.status as any)

  const canDuplicate = userPermissions.includes('requests:create')

  const canViewOffers = userPermissions.includes('offers:read') &&
    (request.status as any) !== 'draft'

  const canAcceptOffer = userPermissions.includes('offers:accept') &&
    (request.status as any) === 'active'

  return {
    canEdit,
    canCancel,
    canDuplicate,
    canViewOffers,
    canAcceptOffer,
  }
}

/**
 * Filter requests by search query
 * Searches in title and description
 */
export function filterRequestsBySearch(
  requests: ApiRequest[],
  searchQuery: string
): ApiRequest[] {
  if (!searchQuery.trim()) return requests

  const query = searchQuery.toLowerCase()

  return requests.filter(
    (request) =>
      request.title?.toLowerCase().includes(query) ||
      request.description?.toLowerCase().includes(query)
  )
}

/**
 * Sort requests by event date
 * TODO: Update to use actual API field
 */
export function sortRequestsByEventDate(
  requests: ApiRequest[],
  direction: 'asc' | 'desc' = 'asc'
): ApiRequest[] {
  return [...requests].sort((a, b) => {
    const dateA = new Date((a as any).event_date || a.createdAt || 0).getTime()
    const dateB = new Date((b as any).event_date || b.createdAt || 0).getTime()

    return direction === 'asc' ? dateA - dateB : dateB - dateA
  })
}

/**
 * Group requests by status
 */
export function groupRequestsByStatus(
  requests: ApiRequest[]
): Record<RequestStatus, ApiRequest[]> {
  return requests.reduce((acc, request) => {
    const status = request.status as RequestStatus
    if (!acc[status]) acc[status] = []
    acc[status].push(request)
    return acc
  }, {} as Record<RequestStatus, ApiRequest[]>)
}

/**
 * Check if request is expiring soon (within 7 days)
 * TODO: Update to use actual API field
 */
export function isRequestExpiringSoon(request: ApiRequest): boolean {
  const eventDate = new Date((request as any).event_date || request.createdAt || new Date())
  const now = new Date()
  const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return daysUntil >= 0 && daysUntil <= 7
}

/**
 * Calculate budget range display
 */
export function formatBudgetRange(min?: number, max?: number): string {
  if (!min && !max) return 'Budget not specified'
  if (min && !max) return `From $${min.toLocaleString()}`
  if (!min && max) return `Up to $${max.toLocaleString()}`
  return `$${min!.toLocaleString()} - $${max!.toLocaleString()}`
}
