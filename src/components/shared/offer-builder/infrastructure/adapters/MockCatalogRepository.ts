import type { ICatalogRepository, CatalogItem, CatalogFilters } from '../repositories/ICatalogRepository'

export class MockCatalogRepository implements ICatalogRepository {
  private items: CatalogItem[] = []

  constructor(initialItems?: CatalogItem[]) {
    this.items = initialItems || []
  }

  async getItems(filters?: CatalogFilters): Promise<CatalogItem[]> {
    await this.delay(100)
    return this.filterItems(this.items, filters)
  }

  async getItemById(id: string): Promise<CatalogItem> {
    await this.delay(50)
    const item = this.items.find(i => i.id === id)
    if (!item) {
      throw new Error(`Catalog item not found: ${id}`)
    }
    return JSON.parse(JSON.stringify(item))
  }

  async searchItems(query: string, filters?: CatalogFilters): Promise<CatalogItem[]> {
    await this.delay(100)
    const lowerQuery = query.toLowerCase()

    const filtered = this.items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )

    return this.filterItems(filtered, filters)
  }

  async getItemsByType(type: string): Promise<CatalogItem[]> {
    await this.delay(80)
    return this.items.filter(item => item.type === type)
  }

  async getItemsByCategory(category: string): Promise<CatalogItem[]> {
    await this.delay(80)
    return this.items.filter(item => item.category === category)
  }

  private filterItems(items: CatalogItem[], filters?: CatalogFilters): CatalogItem[] {
    if (!filters) return JSON.parse(JSON.stringify(items))

    let filtered = items

    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type)
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category)
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(item =>
        item.tags?.some(tag => filters.tags!.includes(tag))
      )
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(item => item.priceCents >= filters.minPrice!)
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(item => item.priceCents <= filters.maxPrice!)
    }

    return JSON.parse(JSON.stringify(filtered))
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
