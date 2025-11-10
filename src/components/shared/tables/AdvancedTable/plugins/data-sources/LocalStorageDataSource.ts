import type {
  IDataSource,
  DataSourceParams,
  DataSourceResult,
  BulkOperationResult,
} from '../../core/interfaces'

export interface LocalStorageDataSourceConfig<TRow = any> {
  key: string
  getRowId?: (row: TRow) => string
  defaultData?: TRow[]
}

export class LocalStorageDataSource<TRow = any> implements IDataSource<TRow> {
  private key: string
  private getRowId: (row: TRow) => string

  constructor(config: LocalStorageDataSourceConfig<TRow>) {
    this.key = config.key
    this.getRowId = config.getRowId || ((row: any) => row.id)

    if (config.defaultData && !this.getData().length) {
      this.saveData(config.defaultData)
    }
  }

  private getData(): TRow[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.key)
    if (!stored) return []

    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  private saveData(data: TRow[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.key, JSON.stringify(data))
  }

  async fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>> {
    let data = this.getData()

    if (params.search) {
      const searchLower = params.search.toLowerCase()
      data = data.filter(row =>
        Object.values(row as any).some(val =>
          String(val).toLowerCase().includes(searchLower)
        )
      )
    }

    if (params.filters) {
      data = data.filter(row => {
        return Object.entries(params.filters!).every(([key, value]) => {
          const rowValue = (row as any)[key]
          if (value === undefined || value === null || value === '') return true
          return String(rowValue) === String(value)
        })
      })
    }

    if (params.sorting && params.sorting.length > 0) {
      const { field, direction } = params.sorting[0]
      data.sort((a, b) => {
        const aVal = (a as any)[field]
        const bVal = (b as any)[field]
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return direction === 'asc' ? comparison : -comparison
      })
    }

    const total = data.length
    const page = params.pagination?.page ?? 1
    const pageSize = params.pagination?.pageSize ?? 20

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = data.slice(start, end)

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async create(data: Partial<TRow>): Promise<TRow> {
    const allData = this.getData()

    const newRow = {
      ...data,
      id: `local-${Date.now()}`,
    } as TRow

    allData.push(newRow)
    this.saveData(allData)

    return newRow
  }

  async update(id: string, data: Partial<TRow>): Promise<TRow> {
    const allData = this.getData()
    const index = allData.findIndex(row => this.getRowId(row) === id)

    if (index === -1) {
      throw new Error(`Row with id ${id} not found`)
    }

    allData[index] = { ...allData[index], ...data }
    this.saveData(allData)

    return allData[index]
  }

  async delete(id: string): Promise<void> {
    const allData = this.getData()
    const index = allData.findIndex(row => this.getRowId(row) === id)

    if (index === -1) {
      throw new Error(`Row with id ${id} not found`)
    }

    allData.splice(index, 1)
    this.saveData(allData)
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const allData = this.getData()
    const idsSet = new Set(ids)
    const initialLength = allData.length

    const filteredData = allData.filter(row => !idsSet.has(this.getRowId(row)))
    this.saveData(filteredData)

    const affected = initialLength - filteredData.length

    return {
      success: true,
      affected,
    }
  }

  async batchUpdate(updates: Record<string, Partial<TRow>>): Promise<BulkOperationResult> {
    const allData = this.getData()
    let affected = 0

    for (const [id, updateData] of Object.entries(updates)) {
      const index = allData.findIndex(row => this.getRowId(row) === id)
      if (index !== -1) {
        allData[index] = { ...allData[index], ...updateData }
        affected++
      }
    }

    this.saveData(allData)

    return {
      success: true,
      affected,
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.key)
  }
}
