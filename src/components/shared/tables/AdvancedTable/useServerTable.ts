import { useState, useEffect, useMemo } from 'react'
import type { PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import type { ServerSideConfig } from './types'

interface UseServerTableOptions<TData> {
  queryKey: string[]
  queryFn: (params: ServerTableParams) => Promise<ServerTableResponse<TData>>
  initialPageSize?: number
  enabled?: boolean
}

export interface ServerTableParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface ServerTableResponse<TData> {
  data: TData[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useServerTable<TData>({
  queryKey,
  queryFn,
  initialPageSize = 10,
  enabled = true,
}: UseServerTableOptions<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const params = useMemo<ServerTableParams>(() => {
    const sortBy = sorting[0]?.id
    const sortOrder = sorting[0]?.desc ? 'desc' : 'asc'

    const filters: Record<string, any> = {}
    columnFilters.forEach((filter) => {
      filters[filter.id] = filter.value
    })

    return {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      sortBy,
      sortOrder,
      search: globalFilter || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    }
  }, [pagination, sorting, columnFilters, globalFilter])

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => queryFn(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })

  const serverSideConfig: ServerSideConfig<TData> = {
    enabled: true,
    totalItems: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    isFetching,
  }

  return {
    data: data?.data ?? [],
    serverSideConfig,
    pagination,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    refetch,
    isLoading,
    isFetching,
    error,
    totalItems: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
  }
}

export function buildQueryParams(params: ServerTableParams): Record<string, string> {
  const queryParams: Record<string, string> = {
    offset: String((params.page - 1) * params.pageSize),
    limit: String(params.pageSize),
  }

  if (params.sortBy) {
    queryParams.sort_by = params.sortBy
    queryParams.sort_order = params.sortOrder || 'asc'
  }

  if (params.search) {
    queryParams.search = params.search
  }

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value)
      }
    })
  }

  return queryParams
}
