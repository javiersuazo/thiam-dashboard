/**
 * React Query Hooks for Ingredient Management
 *
 * Type-safe hooks for ingredient CRUD, batch management, and stock operations.
 * Integrates with React Query for automatic caching and state management.
 *
 * Backend-driven filtering, sorting, and pagination.
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { api } from './index'

// =============================================================================
// TYPES
// =============================================================================

export interface Ingredient {
  id: string
  catererId: string
  name: string
  category: IngredientCategory
  unit: IngredientUnit
  currentStock: number
  reorderLevel: number
  costPerUnitCents?: number
  currency: string
  supplier?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type IngredientCategory =
  | 'vegetables'
  | 'fruits'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'grains'
  | 'bakery'
  | 'spices'
  | 'oils'
  | 'condiments'
  | 'beverages'
  | 'canned'
  | 'frozen'
  | 'supplies'
  | 'other'

export type IngredientUnit = 'kg' | 'g' | 'l' | 'ml' | 'piece'

export type QualityStatus = 'good' | 'near_expiry' | 'expired' | 'damaged' | 'recalled'

export interface IngredientBatch {
  id: string
  ingredientId: string
  locationId: string
  batchNumber?: string
  receivedDate: string
  expirationDate?: string
  receivedQuantity: number
  currentQuantity: number
  reservedQuantity: number
  supplierName?: string
  unitCostCents?: number
  currency: string
  qualityStatus: QualityStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface IngredientStock {
  id: string
  ingredientId: string
  locationId: string
  onHand: number
  reserved: number
  reorderLevel: number
  parLevel?: number
  updatedAt: string
}

export interface IngredientListParams {
  locationId?: string
  status?: 'active' | 'inactive' | 'low_stock'
  category?: IngredientCategory
  search?: string
  sortBy?: 'name' | 'category' | 'cost' | 'stock' | 'reorder_level' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface IngredientListResponse {
  data: Ingredient[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface CreateIngredientRequest {
  name: string
  category: IngredientCategory
  unit: IngredientUnit
  currentStock: number
  reorderLevel: number
  costPerUnitCents?: number
  currency?: string
  supplier?: string
  description?: string
  isActive: boolean
}

export interface UpdateIngredientRequest {
  name?: string
  category?: IngredientCategory
  unit?: IngredientUnit
  currentStock?: number
  reorderLevel?: number
  costPerUnitCents?: number
  currency?: string
  supplier?: string
  description?: string
  isActive?: boolean
}

export interface CreateBatchRequest {
  ingredientId: string
  locationId: string
  batchNumber?: string
  receivedDate: string
  expirationDate?: string
  receivedQuantity: number
  currentQuantity: number
  supplierName?: string
  unitCostCents?: number
  currency?: string
  notes?: string
  purchaseOrderId?: string
}

export interface ConsumeStockRequest {
  locationId: string
  quantity: number
  movementType: 'consume_production' | 'waste_adjustment' | 'manual_adjustment'
  referenceType?: string
  referenceId?: string
}

// =============================================================================
// QUERY HOOKS (GET)
// =============================================================================

/**
 * GET /accounts/{accountId}/ingredients - List ingredients
 *
 * @example
 * ```tsx
 * function IngredientsList({ accountId }: { accountId: string }) {
 *   const { data, isLoading, error } = useIngredients(accountId, {
 *     category: 'vegetables',
 *     sortBy: 'name',
 *     page: 1,
 *     limit: 20
 *   })
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <div>
 *       {data?.data.map(ingredient => (
 *         <div key={ingredient.id}>{ingredient.name}</div>
 *       ))}
 *       <Pagination {...data?.meta} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useIngredients(
  accountId: string,
  params?: IngredientListParams,
  options?: Omit<UseQueryOptions<IngredientListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['ingredients', accountId, params],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/accounts/{accountId}/ingredients', {
        params: {
          path: { accountId },
          query: params as any,
        },
      })
      if (error) throw error
      return data as IngredientListResponse
    },
    enabled: !!accountId,
    ...options,
  })
}

/**
 * GET /accounts/{accountId}/ingredients/{id} - Get single ingredient
 */
export function useIngredient(
  accountId: string,
  ingredientId: string,
  options?: Omit<UseQueryOptions<Ingredient>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['ingredients', accountId, ingredientId],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/accounts/{accountId}/ingredients/{id}', {
        params: {
          path: { accountId, id: ingredientId },
        },
      })
      if (error) throw error
      return data as Ingredient
    },
    enabled: !!accountId && !!ingredientId,
    ...options,
  })
}

/**
 * GET /accounts/{accountId}/ingredients/{id}/batches - List batches
 */
export function useIngredientBatches(
  accountId: string,
  ingredientId: string,
  options?: Omit<UseQueryOptions<IngredientBatch[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['ingredient-batches', accountId, ingredientId],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/accounts/{accountId}/ingredients/{id}/batches', {
        params: {
          path: { accountId, id: ingredientId },
        },
      })
      if (error) throw error
      return (data as any)?.data as IngredientBatch[]
    },
    enabled: !!accountId && !!ingredientId,
    ...options,
  })
}

/**
 * GET /accounts/{accountId}/ingredients/low-stock - List low stock ingredients
 */
export function useLowStockIngredients(
  accountId: string,
  options?: Omit<UseQueryOptions<IngredientStock[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['ingredients', accountId, 'low-stock'],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/accounts/{accountId}/ingredients/low-stock', {
        params: {
          path: { accountId },
        },
      })
      if (error) throw error
      return (data as any)?.data as IngredientStock[]
    },
    enabled: !!accountId,
    ...options,
  })
}

/**
 * GET /accounts/{accountId}/ingredients/expiring-batches - List expiring batches
 */
export function useExpiringBatches(
  accountId: string,
  daysAhead?: number,
  options?: Omit<UseQueryOptions<IngredientBatch[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['ingredients', accountId, 'expiring-batches', daysAhead],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/accounts/{accountId}/ingredients/expiring-batches', {
        params: {
          path: { accountId },
          query: { days_ahead: daysAhead } as any,
        },
      })
      if (error) throw error
      return (data as any)?.data as IngredientBatch[]
    },
    enabled: !!accountId,
    ...options,
  })
}

// =============================================================================
// MUTATION HOOKS (CREATE/UPDATE/DELETE)
// =============================================================================

/**
 * POST /accounts/{accountId}/ingredients - Create ingredient
 *
 * @example
 * ```tsx
 * function CreateIngredientForm({ accountId }: { accountId: string }) {
 *   const createIngredient = useCreateIngredient(accountId)
 *
 *   const handleSubmit = async (formData: CreateIngredientRequest) => {
 *     try {
 *       const ingredient = await createIngredient.mutateAsync(formData)
 *       toast.success('Ingredient created!')
 *     } catch (error) {
 *       toast.error('Failed to create ingredient')
 *     }
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useCreateIngredient(
  accountId: string,
  options?: UseMutationOptions<Ingredient, Error, CreateIngredientRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateIngredientRequest) => {
      const { data, error } = await api.POST('/v1/accounts/{accountId}/ingredients', {
        params: { path: { accountId } },
        body: body as any,
      })
      if (error) throw error
      return data as Ingredient
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ingredients', accountId],
        refetchType: 'active'
      })
    },
    ...options,
  })
}

/**
 * PUT /accounts/{accountId}/ingredients/{id} - Update ingredient
 */
export function useUpdateIngredient(
  accountId: string,
  options?: UseMutationOptions<Ingredient, Error, { ingredientId: string; data: UpdateIngredientRequest }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ingredientId, data: body }) => {
      const { data, error } = await api.PUT('/v1/accounts/{accountId}/ingredients/{id}', {
        params: {
          path: { accountId, id: ingredientId },
        },
        body: body as any,
      })
      if (error) throw error
      return data as Ingredient
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['ingredients', accountId],
        refetchType: 'active'
      })
      queryClient.invalidateQueries({
        queryKey: ['ingredients', accountId, variables.ingredientId],
        refetchType: 'active'
      })
    },
    ...options,
  })
}

/**
 * DELETE /accounts/{accountId}/ingredients/{id} - Delete ingredient
 */
export function useDeleteIngredient(
  accountId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ingredientId: string) => {
      const { error } = await api.DELETE('/v1/accounts/{accountId}/ingredients/{id}', {
        params: {
          path: { accountId, id: ingredientId },
        },
      })
      if (error) throw error
    },
    onSuccess: (_, ingredientId) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', accountId] })
      queryClient.removeQueries({ queryKey: ['ingredients', accountId, ingredientId] })
    },
    ...options,
  })
}

/**
 * POST /accounts/{accountId}/ingredients/batches - Add stock batch
 */
export function useAddBatch(
  accountId: string,
  options?: UseMutationOptions<IngredientBatch, Error, CreateBatchRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateBatchRequest) => {
      const { data, error } = await api.POST('/v1/accounts/{accountId}/ingredients/batches', {
        params: { path: { accountId } },
        body: body as any,
      })
      if (error) throw error
      return data as IngredientBatch
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['ingredient-batches', accountId, data.ingredientId],
        refetchType: 'active'
      })
      queryClient.invalidateQueries({
        queryKey: ['ingredients', accountId],
        refetchType: 'active'
      })
    },
    ...options,
  })
}

/**
 * POST /accounts/{accountId}/ingredients/{id}/consume - Consume stock
 */
export function useConsumeStock(
  accountId: string,
  options?: UseMutationOptions<void, Error, { ingredientId: string; data: ConsumeStockRequest }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ingredientId, data: body }) => {
      const { error } = await api.POST('/v1/accounts/{accountId}/ingredients/{id}/consume', {
        params: {
          path: { accountId, id: ingredientId },
        },
        body: body as any,
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['ingredients', accountId],
        refetchType: 'active'
      })
      queryClient.invalidateQueries({
        queryKey: ['ingredient-batches', accountId, variables.ingredientId],
        refetchType: 'active'
      })
    },
    ...options,
  })
}

/**
 * POST /accounts/{accountId}/ingredients/bulk-import - Bulk import ingredients
 */
export function useBulkImportIngredients(
  accountId: string,
  options?: UseMutationOptions<{ imported: number; skipped: number; errors?: string[] }, Error, CreateIngredientRequest[]>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ingredients: CreateIngredientRequest[]) => {
      const { data, error } = await api.POST('/v1/accounts/{accountId}/ingredients/bulk-import', {
        params: { path: { accountId } },
        body: { ingredients } as any,
      })
      if (error) throw error
      return data as { imported: number; skipped: number; errors?: string[] }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ingredients', accountId],
        refetchType: 'active'
      })
    },
    ...options,
  })
}

/**
 * DELETE /accounts/{accountId}/ingredients/bulk-delete - Bulk delete ingredients
 */
export function useBulkDeleteIngredients(
  accountId: string,
  options?: UseMutationOptions<{ deleted: number }, Error, string[]>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await api.DELETE('/v1/accounts/{accountId}/ingredients/bulk-delete', {
        params: { path: { accountId } },
        body: { ids } as any,
      })
      if (error) throw error
      return data as { deleted: number }
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['ingredients', accountId],
        refetchType: 'active'
      })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

/**
 * PATCH /accounts/{accountId}/ingredients/batch-update - Batch update ingredients
 * Updates multiple ingredients with different values for each
 */
export function useBatchUpdateIngredients(
  accountId: string,
  options?: UseMutationOptions<{ updated: number }, Error, Record<string, Partial<UpdateIngredientRequest>>>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Record<string, Partial<UpdateIngredientRequest>>) => {
      const { data, error } = await api.PATCH('/v1/accounts/{accountId}/ingredients/batch-update', {
        params: { path: { accountId } },
        body: { updates } as any,
      })
      if (error) throw error
      return data as { updated: number }
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['ingredients', accountId],
        refetchType: 'active'
      })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
