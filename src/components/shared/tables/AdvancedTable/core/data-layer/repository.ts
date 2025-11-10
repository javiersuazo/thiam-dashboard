/**
 * Repository Pattern - Abstraction Layer for Data Access
 *
 * Following DDD principles:
 * - Repository abstracts data access
 * - Separates domain models from DTOs
 * - Handles data transformation
 * - Provides consistent interface regardless of data source
 */

import type { DataSourceParams, DataSourceResult } from '../interfaces'

/**
 * API DTO - What your backend actually sends
 */
export interface ApiDTO<T = any> {
  items?: T[]
  data?: T[]
  results?: T[]
  total?: number
  totalCount?: number
  count?: number
  page?: number
  currentPage?: number
  pageNumber?: number
  limit?: number
  pageSize?: number
  perPage?: number
  totalPages?: number
  hasMore?: boolean
  [key: string]: any
}

/**
 * Domain Model - What your table works with internally
 */
export interface DomainModel<TRow> {
  data: TRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Data Transformer - Converts between API DTOs and Domain Models
 */
export interface IDataTransformer<TApiDTO, TRow> {
  toDomain(dto: TApiDTO): TRow
  toApi(domain: Partial<TRow>): Partial<TApiDTO>
}

/**
 * Repository Interface - Clean abstraction for data access
 */
export interface IRepository<TRow, TApiDTO = any> {
  fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>>
  create?(data: Partial<TRow>): Promise<TRow>
  update?(id: string, data: Partial<TRow>): Promise<TRow>
  delete?(id: string): Promise<void>
  bulkDelete?(ids: string[]): Promise<{ success: boolean; affected: number }>
}

/**
 * Base Repository Implementation
 * Handles common transformation logic
 */
export abstract class BaseRepository<TRow, TApiDTO = any> implements IRepository<TRow, TApiDTO> {
  constructor(
    protected transformer: IDataTransformer<TApiDTO, TRow>
  ) {}

  /**
   * Transform API response to DataSourceResult format
   */
  protected transformResponse(apiResponse: ApiDTO<TApiDTO>): DataSourceResult<TRow> {
    const items = apiResponse.items || apiResponse.data || apiResponse.results || []
    const total = apiResponse.total || apiResponse.totalCount || apiResponse.count || 0
    const page = apiResponse.page || apiResponse.currentPage || apiResponse.pageNumber || 1
    const pageSize = apiResponse.limit || apiResponse.pageSize || apiResponse.perPage || 10

    const domainData = items.map(dto => this.transformer.toDomain(dto))

    return {
      data: domainData,
      total,
      page,
      pageSize,
      totalPages: apiResponse.totalPages || Math.ceil(total / pageSize)
    }
  }

  /**
   * Transform filters to API query format
   */
  protected transformFilters(filters: Record<string, any>): Record<string, any> {
    const apiFilters: Record<string, any> = {}

    Object.entries(filters).forEach(([field, value]) => {
      if (value === undefined || value === null || value === '') return

      if (Array.isArray(value)) {
        apiFilters[field] = value.join(',')
      } else if (typeof value === 'object' && 'min' in value) {
        if (value.min !== undefined) apiFilters[`${field}_min`] = value.min
        if (value.max !== undefined) apiFilters[`${field}_max`] = value.max
      } else if (typeof value === 'object' && 'from' in value) {
        if (value.from !== undefined) apiFilters[`${field}_from`] = value.from
        if (value.to !== undefined) apiFilters[`${field}_to`] = value.to
      } else {
        apiFilters[field] = value
      }
    })

    return apiFilters
  }

  /**
   * Build query parameters from DataSourceParams
   */
  protected buildQueryParams(params: DataSourceParams): Record<string, any> {
    const queryParams: Record<string, any> = {}

    if (params.pagination) {
      queryParams.page = params.pagination.page
      queryParams.limit = params.pagination.pageSize
    }

    if (params.sorting && params.sorting.length > 0) {
      const sort = params.sorting[0]
      queryParams.sort_by = sort.field
      queryParams.sort_order = sort.direction
    }

    if (params.search) {
      queryParams.q = params.search
    }

    if (params.filters) {
      const transformedFilters = this.transformFilters(params.filters)
      Object.assign(queryParams, transformedFilters)
    }

    return queryParams
  }

  abstract fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>>
  abstract create?(data: Partial<TRow>): Promise<TRow>
  abstract update?(id: string, data: Partial<TRow>): Promise<TRow>
  abstract delete?(id: string): Promise<void>
}

/**
 * Identity Transformer - No transformation needed (API matches domain)
 */
export class IdentityTransformer<T> implements IDataTransformer<T, T> {
  toDomain(dto: T): T {
    return dto
  }

  toApi(domain: Partial<T>): Partial<T> {
    return domain
  }
}

/**
 * Example: Product Transformer
 * Transforms API DTOs to Domain Models
 */
export class ProductTransformer implements IDataTransformer<any, any> {
  toDomain(dto: any): any {
    return {
      id: dto.id || dto.product_id,
      name: dto.name || dto.product_name,
      category: dto.category || dto.category_key,
      status: dto.status || dto.status_key,
      price: dto.price || 0,
      stock: dto.stock || dto.inventory_count || 0,
      createdAt: dto.created_at || dto.createdAt,
      updatedAt: dto.updated_at || dto.updatedAt,
    }
  }

  toApi(domain: Partial<any>): Partial<any> {
    return {
      product_id: domain.id,
      product_name: domain.name,
      category_key: domain.category,
      status_key: domain.status,
      price: domain.price,
      inventory_count: domain.stock,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    }
  }
}
