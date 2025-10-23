/**
 * useRequestFilters Hook
 *
 * Manages filter state for request lists.
 * Handles URL sync, local storage, and filter logic.
 */

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { RequestFilters } from '../types/request.types'

/**
 * Hook for managing request filters
 *
 * Features:
 * - Syncs filters with URL query params
 * - Persists filters to localStorage
 * - Provides reset functionality
 *
 * @example
 * ```tsx
 * function RequestList() {
 *   const { filters, setFilters, resetFilters } = useRequestFilters()
 *
 *   return (
 *     <div>
 *       <FilterPanel filters={filters} onChange={setFilters} />
 *       <RequestTable filters={filters} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useRequestFilters(defaultFilters: RequestFilters = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize filters from URL or defaults
  const [filters, setFiltersState] = useState<RequestFilters>(() => {
    const urlStatus = searchParams?.get('status')
    const urlSearch = searchParams?.get('q')

    return {
      ...defaultFilters,
      ...(urlStatus && { status: [urlStatus as any] }),
      ...(urlSearch && { searchQuery: urlSearch }),
    }
  })

  /**
   * Update filters and sync to URL
   */
  const setFilters = useCallback(
    (newFilters: Partial<RequestFilters>) => {
      setFiltersState((prev) => {
        const updated = { ...prev, ...newFilters }

        // Sync to URL
        const params = new URLSearchParams()
        if (updated.status?.length) params.set('status', updated.status.join(','))
        if (updated.searchQuery) params.set('q', updated.searchQuery)
        if (updated.dateFrom) params.set('dateFrom', updated.dateFrom)
        if (updated.dateTo) params.set('dateTo', updated.dateTo)

        // Update URL without reload
        router.push(`?${params.toString()}`, { scroll: false })

        // Persist to localStorage
        localStorage.setItem('request-filters', JSON.stringify(updated))

        return updated
      })
    },
    [router]
  )

  /**
   * Reset filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    router.push(window.location.pathname, { scroll: false })
    localStorage.removeItem('request-filters')
  }, [defaultFilters, router])

  /**
   * Check if filters are active
   */
  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof RequestFilters]
    return value !== undefined && value !== null && value !== ''
  })

  return {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
  }
}
