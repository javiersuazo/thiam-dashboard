'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ProductService } from '../services/ProductService'
import { CartService } from '../services/CartService'
import { CatererService } from '../services/CatererService'
import { IProductRepository } from '../repositories/IProductRepository'
import { ICartRepository } from '../repositories/ICartRepository'
import { ICatererRepository } from '../repositories/ICatererRepository'
import { Cart, Product, MarketplaceFilters } from '../types/domain'

interface MarketplaceContextValue {
  productService: ProductService
  cartService: CartService
  catererService: CatererService
  cart: Cart
  filters: MarketplaceFilters
  setFilters: (filters: MarketplaceFilters) => void
  resetFilters: () => void
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null)

interface MarketplaceProviderProps {
  productRepository: IProductRepository
  cartRepository: ICartRepository
  catererRepository: ICatererRepository
  children: React.ReactNode
}

const defaultFilters: MarketplaceFilters = {
  categories: [],
  tags: [],
}

export function MarketplaceProvider({
  productRepository,
  cartRepository,
  catererRepository,
  children,
}: MarketplaceProviderProps) {
  const productService = new ProductService(productRepository)
  const cartService = new CartService(cartRepository)
  const catererService = new CatererService(catererRepository)

  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    tax: 0,
    taxRate: 0.19,
    deliveryFee: 0,
    total: 0,
    itemCount: 0,
  })

  const [filters, setFilters] = useState<MarketplaceFilters>(defaultFilters)

  const refreshCart = useCallback(async () => {
    const updatedCart = await cartService.getCart()
    setCart(updatedCart)
  }, [cartService])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(
    async (product: Product, quantity: number = 1) => {
      const updatedCart = await cartService.addToCart(product, quantity)
      setCart(updatedCart)
    },
    [cartService]
  )

  const removeFromCart = useCallback(
    async (productId: string) => {
      const updatedCart = await cartService.removeFromCart(productId)
      setCart(updatedCart)
    },
    [cartService]
  )

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const updatedCart = await cartService.updateQuantity(productId, quantity)
      setCart(updatedCart)
    },
    [cartService]
  )

  const clearCart = useCallback(async () => {
    const updatedCart = await cartService.clearCart()
    setCart(updatedCart)
  }, [cartService])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const value: MarketplaceContextValue = {
    productService,
    cartService,
    catererService,
    cart,
    filters,
    setFilters,
    resetFilters,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  }

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (!context) {
    throw new Error('useMarketplace must be used within MarketplaceProvider')
  }
  return context
}
