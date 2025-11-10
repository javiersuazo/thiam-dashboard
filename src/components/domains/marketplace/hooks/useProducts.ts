'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMarketplace } from '../providers/MarketplaceProvider'
import { Product, PaginatedResult, PaginationParams } from '../types/domain'

export function useProducts(params?: PaginationParams) {
  const { productService, filters } = useMarketplace()
  const [data, setData] = useState<PaginatedResult<Product> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await productService.filterProducts(filters, params)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'))
    } finally {
      setIsLoading(false)
    }
  }, [productService, filters, params])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    data,
    isLoading,
    error,
    refetch: fetchProducts,
  }
}
