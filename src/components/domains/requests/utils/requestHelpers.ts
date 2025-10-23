/**
 * Request Domain Utilities
 *
 * Pure functions for request-related calculations and transformations.
 * No side effects, no API calls - just data transformations.
 */

import type { RequestViewModel, RequestStatus, RequestActions } from '../types/request.types'
import type { components } from '@/lib/api/generated/schema'

type ApiRequest = components['schemas']['response.Request']

/**
 * Transform API request to view model
 * Adds computed properties for UI consumption
 */
export function toRequestViewModel(apiRequest: ApiRequest): RequestViewModel {
  const now = new Date()
  const eventDate = new Date(apiRequest.event_date)
  const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return {
    ...apiRequest,
    isActive: apiRequest.status === 'active',
    isPending: apiRequest.status === 'pending',
    canEdit: ['draft', 'pending'].includes(apiRequest.status),
    canCancel: !['cancelled', 'completed'].includes(apiRequest.status),
    statusLabel: getStatusLabel(apiRequest.status as RequestStatus),
    statusColor: getStatusColor(apiRequest.status as RequestStatus),
    eventDateFormatted: formatEventDate(apiRequest.event_date),
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
    ['draft', 'pending'].includes(request.status)

  const canCancel = userPermissions.includes('requests:cancel') &&
    !['cancelled', 'completed'].includes(request.status)

  const canDuplicate = userPermissions.includes('requests:create')

  const canViewOffers = userPermissions.includes('offers:read') &&
    request.status !== 'draft'

  const canAcceptOffer = userPermissions.includes('offers:accept') &&
    request.status === 'active'

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
 */
export function sortRequestsByEventDate(
  requests: ApiRequest[],
  direction: 'asc' | 'desc' = 'asc'
): ApiRequest[] {
  return [...requests].sort((a, b) => {
    const dateA = new Date(a.event_date).getTime()
    const dateB = new Date(b.event_date).getTime()

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
 */
export function isRequestExpiringSoon(request: ApiRequest): boolean {
  const eventDate = new Date(request.event_date)
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
