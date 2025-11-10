/**
 * React Query Hooks for Menu Item Management
 *
 * Type-safe hooks for menu item CRUD following ingredients pattern.
 * Uses openapi-fetch with proper uppercase HTTP methods.
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { api } from './index'

// =============================================================================
// TYPES
// =============================================================================

export type CourseType = "starter" | "main" | "dessert" | "snack" | "drink" | "side" | "other"
export type MenuItemVisibility = "inherit" | "private" | "public" | "storefront" | "hidden"
export type DeliveryType = "hot" | "cold" | "frozen" | "ambient"
export type PackagingType = "disposable" | "reusable" | "bulk" | "individual"

export interface MenuItemIngredient {
  id: string
  menuItemId: string
  ingredientId: string
  quantityPerPortion: number
  unit?: string
  ingredient?: {
    id: string
    name: string
    currentStock: number
    unit: string
    costPerUnitCents: number
    currency: string
  }
}

export interface Media {
  id: string
  key: string
  url: string
  contentType: string
  sizeBytes: number
  mediaType: "image" | "video"
  originalFilename?: string
  uploadedBy?: string
  metadata?: Record<string, string>
  displayOrder?: number
  isPrimary?: boolean
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  slug: string
  name: string
  groupSlug?: string
  groupId?: string
  groupName?: string
}

export interface MenuItem {
  id: string
  catererId: string
  name: string
  description?: string
  priceCents: number
  currency: string
  portionSize?: string
  sku?: string
  visibility: MenuItemVisibility
  isBundleOnly: boolean
  isActive: boolean
  visibleFrom?: string
  visibleUntil?: string
  taxRateId?: string
  numberOfPeopleServed?: number
  calories?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  weightG?: number
  deliveryType?: DeliveryType
  deliveryOptions?: string[]
  packagingType?: PackagingType
  singlePackaged: boolean
  archivedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MenuItemWithDetails extends MenuItem {
  ingredients?: MenuItemIngredient[]
  tags?: Tag[]
  media?: Media[]
  courseType?: CourseType
}

export interface MenuItemListParams {
  page?: number
  limit?: number
  sortBy?: "name" | "priceCents" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
  search?: string
  visibility?: MenuItemVisibility
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
  deliveryType?: DeliveryType
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface MenuItemListResponse {
  data: MenuItem[]
  meta: PaginationMeta
}

export interface CreateMenuItemRequest {
  catererId: string
  name: string
  description?: string
  priceCents: number
  currency: string
  portionSize?: string
  sku?: string
  visibility: MenuItemVisibility
  isBundleOnly?: boolean
  visibleFrom?: string
  visibleUntil?: string
  taxRateId?: string
  numberOfPeopleServed?: number
  calories?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  weightG?: number
  deliveryType?: DeliveryType
  deliveryOptions?: string[]
  packagingType?: PackagingType
  singlePackaged?: boolean
  tags?: string[]
}

export interface UpdateMenuItemRequest {
  name?: string
  description?: string
  priceCents?: number
  currency?: string
  portionSize?: string
  sku?: string
  visibility?: MenuItemVisibility
  isBundleOnly?: boolean
  isActive?: boolean
  visibleFrom?: string
  visibleUntil?: string
  taxRateId?: string
  numberOfPeopleServed?: number
  calories?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  weightG?: number
  deliveryType?: DeliveryType
  deliveryOptions?: string[]
  packagingType?: PackagingType
  singlePackaged?: boolean
}

export interface AddIngredientRequest {
  ingredientId: string
  quantityPerPortion: number
  unit?: string
}

export interface AttachMediaRequest {
  mediaId: string
  displayOrder?: number
  isPrimary?: boolean
}

export interface ReorderMediaItem {
  mediaId: string
  displayOrder: number
}

// =============================================================================
// REACT QUERY HOOKS
// =============================================================================

/**
 * GET /caterers/{catererId}/menu-items - List menu items with pagination
 */
export function useMenuItems(
  catererId: string,
  params?: MenuItemListParams,
  options?: Omit<UseQueryOptions<MenuItemListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['menu-items', catererId, params],
    queryFn: async () => {
      const { data, error } = await api.GET('/caterers/{catererId}/menu-items', {
        params: {
          path: { catererId },
          query: params as any,
        },
      })
      if (error) throw error
      return data as MenuItemListResponse
    },
    enabled: !!catererId,
    ...options,
  })
}

/**
 * GET /menu-items/{id} - Get single menu item
 */
export function useMenuItem(
  id: string,
  options?: Omit<UseQueryOptions<MenuItem>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['menu-items', id],
    queryFn: async () => {
      const { data, error } = await api.GET('/menu-items/{id}', {
        params: { path: { id } },
      })
      if (error) throw error
      return data as MenuItem
    },
    enabled: !!id,
    ...options,
  })
}

/**
 * GET /menu-items/{id}/details - Get menu item with ingredients, tags, and media
 */
export function useMenuItemWithDetails(
  id: string,
  options?: Omit<UseQueryOptions<MenuItemWithDetails>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['menu-items', id, 'details'],
    queryFn: async () => {
      const { data, error } = await api.GET('/menu-items/{id}/details', {
        params: { path: { id } },
      })
      if (error) throw error
      return data as MenuItemWithDetails
    },
    enabled: !!id,
    ...options,
  })
}

/**
 * POST /menu-items - Create a new menu item
 */
export function useCreateMenuItem(
  catererId: string,
  options?: UseMutationOptions<MenuItem, Error, CreateMenuItemRequest>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateMenuItemRequest) => {
      const { data, error } = await api.POST('/menu-items', {
        body: body as any,
      })
      if (error) throw error
      return data as MenuItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', catererId] })
    },
    ...options,
  })
}

/**
 * PUT /menu-items/{id} - Update a menu item
 */
export function useUpdateMenuItem(
  catererId: string,
  options?: UseMutationOptions<MenuItem, Error, { menuItemId: string; data: UpdateMenuItemRequest }>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ menuItemId, data: body }) => {
      const { data, error } = await api.PUT('/menu-items/{id}', {
        params: { path: { id: menuItemId } },
        body: body as any,
      })
      if (error) throw error
      return data as MenuItem
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', catererId] })
      queryClient.invalidateQueries({ queryKey: ['menu-items', variables.menuItemId] })
    },
    ...options,
  })
}

/**
 * DELETE /menu-items/{id} - Delete a menu item
 */
export function useDeleteMenuItem(
  catererId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (menuItemId: string) => {
      const { error } = await api.DELETE('/menu-items/{id}', {
        params: { path: { id: menuItemId } },
      })
      if (error) throw error
    },
    onSuccess: (_, menuItemId) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', catererId] })
      queryClient.removeQueries({ queryKey: ['menu-items', menuItemId] })
    },
    ...options,
  })
}

/**
 * POST /menu-items/{menuItemId}/ingredients - Add ingredient to menu item
 */
export function useAddIngredient(
  catererId: string,
  options?: UseMutationOptions<MenuItemIngredient, Error, { menuItemId: string; data: AddIngredientRequest }>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ menuItemId, data: body }) => {
      const { data, error } = await api.POST('/menu-items/{menuItemId}/ingredients', {
        params: { path: { menuItemId } },
        body: body as any,
      })
      if (error) throw error
      return data as MenuItemIngredient
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', variables.menuItemId, 'details'] })
    },
    ...options,
  })
}

/**
 * DELETE /menu-items/{menuItemId}/ingredients/{ingredientId} - Remove ingredient from menu item
 */
export function useRemoveIngredient(
  catererId: string,
  options?: UseMutationOptions<void, Error, { menuItemId: string; ingredientId: string }>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ menuItemId, ingredientId }) => {
      const { error } = await api.DELETE('/menu-items/{menuItemId}/ingredients/{ingredientId}', {
        params: { path: { menuItemId, ingredientId } },
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', variables.menuItemId, 'details'] })
    },
    ...options,
  })
}

/**
 * POST /menu-items/{id}/media - Attach media to menu item
 */
export function useAttachMedia(
  catererId: string,
  options?: UseMutationOptions<void, Error, { menuItemId: string; data: AttachMediaRequest }>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ menuItemId, data: body }) => {
      const { error } = await api.POST('/menu-items/{id}/media', {
        params: { path: { id: menuItemId } },
        body: body as any,
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', variables.menuItemId, 'details'] })
    },
    ...options,
  })
}

/**
 * DELETE /menu-items/{id}/media/{mediaId} - Remove media from menu item
 */
export function useRemoveMedia(
  catererId: string,
  options?: UseMutationOptions<void, Error, { menuItemId: string; mediaId: string }>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ menuItemId, mediaId }) => {
      const { error } = await api.DELETE('/menu-items/{id}/media/{mediaId}', {
        params: { path: { id: menuItemId, mediaId } },
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', variables.menuItemId, 'details'] })
    },
    ...options,
  })
}

/**
 * PUT /menu-items/{id}/media/{mediaId}/primary - Set primary media
 */
export function useSetPrimaryMedia(
  catererId: string,
  options?: UseMutationOptions<void, Error, { menuItemId: string; mediaId: string }>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ menuItemId, mediaId }) => {
      const { error } = await api.PUT('/menu-items/{id}/media/{mediaId}/primary', {
        params: { path: { id: menuItemId, mediaId } },
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', variables.menuItemId, 'details'] })
    },
    ...options,
  })
}

/**
 * PUT /menu-items/{id}/media/reorder - Reorder media
 */
export function useReorderMedia(
  catererId: string,
  options?: UseMutationOptions<void, Error, { menuItemId: string; items: ReorderMediaItem[] }>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ menuItemId, items }) => {
      const { error } = await api.PUT('/menu-items/{id}/media/reorder', {
        params: { path: { id: menuItemId } },
        body: { items } as any,
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', variables.menuItemId, 'details'] })
    },
    ...options,
  })
}

/**
 * DELETE /caterers/{catererId}/menu-items/bulk-delete - Bulk delete menu items
 */
export function useBulkDeleteMenuItems(
  catererId: string,
  options?: UseMutationOptions<{ deleted: number }, Error, string[]>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await api.DELETE('/v1/caterers/{catererId}/menu-items/bulk-delete', {
        params: { path: { catererId } },
        body: { ids } as any,
      })
      if (error) throw error
      return data as { deleted: number }
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['menu-items', catererId],
        refetchType: 'active'
      })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

/**
 * PATCH /caterers/{catererId}/menu-items/batch-update - Batch update menu items
 */
export function useBatchUpdateMenuItems(
  catererId: string,
  options?: UseMutationOptions<{ updated: number }, Error, Record<string, Partial<UpdateMenuItemRequest>>>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Record<string, Partial<UpdateMenuItemRequest>>) => {
      const { data, error } = await api.PATCH('/v1/caterers/{catererId}/menu-items/batch-update', {
        params: { path: { catererId } },
        body: { updates } as any,
      })
      if (error) throw error
      return data as { updated: number }
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['menu-items', catererId],
        refetchType: 'active'
      })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
