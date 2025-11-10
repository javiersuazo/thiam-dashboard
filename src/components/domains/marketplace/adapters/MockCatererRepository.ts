import { ICatererRepository } from '../repositories/ICatererRepository'
import { Caterer, PaginationParams, PaginatedResult } from '../types/domain'
import { mockProducts } from '../mocks/products'

export class MockCatererRepository implements ICatererRepository {
  private caterers: Map<string, Caterer>

  constructor() {
    this.caterers = this.buildCaterersFromProducts()
  }

  private buildCaterersFromProducts(): Map<string, Caterer> {
    const catererMap = new Map<string, Caterer>()

    mockProducts.forEach((product) => {
      if (!catererMap.has(product.catererId)) {
        const catererProducts = mockProducts.filter((p) => p.catererId === product.catererId)
        const avgRating =
          catererProducts.reduce((sum, p) => sum + (p.rating || 0), 0) /
          catererProducts.filter((p) => p.rating).length

        const totalReviews = catererProducts.reduce((sum, p) => sum + (p.reviewCount || 0), 0)

        const prices = catererProducts.map((p) => p.price)
        const categories = Array.from(new Set(catererProducts.map((p) => p.category)))

        catererMap.set(product.catererId, {
          id: product.catererId,
          name: product.catererName,
          rating: avgRating || undefined,
          reviewCount: totalReviews || undefined,
          categories,
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices),
            currency: product.currency,
          },
        })
      }
    })

    return catererMap
  }

  async getAll(params?: PaginationParams): Promise<PaginatedResult<Caterer>> {
    const caterers = Array.from(this.caterers.values())
    const { page = 1, pageSize = 12 } = params || {}
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return {
      items: caterers.slice(startIndex, endIndex),
      total: caterers.length,
      page,
      pageSize,
      totalPages: Math.ceil(caterers.length / pageSize),
    }
  }

  async getById(id: string): Promise<Caterer | null> {
    return this.caterers.get(id) || null
  }

  async search(query: string, params?: PaginationParams): Promise<PaginatedResult<Caterer>> {
    const normalizedQuery = query.toLowerCase().trim()
    const caterers = Array.from(this.caterers.values()).filter(
      (c) =>
        c.name.toLowerCase().includes(normalizedQuery) ||
        (c.description && c.description.toLowerCase().includes(normalizedQuery)) ||
        c.categories.some((cat) => cat.toLowerCase().includes(normalizedQuery))
    )

    const { page = 1, pageSize = 12 } = params || {}
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return {
      items: caterers.slice(startIndex, endIndex),
      total: caterers.length,
      page,
      pageSize,
      totalPages: Math.ceil(caterers.length / pageSize),
    }
  }
}
