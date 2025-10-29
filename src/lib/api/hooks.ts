/**
 * React Query Hooks for Thiam API
 *
 * Type-safe React hooks that integrate the API client with React Query.
 * Provides automatic caching, refetching, and state management.
 *
 * NOTE: These are placeholder hooks with loose typing. They should be replaced
 * with properly typed hooks when building actual features.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { api } from './index'
import type { components } from './generated/schema'

/**
 * GET /accounts - List accounts
 *
 * @example
 * ```tsx
 * function AccountsList() {
 *   const { data, isLoading, error } = useAccounts({ limit: 10, offset: 0 })
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <div>
 *       {data?.map(account => (
 *         <div key={account.id}>{account.name}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAccounts(
  params?: { limit?: number; offset?: number },
  options?: Omit<UseQueryOptions<components['schemas']['response.Account'][]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: async () => {
      const { data, error } = await api.GET('/accounts', {
        params: { query: params },
      })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /accounts/{id} - Get single account
 *
 * @example
 * ```tsx
 * function AccountDetail({ accountId }: { accountId: string }) {
 *   const { data, isLoading } = useAccount(accountId)
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return <div>{data?.name}</div>
 * }
 * ```
 */
export function useAccount(
  accountId: string,
  options?: Omit<UseQueryOptions<components['schemas']['response.Account']>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['accounts', accountId],
    queryFn: async () => {
      const { data, error } = await api.GET('/accounts/{id}', {
        params: { path: { id: accountId } },
      })
      if (error) throw error
      return data!
    },
    enabled: !!accountId,
    ...options,
  })
}

/**
 * POST /accounts - Create account (mutation)
 *
 * @example
 * ```tsx
 * function CreateAccountForm() {
 *   const createAccount = useCreateAccount()
 *
 *   const handleSubmit = async (formData) => {
 *     try {
 *       const account = await createAccount.mutateAsync(formData)
 *       console.log('Created:', account)
 *     } catch (error) {
 *       console.error('Failed:', error)
 *     }
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <button disabled={createAccount.isPending}>
 *         Create Account
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useCreateAccount(
  options?: UseMutationOptions<
    components['schemas']['response.Account'],
    any,
    components['schemas']['request.CreateAccount']
  >
) {
  return useMutation({
    mutationFn: async (body: components['schemas']['request.CreateAccount']) => {
      const { data, error } = await api.POST('/accounts', { body })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /requests - List catering requests
 */
export function useRequests(
  params?: { limit?: number; offset?: number; status?: string },
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['requests', params],
    queryFn: async () => {
      const { data, error } = await api.GET('/requests', {
        params: { query: params },
      })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /requests/{id} - Get single request
 */
export function useRequest(
  requestId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['requests', requestId],
    queryFn: async () => {
      const { data, error } = await api.GET('/requests/{id}', {
        params: { path: { id: requestId } },
      })
      if (error) throw error
      return data!
    },
    enabled: !!requestId,
    ...options,
  })
}

/**
 * POST /requests - Create catering request
 */
export function useCreateRequest(options?: UseMutationOptions<any, any, any>) {
  return useMutation({
    mutationFn: async (body: any) => {
      const { data, error } = await api.POST('/requests', { body })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /offers - List offers
 */
export function useOffers(
  params?: { limit?: number; offset?: number; request_id?: string },
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['offers', params],
    queryFn: async () => {
      const { data, error } = await api.GET('/offers', {
        params: { query: params },
      })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /offers/{id} - Get single offer
 */
export function useOffer(
  offerId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['offers', offerId],
    queryFn: async () => {
      const { data, error } = await api.GET('/offers/{id}', {
        params: { path: { id: offerId } },
      })
      if (error) throw error
      return data!
    },
    enabled: !!offerId,
    ...options,
  })
}

/**
 * POST /offers - Create offer (caterer submits offer)
 */
export function useCreateOffer(options?: UseMutationOptions<any, any, any>) {
  return useMutation({
    mutationFn: async (body: any) => {
      const { data, error } = await api.POST('/offers', { body })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * POST /offers/{id}/accept - Accept an offer
 */
export function useAcceptOffer(options?: UseMutationOptions<any, any, string>) {
  return useMutation({
    mutationFn: async (offerId: string) => {
      const { data, error } = await api.POST('/offers/{id}/accept', {
        params: { path: { id: offerId } },
      })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /orders - List orders
 */
export function useOrders(
  params?: { limit?: number; offset?: number; status?: string },
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const { data, error } = await api.GET('/orders', {
        params: { query: params },
      })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /orders/{id} - Get single order
 */
export function useOrder(
  orderId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const { data, error } = await api.GET('/orders/{id}', {
        params: { path: { id: orderId } },
      })
      if (error) throw error
      return data!
    },
    enabled: !!orderId,
    ...options,
  })
}

/**
 * GET /menus - List menus
 */
export function useMenus(
  params?: { limit?: number; offset?: number; account_id?: string },
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['menus', params],
    queryFn: async () => {
      const { data, error } = await api.GET('/menus', {
        params: { query: params },
      })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /menus/{id} - Get single menu
 */
export function useMenu(
  menuId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['menus', menuId],
    queryFn: async () => {
      const { data, error } = await api.GET('/menus/{id}', {
        params: { path: { id: menuId } },
      })
      if (error) throw error
      return data!
    },
    enabled: !!menuId,
    ...options,
  })
}

/**
 * POST /menus - Create menu
 */
export function useCreateMenu(options?: UseMutationOptions<any, any, any>) {
  return useMutation({
    mutationFn: async (body: any) => {
      const { data, error } = await api.POST('/menus', { body })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /invoices - List invoices
 */
export function useInvoices(
  params?: { limit?: number; offset?: number },
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const { data, error } = await api.GET('/invoices', {
        params: { query: params },
      })
      if (error) throw error
      return data!
    },
    ...options,
  })
}

/**
 * GET /invoices/{id} - Get single invoice
 */
export function useInvoice(
  invoiceId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: async () => {
      const { data, error } = await api.GET('/invoices/{id}', {
        params: { path: { id: invoiceId } },
      })
      if (error) throw error
      return data!
    },
    enabled: !!invoiceId,
    ...options,
  })
}

// Add more hooks as needed for other endpoints...
// This is a starter set - you can generate more as you build features
