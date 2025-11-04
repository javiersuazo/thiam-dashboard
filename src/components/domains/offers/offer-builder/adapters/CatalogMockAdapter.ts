import type { ICatalogService, MenuItemFilters } from '../ports'
import type { Menu, MenuItem, Equipment, ServiceItem } from '../types'
import { MOCK_MENUS, MOCK_MENU_ITEMS, MOCK_EQUIPMENT, MOCK_SERVICES } from '../infrastructure/mock/catalog.mock'

export class CatalogMockAdapter implements ICatalogService {
  private delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getMenus(catererId: string): Promise<Menu[]> {
    await this.delay()
    return JSON.parse(JSON.stringify(MOCK_MENUS))
  }

  async getMenuItems(catererId: string, filters?: MenuItemFilters): Promise<MenuItem[]> {
    await this.delay()

    let items = JSON.parse(JSON.stringify(MOCK_MENU_ITEMS))

    if (filters) {
      if (filters.category) {
        items = items.filter((item: MenuItem) => item.category === filters.category)
      }

      if (filters.dietaryTags && filters.dietaryTags.length > 0) {
        items = items.filter((item: MenuItem) =>
          filters.dietaryTags!.some((tag) => item.dietaryTags?.includes(tag))
        )
      }

      if (filters.search) {
        const search = filters.search.toLowerCase()
        items = items.filter(
          (item: MenuItem) =>
            item.name.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search)
        )
      }

      if (filters.minPrice !== undefined) {
        items = items.filter((item: MenuItem) => item.priceCents >= filters.minPrice!)
      }

      if (filters.maxPrice !== undefined) {
        items = items.filter((item: MenuItem) => item.priceCents <= filters.maxPrice!)
      }

      if (filters.isAvailable !== undefined) {
        items = items.filter((item: MenuItem) => item.isAvailable === filters.isAvailable)
      }
    }

    return items
  }

  async getEquipment(catererId: string): Promise<Equipment[]> {
    await this.delay()
    return JSON.parse(JSON.stringify(MOCK_EQUIPMENT))
  }

  async getServices(catererId: string): Promise<ServiceItem[]> {
    await this.delay()
    return JSON.parse(JSON.stringify(MOCK_SERVICES))
  }
}
