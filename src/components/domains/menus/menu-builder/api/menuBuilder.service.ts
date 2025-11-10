import { api } from '@/lib/api'
import type { MenuItem } from '../types'

export interface CreateMenuRequest {
  name: string
  description?: string
  imageUrl?: string
  availableFrom?: string
  availableTo?: string
  tags?: string[]
  courses: Array<{
    name: string
    icon: string
    items: Array<{
      menuItemId: string
      position: number
      priceCents: number
      isAvailable: boolean
    }>
  }>
  isActive: boolean
  pricingStrategy?: 'fixed' | 'sum-of-items'
  fixedPriceCents?: number
}

export interface UpdateMenuRequest extends CreateMenuRequest {
  id: string
}

export interface MenuBuilderResponse {
  id: string
  accountId: string
  name: string
  description?: string
  imageUrl?: string
  availableFrom?: string
  availableTo?: string
  tags?: string[]
  courses: Array<{
    id: string
    name: string
    icon: string
    position: number
    items: Array<{
      id: string
      menuItemId: string
      position: number
      priceCents: number
      isAvailable: boolean
    }>
  }>
  isActive: boolean
  pricingStrategy?: 'fixed' | 'sum-of-items'
  fixedPriceCents?: number
  createdAt: string
  updatedAt: string
}

export const menuBuilderService = {
  async getAvailableItems(accountId: string): Promise<MenuItem[]> {
    const { data, error } = await api.GET('/accounts/{accountId}/menu-items', {
      params: { path: { accountId } },
    })

    if (error) throw new Error('Failed to fetch menu items')
    return data as unknown as MenuItem[]
  },

  async getMenu(accountId: string, menuId: string): Promise<MenuBuilderResponse> {
    const { data, error } = await api.GET('/accounts/{accountId}/menus/{menuId}', {
      params: { path: { accountId, menuId } },
    })

    if (error) throw new Error('Failed to fetch menu')
    return data as unknown as MenuBuilderResponse
  },

  async listMenus(accountId: string): Promise<MenuBuilderResponse[]> {
    const { data, error } = await api.GET('/accounts/{accountId}/menus', {
      params: { path: { accountId } },
    })

    if (error) throw new Error('Failed to fetch menus')
    return data as unknown as MenuBuilderResponse[]
  },

  async createMenu(accountId: string, menu: CreateMenuRequest): Promise<MenuBuilderResponse> {
    const { data, error } = await api.POST('/accounts/{accountId}/menus', {
      params: { path: { accountId } },
      body: menu as unknown as Record<string, unknown>,
    })

    if (error) throw new Error('Failed to create menu')
    return data as unknown as MenuBuilderResponse
  },

  async updateMenu(accountId: string, menuId: string, menu: UpdateMenuRequest): Promise<MenuBuilderResponse> {
    const { data, error } = await api.PUT('/accounts/{accountId}/menus/{menuId}', {
      params: { path: { accountId, menuId } },
      body: menu as unknown as Record<string, unknown>,
    })

    if (error) throw new Error('Failed to update menu')
    return data as unknown as MenuBuilderResponse
  },

  async deleteMenu(accountId: string, menuId: string): Promise<void> {
    const { error } = await api.DELETE('/accounts/{accountId}/menus/{menuId}', {
      params: { path: { accountId, menuId } },
    })

    if (error) throw new Error('Failed to delete menu')
  },

  async duplicateMenu(accountId: string, menuId: string): Promise<MenuBuilderResponse> {
    const { data, error } = await api.POST('/accounts/{accountId}/menus/{menuId}/duplicate', {
      params: { path: { accountId, menuId } },
    })

    if (error) throw new Error('Failed to duplicate menu')
    return data as unknown as MenuBuilderResponse
  },
}
