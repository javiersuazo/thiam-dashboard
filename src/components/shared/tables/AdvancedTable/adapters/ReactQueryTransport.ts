import type { ITransport, TransportConfig } from '../core/interfaces'
import type { IApiClient } from '../core/IApiClient'

export class ReactQueryTransport implements ITransport {
  constructor(private apiClient: IApiClient) {}

  async request<T>(config: TransportConfig): Promise<T> {
    const { method, url, params, data } = config

    switch (method) {
      case 'GET': {
        const { data: response, error } = await this.apiClient.GET(url as any, {
          params: { query: params } as any,
        })
        if (error) throw error
        return response as T
      }

      case 'POST': {
        const { data: response, error } = await this.apiClient.POST(url as any, {
          body: data as any,
        })
        if (error) throw error
        return response as T
      }

      case 'PUT': {
        const { data: response, error } = await this.apiClient.PUT(url as any, {
          body: data as any,
        })
        if (error) throw error
        return response as T
      }

      case 'PATCH': {
        const { data: response, error } = await this.apiClient.PATCH(url as any, {
          body: data as any,
        })
        if (error) throw error
        return response as T
      }

      case 'DELETE': {
        const { error } = await this.apiClient.DELETE(url as any, {
          body: data as any,
        })
        if (error) throw error
        return undefined as T
      }

      default:
        throw new Error(`Unsupported HTTP method: ${method}`)
    }
  }
}
