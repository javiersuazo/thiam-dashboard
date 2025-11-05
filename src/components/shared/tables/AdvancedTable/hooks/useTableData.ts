import { useState, useEffect, useCallback } from 'react'
import type { IDataSource, DataSourceParams, TableState } from '../core/interfaces'

export interface UseTableDataResult<TRow> {
  data: TRow[]
  total: number
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useTableData<TRow>(
  dataSource: IDataSource<TRow>,
  tableState: TableState
): UseTableDataResult<TRow> {
  const [data, setData] = useState<TRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params: DataSourceParams = {
        pagination: tableState.pagination,
        sorting: tableState.sorting,
        filters: tableState.filters,
        search: tableState.search,
      }

      const result = await dataSource.fetch(params)

      setData(result.data)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      setData([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [
    dataSource,
    tableState.pagination,
    tableState.sorting,
    tableState.filters,
    tableState.search,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    total,
    isLoading,
    error,
    refetch: fetchData,
  }
}
