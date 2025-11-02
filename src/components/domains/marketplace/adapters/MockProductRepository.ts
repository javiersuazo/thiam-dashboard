import { IProductRepository } from '../repositories/IProductRepository'
import { Product, MarketplaceFilters, PaginationParams, PaginatedResult } from '../types/domain'
import { mockProducts } from '../mocks/products'

export class MockProductRepository implements IProductRepository {
  private products: Product[]

  constructor(products: Product[] = mockProducts) {
    this.products = products
  }

  async getAll(params?: PaginationParams): Promise<PaginatedResult<Product>> {
    const { page = 1, pageSize = 12 } = params || {}
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return {
      items: this.products.slice(startIndex, endIndex),
      total: this.products.length,
      page,
      pageSize,
      totalPages: Math.ceil(this.products.length / pageSize),
    }
  }

  async getById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) || null
  }

  async search(query: string, params?: PaginationParams): Promise<PaginatedResult<Product>> {
    const normalizedQuery = query.toLowerCase().trim()
    const filtered = this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.description.toLowerCase().includes(normalizedQuery) ||
        p.catererName.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery)
    )

    const { page = 1, pageSize = 12 } = params || {}
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return {
      items: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    }
  }

  async filter(
    filters: MarketplaceFilters,
    params?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    let filtered = [...this.products]

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter((p) => filters.categories.includes(p.category))
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((p) => filters.tags.some((tag) => p.tags.includes(tag)))
    }

    if (filters.availability) {
      filtered = filtered.filter((p) => p.availability === filters.availability)
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!)
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!)
    }

    if (filters.catererId) {
      filtered = filtered.filter((p) => p.catererId === filters.catererId)
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.catererName.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
    }

    const { page = 1, pageSize = 12 } = params || {}
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return {
      items: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    }
  }

  async getByCatererId(
    catererId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    const filtered = this.products.filter((p) => p.catererId === catererId)

    const { page = 1, pageSize = 12 } = params || {}
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return {
      items: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    }
  }

  async getCategories(): Promise<string[]> {
    return Array.from(new Set(this.products.map((p) => p.category)))
  }

  async getTags(): Promise<string[]> {
    return Array.from(new Set(this.products.flatMap((p) => p.tags)))
  }
}
