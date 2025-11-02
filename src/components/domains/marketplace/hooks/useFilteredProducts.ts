import { useMemo } from 'react'
import { StoreProduct, StoreFilters } from '../types'

export function useFilteredProducts(products: StoreProduct[], filters: StoreFilters) {
  return useMemo(() => {
    let filtered = [...products]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.catererName.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter((p) => filters.categories?.includes(p.category))
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((p) =>
        filters.tags?.some((tag) => p.tags.includes(tag))
      )
    }

    if (filters.availability) {
      filtered = filtered.filter((p) => p.availability === filters.availability)
    }

    if (filters.rating) {
      filtered = filtered.filter((p) => (p.rating || 0) >= (filters.rating || 0))
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange
      filtered = filtered.filter((p) => p.price >= min && p.price <= max)
    }

    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'popular':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        break
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }, [products, filters])
}
