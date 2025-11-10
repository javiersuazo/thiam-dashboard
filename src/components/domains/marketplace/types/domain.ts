export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  tags: string[]
  imageUrl?: string
  availability: 'available' | 'unavailable' | 'out_of_stock'
  stock: number
  minOrder: number
  preparationTime: string
  leadTime: string
  catererId: string
  catererName: string
  rating?: number
  reviewCount?: number
}

export interface Caterer {
  id: string
  name: string
  description?: string
  rating?: number
  reviewCount?: number
  categories: string[]
  deliveryInfo?: string
  priceRange?: {
    min: number
    max: number
    currency: string
  }
}

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  taxRate: number
  deliveryFee: number
  total: number
  itemCount: number
}

export interface MarketplaceFilters {
  categories: string[]
  tags: string[]
  availability?: 'available' | 'unavailable' | 'out_of_stock'
  minPrice?: number
  maxPrice?: number
  catererId?: string
  searchQuery?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
