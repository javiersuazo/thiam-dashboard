export interface IApiClient {
  GET<T>(url: string, options?: { params?: { query?: any } }): Promise<{ data?: T; error?: any }>
  POST<T>(url: string, options?: { body?: any }): Promise<{ data?: T; error?: any }>
  PUT<T>(url: string, options?: { body?: any }): Promise<{ data?: T; error?: any }>
  PATCH<T>(url: string, options?: { body?: any }): Promise<{ data?: T; error?: any }>
  DELETE<T>(url: string, options?: { body?: any }): Promise<{ data?: T; error?: any }>
}
