import { ICatererRepository } from '../repositories/ICatererRepository'
import { Caterer, PaginationParams, PaginatedResult } from '../types/domain'

export class CatererService {
  constructor(private readonly repository: ICatererRepository) {}

  async getCaterers(params?: PaginationParams): Promise<PaginatedResult<Caterer>> {
    return this.repository.getAll(params)
  }

  async getCatererById(id: string): Promise<Caterer | null> {
    return this.repository.getById(id)
  }

  async searchCaterers(query: string, params?: PaginationParams): Promise<PaginatedResult<Caterer>> {
    if (!query.trim()) {
      return this.repository.getAll(params)
    }
    return this.repository.search(query, params)
  }
}
