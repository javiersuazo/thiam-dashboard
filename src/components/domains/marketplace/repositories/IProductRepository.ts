import { Product, MarketplaceFilters, PaginationParams, PaginatedResult } from '../types/domain'

export interface IProductRepository {
  getAll(params?: PaginationParams): Promise<PaginatedResult<Product>>

  getById(id: string): Promise<Product | null>

  search(query: string, params?: PaginationParams): Promise<PaginatedResult<Product>>

  filter(filters: MarketplaceFilters, params?: PaginationParams): Promise<PaginatedResult<Product>>

  getByCatererId(catererId: string, params?: PaginationParams): Promise<PaginatedResult<Product>>

  getCategories(): Promise<string[]>

  getTags(): Promise<string[]>
}
