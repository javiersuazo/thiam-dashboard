/**
 * Repository DataSource Adapter
 *
 * Adapts Repository pattern to IDataSource interface
 * This is the bridge between the repository layer and the table component
 *
 * Following Adapter Pattern and Dependency Inversion Principle
 */

import type {
  IDataSource,
  DataSourceParams,
  DataSourceResult,
  BulkOperationResult
} from '../interfaces'
import type { IRepository } from './repository'

/**
 * Wraps a Repository to make it compatible with IDataSource interface
 *
 * This creates a proper layered architecture:
 *
 * ┌─────────────────────────────────┐
 * │   Table Component (View)        │
 * │   - AdvancedTablePlugin          │
 * └────────────┬────────────────────┘
 *              │ uses IDataSource
 * ┌────────────▼────────────────────┐
 * │   Data Source Layer (Adapter)   │
 * │   - RepositoryDataSource         │
 * └────────────┬────────────────────┘
 *              │ uses IRepository
 * ┌────────────▼────────────────────┐
 * │   Repository Layer (Data Access)│
 * │   - ApiRepository                │
 * │   - MockRepository               │
 * └────────────┬────────────────────┘
 *              │ uses Transformer
 * ┌────────────▼────────────────────┐
 * │   Transformation Layer           │
 * │   - IDataTransformer             │
 * │   - ProductTransformer           │
 * └────────────┬────────────────────┘
 *              │
 * ┌────────────▼────────────────────┐
 * │   API Layer (Infrastructure)     │
 * │   - openapi-fetch client         │
 * │   - HTTP requests                │
 * └──────────────────────────────────┘
 */
export class RepositoryDataSource<TRow> implements IDataSource<TRow> {
  constructor(private repository: IRepository<TRow>) {}

  async fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>> {
    return this.repository.fetch(params)
  }

  async create(data: Partial<TRow>): Promise<TRow> {
    if (!this.repository.create) {
      throw new Error('Create operation not supported by this repository')
    }
    return this.repository.create(data)
  }

  async update(id: string, data: Partial<TRow>): Promise<TRow> {
    if (!this.repository.update) {
      throw new Error('Update operation not supported by this repository')
    }
    return this.repository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    if (!this.repository.delete) {
      throw new Error('Delete operation not supported by this repository')
    }
    return this.repository.delete(id)
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    if (!this.repository.bulkDelete) {
      throw new Error('Bulk delete operation not supported by this repository')
    }
    return this.repository.bulkDelete(ids)
  }

  async batchUpdate(updates: Record<string, Partial<TRow>>): Promise<BulkOperationResult> {
    if (!this.repository.update) {
      throw new Error('Update operation not supported by this repository')
    }

    const results = await Promise.allSettled(
      Object.entries(updates).map(([id, data]) =>
        this.repository.update!(id, data)
      )
    )

    const errors = results
      .map((result, index) => ({
        result,
        id: Object.keys(updates)[index]
      }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ result, id }) => ({
        id,
        message: (result as PromiseRejectedResult).reason.message
      }))

    return {
      success: errors.length === 0,
      affected: results.filter(r => r.status === 'fulfilled').length,
      errors: errors.length > 0 ? errors : undefined
    }
  }
}
