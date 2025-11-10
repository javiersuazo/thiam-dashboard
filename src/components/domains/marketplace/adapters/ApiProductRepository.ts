import { IProductRepository } from '../repositories/IProductRepository'
import { Product, MarketplaceFilters, PaginationParams, PaginatedResult } from '../types/domain'
import { api } from '@/lib/api'

export class ApiProductRepository implements IProductRepository {
  async getAll(params?: PaginationParams): Promise<PaginatedResult<Product>> {
    const { page = 1, pageSize = 12 } = params || {}

    const { data, error } = await api.GET('/marketplace/products', {
      params: {
        query: {
          page,
          limit: pageSize,
        },
      },
    })

    if (error || !data) {
      throw new Error('Failed to fetch products')
    }

    return this.transformApiResponse(data, page, pageSize)
  }

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await api.GET('/marketplace/products/{id}', {
      params: {
        path: { id },
      },
    })

    if (error || !data) {
      return null
    }

    return this.transformProduct(data)
  }

  async search(query: string, params?: PaginationParams): Promise<PaginatedResult<Product>> {
    const { page = 1, pageSize = 12 } = params || {}

    const { data, error } = await api.GET('/marketplace/products/search', {
      params: {
        query: {
          q: query,
          page,
          limit: pageSize,
        },
      },
    })

    if (error || !data) {
      throw new Error('Search failed')
    }

    return this.transformApiResponse(data, page, pageSize)
  }

  async filter(
    filters: MarketplaceFilters,
    params?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    const { page = 1, pageSize = 12 } = params || {}

    const { data, error } = await api.POST('/marketplace/products/filter', {
      params: {
        query: {
          page,
          limit: pageSize,
        },
      },
      body: {
        categories: filters.categories,
        tags: filters.tags,
        availability: filters.availability,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        catererId: filters.catererId,
        searchQuery: filters.searchQuery,
      },
    })

    if (error || !data) {
      throw new Error('Filter failed')
    }

    return this.transformApiResponse(data, page, pageSize)
  }

  async getByCatererId(
    catererId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    const { page = 1, pageSize = 12 } = params || {}

    const { data, error } = await api.GET('/marketplace/caterers/{catererId}/products', {
      params: {
        path: { catererId },
        query: {
          page,
          limit: pageSize,
        },
      },
    })

    if (error || !data) {
      throw new Error('Failed to fetch caterer products')
    }

    return this.transformApiResponse(data, page, pageSize)
  }

  async getCategories(): Promise<string[]> {
    const { data, error } = await api.GET('/marketplace/categories')

    if (error || !data) {
      return []
    }

    return data.categories || []
  }

  async getTags(): Promise<string[]> {
    const { data, error } = await api.GET('/marketplace/tags')

    if (error || !data) {
      return []
    }

    return data.tags || []
  }

  private transformProduct(apiProduct: any): Product {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      description: apiProduct.description,
      price: apiProduct.price,
      currency: apiProduct.currency || 'EUR',
      category: apiProduct.category,
      tags: apiProduct.tags || [],
      imageUrl: apiProduct.image_url,
      availability: apiProduct.availability || 'available',
      stock: apiProduct.stock || 0,
      minOrder: apiProduct.min_order || 1,
      preparationTime: apiProduct.preparation_time || '2h',
      leadTime: apiProduct.lead_time || '24h',
      catererId: apiProduct.caterer_id,
      catererName: apiProduct.caterer_name,
      rating: apiProduct.rating,
      reviewCount: apiProduct.review_count,
    }
  }

  private transformApiResponse(apiData: any, page: number, pageSize: number): PaginatedResult<Product> {
    const products = (apiData.products || apiData.items || []).map((p: any) =>
      this.transformProduct(p)
    )

    return {
      items: products,
      total: apiData.total || products.length,
      page,
      pageSize,
      totalPages: apiData.total_pages || Math.ceil((apiData.total || products.length) / pageSize),
    }
  }
}
