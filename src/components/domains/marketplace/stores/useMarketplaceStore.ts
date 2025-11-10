import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StoreProduct, Cart, CartItem, StoreFilters } from '../types'

interface MarketplaceState {
  cart: Cart
  filters: StoreFilters
}

interface MarketplaceActions {
  addToCart: (product: StoreProduct, quantity: number, notes?: string) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateNotes: (productId: string, notes: string) => void
  clearCart: () => void
  setFilters: (filters: StoreFilters) => void
  resetFilters: () => void
}

const TAX_RATE = 0.19
const BASE_DELIVERY_FEE = 5.0

const calculateCartTotals = (items: CartItem[]): Cart => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subtotal * TAX_RATE
  const deliveryFee = items.length > 0 ? BASE_DELIVERY_FEE : 0
  const total = subtotal + tax + deliveryFee

  return {
    items,
    subtotal,
    tax,
    deliveryFee,
    total,
  }
}

const initialFilters: StoreFilters = {
  search: '',
  categories: [],
  tags: [],
  sortBy: 'name',
}

export const useMarketplaceStore = create<MarketplaceState & MarketplaceActions>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
      },
      filters: initialFilters,

      addToCart: (product, quantity, notes) => {
        const { cart } = get()
        const existingItemIndex = cart.items.findIndex((item) => item.product.id === product.id)

        let newItems: CartItem[]

        if (existingItemIndex >= 0) {
          newItems = [...cart.items]
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
            notes: notes || newItems[existingItemIndex].notes,
          }
        } else {
          newItems = [
            ...cart.items,
            {
              product,
              quantity,
              notes,
            },
          ]
        }

        set({ cart: calculateCartTotals(newItems) })
      },

      removeFromCart: (productId) => {
        const { cart } = get()
        const newItems = cart.items.filter((item) => item.product.id !== productId)
        set({ cart: calculateCartTotals(newItems) })
      },

      updateQuantity: (productId, quantity) => {
        const { cart } = get()
        const newItems = cart.items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
        set({ cart: calculateCartTotals(newItems) })
      },

      updateNotes: (productId, notes) => {
        const { cart } = get()
        const newItems = cart.items.map((item) =>
          item.product.id === productId ? { ...item, notes } : item
        )
        set({ cart: calculateCartTotals(newItems) })
      },

      clearCart: () => {
        set({
          cart: {
            items: [],
            subtotal: 0,
            tax: 0,
            deliveryFee: 0,
            total: 0,
          },
        })
      },

      setFilters: (filters) => {
        set({ filters })
      },

      resetFilters: () => {
        set({ filters: initialFilters })
      },
    }),
    {
      name: 'marketplace-storage',
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
)
