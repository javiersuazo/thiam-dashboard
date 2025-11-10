'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMarketplace } from '../providers/MarketplaceProvider'
import { Product } from '../types/domain'

interface CatererGroup {
  catererId: string
  catererName: string
  products: Product[]
}

export function useCaterers(products: Product[]) {
  const { productService } = useMarketplace()

  const [catererGroups, setCatererGroups] = useState<CatererGroup[]>([])

  const groupProducts = useCallback(() => {
    const groups = productService.groupProductsByCaterer(products)
    const catererArray = Array.from(groups.entries()).map(([catererId, data]) => ({
      catererId,
      catererName: data.catererName,
      products: data.products,
    }))
    setCatererGroups(catererArray)
  }, [productService, products])

  useEffect(() => {
    groupProducts()
  }, [groupProducts])

  return catererGroups
}
