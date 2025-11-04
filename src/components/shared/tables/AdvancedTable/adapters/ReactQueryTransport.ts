import type { ITransport, TransportConfig } from '../core/interfaces'
import { api } from '@/lib/api'

export class ReactQueryTransport implements ITransport {
  async request<T>(config: TransportConfig): Promise<T> {
    const { method, url, params, data } = config

    switch (method) {
      case 'GET': {
        const { data: response, error } = await api.GET(url as any, {
          params: { query: params } as any,
        })
        if (error) throw error
        return response as T
      }

      case 'POST': {
        const { data: response, error } = await api.POST(url as any, {
          body: data as any,
        })
        if (error) throw error
        return response as T
      }

      case 'PUT': {
        const { data: response, error } = await api.PUT(url as any, {
          body: data as any,
        })
        if (error) throw error
        return response as T
      }

      case 'PATCH': {
        const { data: response, error } = await api.PATCH(url as any, {
          body: data as any,
        })
        if (error) throw error
        return response as T
      }

      case 'DELETE': {
        const { error } = await api.DELETE(url as any, {
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
