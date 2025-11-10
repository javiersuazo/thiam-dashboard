import { z } from 'zod'

export interface StoreProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  tags: string[]
  imageUrl?: string
  availability: 'available' | 'unavailable' | 'limited'
  stock?: number
  minOrder?: number
  maxOrder?: number
  preparationTime?: string
  leadTime?: string
  catererId: string
  catererName: string
  catererLogo?: string
  rating?: number
  reviewCount?: number
}

export interface CartItem {
  product: StoreProduct
  quantity: number
  notes?: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
}

export interface StoreFilters {
  search?: string
  categories?: string[]
  priceRange?: [number, number]
  rating?: number
  availability?: 'available' | 'unavailable' | 'limited'
  tags?: string[]
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'name' | 'popular'
}

export interface CheckoutFormFieldConfig {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date' | 'time' | 'checkbox' | 'radio' | 'address' | 'number'
  label: string
  placeholder?: string
  required?: boolean
  validation?: z.ZodType
  options?: { label: string; value: string }[]
  defaultValue?: any
  hint?: string
  condition?: {
    field: string
    operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than'
    value: any
  }
  grid?: {
    cols?: number
    span?: number
  }
}

export interface CheckoutFormStepConfig {
  id: string
  title: string
  description?: string
  fields: CheckoutFormFieldConfig[]
  validation?: z.ZodType
  optional?: boolean
}

export interface CheckoutFormConfig {
  id: string
  title: string
  description?: string
  steps: CheckoutFormStepConfig[]
  allowSaveForLater?: boolean
  showProgressBar?: boolean
}

export interface CheckoutData {
  customerInfo?: Record<string, any>
  deliveryInfo?: Record<string, any>
  paymentInfo?: Record<string, any>
  additionalInfo?: Record<string, any>
  cart: Cart
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  items: CartItem[]
  total: number
  currency: string
  customerInfo: Record<string, any>
  deliveryInfo: Record<string, any>
  createdAt: string
  estimatedDelivery?: string
}
