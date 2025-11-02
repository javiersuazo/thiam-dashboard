import { ICartRepository } from '../repositories/ICartRepository'
import { Cart, CartItem, Product } from '../types/domain'

const CART_STORAGE_KEY = 'marketplace_cart'
const TAX_RATE = 0.19
const DELIVERY_FEE = 5.99

export class LocalStorageCartRepository implements ICartRepository {
  private calculateCart(items: CartItem[]): Cart {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax + DELIVERY_FEE

    return {
      items,
      subtotal,
      tax,
      taxRate: TAX_RATE,
      deliveryFee: DELIVERY_FEE,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }
  }

  private loadFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private saveToStorage(items: CartItem[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      console.error('Failed to save cart to localStorage')
    }
  }

  async get(): Promise<Cart> {
    const items = this.loadFromStorage()
    return this.calculateCart(items)
  }

  async add(item: CartItem): Promise<Cart> {
    const items = this.loadFromStorage()
    const existingIndex = items.findIndex((i) => i.product.id === item.product.id)

    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity
      items[existingIndex].subtotal = items[existingIndex].quantity * items[existingIndex].product.price
    } else {
      items.push({
        ...item,
        subtotal: item.quantity * item.product.price,
      })
    }

    this.saveToStorage(items)
    return this.calculateCart(items)
  }

  async remove(productId: string): Promise<Cart> {
    const items = this.loadFromStorage().filter((i) => i.product.id !== productId)
    this.saveToStorage(items)
    return this.calculateCart(items)
  }

  async updateQuantity(productId: string, quantity: number): Promise<Cart> {
    const items = this.loadFromStorage()
    const item = items.find((i) => i.product.id === productId)

    if (item) {
      item.quantity = quantity
      item.subtotal = quantity * item.product.price
    }

    this.saveToStorage(items)
    return this.calculateCart(items)
  }

  async clear(): Promise<Cart> {
    this.saveToStorage([])
    return this.calculateCart([])
  }
}
