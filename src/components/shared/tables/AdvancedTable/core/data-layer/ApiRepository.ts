/**
 * API Repository - Concrete implementation for REST API data sources
 *
 * This is the proper data layer following SOLID principles:
 * - Single Responsibility: Only handles API communication
 * - Open/Closed: Extend via transformer, closed for modification
 * - Dependency Inversion: Depends on abstractions (IDataTransformer, API client)
 */

import type { DataSourceResult, DataSourceParams } from '../interfaces'
import { BaseRepository, type IDataTransformer, type ApiDTO } from './repository'

type ApiClient = {
  GET: (endpoint: string, options?: { params?: { query?: Record<string, any> } }) => Promise<{ data?: any; error?: any }>
  POST: (endpoint: string, options?: { body?: any }) => Promise<{ data?: any; error?: any }>
  PATCH: (endpoint: string, options?: { params?: { path?: Record<string, any> }; body?: any }) => Promise<{ data?: any; error?: any }>
  DELETE: (endpoint: string, options?: { params?: { path?: Record<string, any> } }) => Promise<{ data?: any; error?: any }>
}

/**
 * Configuration for API Repository
 */
export interface ApiRepositoryConfig<TRow, TApiDTO> {
  endpoint: string
  apiClient: ApiClient
  transformer: IDataTransformer<TApiDTO, TRow>
  idField?: string
}

/**
 * Generic API Repository
 *
 * Usage:
 * ```typescript
 * const repository = new ApiRepository({
 *   endpoint: '/products',
 *   apiClient: api,
 *   transformer: new ProductTransformer()
 * })
 *
 * const result = await repository.fetch(params)
 * ```
 */
export class ApiRepository<TRow, TApiDTO = any> extends BaseRepository<TRow, TApiDTO> {
  private endpoint: string
  private apiClient: ApiClient
  private idField: string

  constructor(config: ApiRepositoryConfig<TRow, TApiDTO>) {
    super(config.transformer)
    this.endpoint = config.endpoint
    this.apiClient = config.apiClient
    this.idField = config.idField || 'id'
  }

  async fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>> {
    const queryParams = this.buildQueryParams(params)

    console.log(`📡 API Repository: Fetching from ${this.endpoint}`, queryParams)

    const { data, error } = await this.apiClient.GET(this.endpoint, {
      params: { query: queryParams }
    })

    if (error) {
      console.error(`❌ API Repository: Error fetching from ${this.endpoint}`, error)
      throw new Error(error.message || 'Failed to fetch data')
    }

    const result = this.transformResponse(data as ApiDTO<TApiDTO>)

    console.log(`✅ API Repository: Fetched ${result.data.length} items (${result.total} total)`)

    return result
  }

  async create(domainData: Partial<TRow>): Promise<TRow> {
    const apiData = this.transformer.toApi(domainData)

    console.log(`📡 API Repository: Creating in ${this.endpoint}`, apiData)

    const { data, error } = await this.apiClient.POST(this.endpoint, {
      body: apiData
    })

    if (error) {
      console.error(`❌ API Repository: Error creating in ${this.endpoint}`, error)
      throw new Error(error.message || 'Failed to create item')
    }

    const result = this.transformer.toDomain(data as TApiDTO)

    console.log(`✅ API Repository: Created item with ID`, (result as any)[this.idField])

    return result
  }

  async update(id: string, domainData: Partial<TRow>): Promise<TRow> {
    const apiData = this.transformer.toApi(domainData)

    console.log(`📡 API Repository: Updating ${this.endpoint}/${id}`, apiData)

    const { data, error } = await this.apiClient.PATCH(`${this.endpoint}/{id}`, {
      params: { path: { id } },
      body: apiData
    })

    if (error) {
      console.error(`❌ API Repository: Error updating ${this.endpoint}/${id}`, error)
      throw new Error(error.message || 'Failed to update item')
    }

    const result = this.transformer.toDomain(data as TApiDTO)

    console.log(`✅ API Repository: Updated item ${id}`)

    return result
  }

  async delete(id: string): Promise<void> {
    console.log(`📡 API Repository: Deleting ${this.endpoint}/${id}`)

    const { error } = await this.apiClient.DELETE(`${this.endpoint}/{id}`, {
      params: { path: { id } }
    })

    if (error) {
      console.error(`❌ API Repository: Error deleting ${this.endpoint}/${id}`, error)
      throw new Error(error.message || 'Failed to delete item')
    }

    console.log(`✅ API Repository: Deleted item ${id}`)
  }

  async bulkDelete(ids: string[]): Promise<{ success: boolean; affected: number }> {
    console.log(`📡 API Repository: Bulk deleting ${ids.length} items from ${this.endpoint}`)

    const { data, error } = await this.apiClient.POST(`${this.endpoint}/bulk-delete`, {
      body: { ids }
    })

    if (error) {
      console.error(`❌ API Repository: Error bulk deleting from ${this.endpoint}`, error)

      const results = await Promise.allSettled(
        ids.map(id => this.delete(id))
      )

      const affected = results.filter(r => r.status === 'fulfilled').length

      return {
        success: affected > 0,
        affected
      }
    }

    console.log(`✅ API Repository: Bulk deleted ${data?.affected || ids.length} items`)

    return {
      success: true,
      affected: data?.affected || ids.length
    }
  }

  async batchUpdate(updates: Record<string, Partial<TRow>>): Promise<{ success: boolean; affected: number; errors?: Array<{ id: string; message: string }> }> {
    console.log(`📡 API Repository: Batch updating ${Object.keys(updates).length} items in ${this.endpoint}`)

    const transformedUpdates = Object.entries(updates).map(([id, changes]) => ({
      id,
      changes: this.transformer.toApi(changes)
    }))

    const { data, error } = await this.apiClient.PATCH(`${this.endpoint}/bulk`, {
      body: { updates: transformedUpdates }
    })

    if (error) {
      console.error(`❌ API Repository: Error batch updating in ${this.endpoint}`, error)

      const results = await Promise.allSettled(
        Object.entries(updates).map(([id, changes]) => this.update(id, changes))
      )

      const affected = results.filter(r => r.status === 'fulfilled').length
      const errors = results
        .map((r, i) => ({ result: r, id: Object.keys(updates)[i] }))
        .filter((item): item is { result: PromiseRejectedResult; id: string } => item.result.status === 'rejected')
        .map(({ result, id }) => ({ id, message: result.reason?.message || 'Unknown error' }))

      return {
        success: affected > 0,
        affected,
        errors: errors.length > 0 ? errors : undefined
      }
    }

    console.log(`✅ API Repository: Batch updated ${data?.affected || Object.keys(updates).length} items`)

    return {
      success: true,
      affected: data?.affected || Object.keys(updates).length,
      errors: data?.errors
    }
  }
}
