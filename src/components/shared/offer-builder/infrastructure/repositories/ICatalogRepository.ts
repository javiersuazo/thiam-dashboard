export interface CatalogItem {
  id: string
  type: string
  name: string
  description?: string
  priceCents: number
  unit?: string
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
  isAvailable: boolean
}

export interface CatalogFilters {
  type?: string
  category?: string
  searchQuery?: string
  tags?: string[]
  minPrice?: number
  maxPrice?: number
}

export interface ICatalogRepository {
  getItems(filters?: CatalogFilters): Promise<CatalogItem[]>

  getItemById(id: string): Promise<CatalogItem>

  searchItems(query: string, filters?: CatalogFilters): Promise<CatalogItem[]>

  getItemsByType(type: string): Promise<CatalogItem[]>

  getItemsByCategory(category: string): Promise<CatalogItem[]>
}
