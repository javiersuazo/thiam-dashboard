import type {
  IDataSource,
  DataSourceParams,
  DataSourceResult,
  BulkOperationResult,
} from '../../core/interfaces'

export interface MockDataSourceConfig<TRow = any> {
  data: TRow[]
  getRowId?: (row: TRow) => string
  delay?: number
}

export class MockDataSource<TRow = any> implements IDataSource<TRow> {
  private data: TRow[]
  private getRowId: (row: TRow) => string
  private delay: number

  constructor(config: MockDataSourceConfig<TRow>) {
    this.data = [...config.data]
    this.getRowId = config.getRowId || ((row: any) => row.id)
    this.delay = config.delay ?? 0
  }

  private async simulateDelay(): Promise<void> {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay))
    }
  }

  async fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>> {
    await this.simulateDelay()

    let filtered = [...this.data]

    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filtered = filtered.filter(row =>
        Object.values(row as any).some(val =>
          String(val).toLowerCase().includes(searchLower)
        )
      )
    }

    if (params.filters) {
      filtered = filtered.filter(row => {
        return Object.entries(params.filters!).every(([key, value]) => {
          const rowValue = (row as any)[key]
          if (value === undefined || value === null || value === '') return true

          // Handle numeric range filters (e.g., {min: 1, max: 100})
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if ('min' in value || 'max' in value) {
              const numValue = Number(rowValue)
              if (value.min !== undefined && numValue < Number(value.min)) return false
              if (value.max !== undefined && numValue > Number(value.max)) return false
              return true
            }
            // Handle date range filters (e.g., {from: '2024-01-01', to: '2024-12-31'})
            if ('from' in value || 'to' in value) {
              const dateValue = new Date(rowValue).getTime()
              if (value.from && dateValue < new Date(value.from).getTime()) return false
              if (value.to && dateValue > new Date(value.to).getTime()) return false
              return true
            }
          }

          // Handle array filters (multi-select) - check if any selected value exists in row array
          if (Array.isArray(value) && value.length > 0) {
            if (Array.isArray(rowValue)) {
              return value.some(v => rowValue.includes(v))
            }
            return value.includes(rowValue)
          }

          // Handle simple equality (text, select)
          return String(rowValue).toLowerCase() === String(value).toLowerCase()
        })
      })
    }

    if (params.sorting && params.sorting.length > 0) {
      const { field, direction } = params.sorting[0]
      filtered.sort((a, b) => {
        const aVal = (a as any)[field]
        const bVal = (b as any)[field]
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return direction === 'asc' ? comparison : -comparison
      })
    }

    const total = filtered.length
    const page = params.pagination?.page ?? 1
    const pageSize = params.pagination?.pageSize ?? 20

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filtered.slice(start, end)

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async create(data: Partial<TRow>): Promise<TRow> {
    await this.simulateDelay()

    const newRow = {
      ...data,
      id: `mock-${Date.now()}`,
    } as TRow

    this.data.push(newRow)
    return newRow
  }

  async update(id: string, data: Partial<TRow>): Promise<TRow> {
    await this.simulateDelay()

    const index = this.data.findIndex(row => this.getRowId(row) === id)
    if (index === -1) {
      throw new Error(`Row with id ${id} not found`)
    }

    this.data[index] = { ...this.data[index], ...data }
    return this.data[index]
  }

  async delete(id: string): Promise<void> {
    await this.simulateDelay()

    const index = this.data.findIndex(row => this.getRowId(row) === id)
    if (index === -1) {
      throw new Error(`Row with id ${id} not found`)
    }

    this.data.splice(index, 1)
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    await this.simulateDelay()

    const idsSet = new Set(ids)
    const initialLength = this.data.length

    this.data = this.data.filter(row => !idsSet.has(this.getRowId(row)))

    const affected = initialLength - this.data.length

    return {
      success: true,
      affected,
    }
  }

  async batchUpdate(updates: Record<string, Partial<TRow>>): Promise<BulkOperationResult> {
    await this.simulateDelay()

    let affected = 0

    for (const [id, updateData] of Object.entries(updates)) {
      const index = this.data.findIndex(row => this.getRowId(row) === id)
      if (index !== -1) {
        this.data[index] = { ...this.data[index], ...updateData }
        affected++
      }
    }

    return {
      success: true,
      affected,
    }
  }

  setData(data: TRow[]) {
    this.data = [...data]
  }

  getData(): TRow[] {
    return [...this.data]
  }
}
