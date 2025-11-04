import type {
  IDataSource,
  DataSourceParams,
  DataSourceResult,
  BulkOperationResult,
  ITransport,
} from '../../core/interfaces'

export interface ApiDataSourceConfig<TRow = any, TApiResponse = any> {
  transport: ITransport

  endpoints: {
    list: string
    create?: string
    update?: string
    delete?: string
    bulkDelete?: string
    batchUpdate?: string
  }

  params?: Record<string, any>

  adapter: {
    toApiParams(params: DataSourceParams): Record<string, any>
    fromApiResponse(response: TApiResponse): DataSourceResult<TRow>
    toApiCreateData?(data: Partial<TRow>): any
    toApiUpdateData?(data: Partial<TRow>): any
  }
}

export class ApiDataSource<TRow = any, TApiResponse = any> implements IDataSource<TRow> {
  constructor(private config: ApiDataSourceConfig<TRow, TApiResponse>) {}

  async fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>> {
    const apiParams = this.config.adapter.toApiParams(params)

    const response = await this.config.transport.request<TApiResponse>({
      method: 'GET',
      url: this.config.endpoints.list,
      params: { ...this.config.params, ...apiParams },
    })

    return this.config.adapter.fromApiResponse(response)
  }

  async create(data: Partial<TRow>): Promise<TRow> {
    if (!this.config.endpoints.create) {
      throw new Error('Create endpoint not configured')
    }

    const apiData = this.config.adapter.toApiCreateData?.(data) ?? data

    return this.config.transport.request<TRow>({
      method: 'POST',
      url: this.config.endpoints.create,
      data: apiData,
    })
  }

  async update(id: string, data: Partial<TRow>): Promise<TRow> {
    if (!this.config.endpoints.update) {
      throw new Error('Update endpoint not configured')
    }

    const apiData = this.config.adapter.toApiUpdateData?.(data) ?? data
    const url = this.config.endpoints.update.replace(':id', id)

    return this.config.transport.request<TRow>({
      method: 'PUT',
      url,
      data: apiData,
    })
  }

  async delete(id: string): Promise<void> {
    if (!this.config.endpoints.delete) {
      throw new Error('Delete endpoint not configured')
    }

    const url = this.config.endpoints.delete.replace(':id', id)

    await this.config.transport.request<void>({
      method: 'DELETE',
      url,
    })
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    if (!this.config.endpoints.bulkDelete) {
      throw new Error('Bulk delete endpoint not configured')
    }

    const response = await this.config.transport.request<{ deleted: number }>({
      method: 'DELETE',
      url: this.config.endpoints.bulkDelete,
      data: { ids },
    })

    return {
      success: true,
      affected: response.deleted,
    }
  }

  async batchUpdate(updates: Record<string, Partial<TRow>>): Promise<BulkOperationResult> {
    if (!this.config.endpoints.batchUpdate) {
      throw new Error('Batch update endpoint not configured')
    }

    const response = await this.config.transport.request<{ updated: number }>({
      method: 'PATCH',
      url: this.config.endpoints.batchUpdate,
      data: { updates },
    })

    return {
      success: true,
      affected: response.updated,
    }
  }
}
