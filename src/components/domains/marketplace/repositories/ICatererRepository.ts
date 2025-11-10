import { Caterer, PaginationParams, PaginatedResult } from '../types/domain'

export interface ICatererRepository {
  getAll(params?: PaginationParams): Promise<PaginatedResult<Caterer>>

  getById(id: string): Promise<Caterer | null>

  search(query: string, params?: PaginationParams): Promise<PaginatedResult<Caterer>>
}
