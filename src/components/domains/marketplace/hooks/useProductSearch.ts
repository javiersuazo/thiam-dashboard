'use client'

import { useState, useCallback } from 'react'
import { useMarketplace } from '../providers/MarketplaceProvider'
import { Product, PaginatedResult, PaginationParams } from '../types/domain'

export function useProductSearch() {
  const { productService } = useMarketplace()
  const [results, setResults] = useState<PaginatedResult<Product> | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = useCallback(
    async (query: string, params?: PaginationParams) => {
      setIsSearching(true)
      setError(null)

      try {
        const searchResults = await productService.searchProducts(query, params)
        setResults(searchResults)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'))
      } finally {
        setIsSearching(false)
      }
    },
    [productService]
  )

  return {
    results,
    isSearching,
    error,
    search,
  }
}
