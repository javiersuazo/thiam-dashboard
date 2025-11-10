import { IProductRepository } from '../repositories/IProductRepository'
import { Product, MarketplaceFilters, PaginationParams, PaginatedResult } from '../types/domain'

export class ProductService {
  constructor(private readonly repository: IProductRepository) {}

  async getProducts(params?: PaginationParams): Promise<PaginatedResult<Product>> {
    return this.repository.getAll(params)
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.repository.getById(id)
  }

  async searchProducts(query: string, params?: PaginationParams): Promise<PaginatedResult<Product>> {
    if (!query.trim()) {
      return this.repository.getAll(params)
    }
    return this.repository.search(query, params)
  }

  async filterProducts(
    filters: MarketplaceFilters,
    params?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    return this.repository.filter(filters, params)
  }

  async getProductsByCaterer(
    catererId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    return this.repository.getByCatererId(catererId, params)
  }

  async getAvailableCategories(): Promise<string[]> {
    return this.repository.getCategories()
  }

  async getAvailableTags(): Promise<string[]> {
    return this.repository.getTags()
  }

  groupProductsByCaterer(products: Product[]): Map<string, { catererName: string; products: Product[] }> {
    const groups = new Map<string, { catererName: string; products: Product[] }>()

    products.forEach((product) => {
      if (!groups.has(product.catererId)) {
        groups.set(product.catererId, {
          catererName: product.catererName,
          products: [],
        })
      }
      groups.get(product.catererId)!.products.push(product)
    })

    return groups
  }
}
