import type { Menu, MenuItem, Equipment, ServiceItem } from '../types'

export interface MenuItemFilters {
  category?: string
  dietaryTags?: string[]
  search?: string
  minPrice?: number
  maxPrice?: number
  isAvailable?: boolean
}

export interface ICatalogService {
  getMenus(catererId: string): Promise<Menu[]>
  getMenuItems(catererId: string, filters?: MenuItemFilters): Promise<MenuItem[]>
  getEquipment(catererId: string): Promise<Equipment[]>
  getServices(catererId: string): Promise<ServiceItem[]>
}
