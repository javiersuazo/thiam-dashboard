import { useMemo, Dispatch, SetStateAction } from 'react'
import { useReactTable, getCoreRowModel, type ColumnDef } from '@tanstack/react-table'
import type { TableFeatures, TableState } from '../core/interfaces'

interface UseTableConfigurationParams<TRow> {
  data: TRow[]
  columns: ColumnDef<TRow, any>[]
  features: TableFeatures
  totalPages: number
  tableState: TableState
  setTableState: Dispatch<SetStateAction<TableState>>
  rowSelectionState: Record<string, boolean>
  handleRowSelectionChange: (updater: any, data: TRow[], getRowId: (row: TRow) => string, setTableState: Dispatch<SetStateAction<TableState>>) => void
  editedRows: Record<string, Partial<TRow>>
  handleCellEdit: (rowId: string, columnId: string, value: any) => void
  getRowId: (row: TRow) => string
}

export function useTableConfiguration<TRow>({
  data,
  columns,
  features,
  totalPages,
  tableState,
  setTableState,
  rowSelectionState,
  handleRowSelectionChange,
  editedRows,
  handleCellEdit,
  getRowId,
}: UseTableConfigurationParams<TRow>) {
  const sortingState = useMemo(() => {
    return tableState.sorting.map(s => ({
      id: s.field,
      desc: s.direction === 'desc',
    }))
  }, [tableState.sorting])

  const paginationState = useMemo(() => ({
    pageIndex: tableState.pagination.page - 1,
    pageSize: tableState.pagination.pageSize,
  }), [tableState.pagination.page, tableState.pagination.pageSize])

  const tableMeta = useMemo(() => ({
    editedRows,
    handleCellEdit,
  }), [editedRows, handleCellEdit])

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => getRowId(row),
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: features.rowSelection !== false,
    enableColumnResizing: features.columnResize !== false,
    columnResizeMode: 'onChange',
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    meta: tableMeta,
    state: {
      pagination: paginationState,
      sorting: sortingState,
      rowSelection: rowSelectionState,
      columnSizing: tableState.columnSizing || {},
    },
    onColumnSizingChange: (updater) => {
      setTableState(prev => {
        const newSizing = typeof updater === 'function'
          ? updater(prev.columnSizing || {})
          : updater

        return {
          ...prev,
          columnSizing: newSizing,
        }
      })
    },
    onColumnFiltersChange: (updater) => {
      setTableState(prev => {
        const currentFilters = Object.entries(prev.filters).map(([id, value]) => ({
          id,
          value,
        }))

        const newFilters = typeof updater === 'function'
          ? updater(currentFilters)
          : updater

        const filtersObject: Record<string, any> = {}
        newFilters.forEach(filter => {
          if (filter.value !== undefined && filter.value !== null) {
            filtersObject[filter.id] = filter.value
          }
        })

        const filtersChanged =
          Object.keys(filtersObject).length !== Object.keys(prev.filters).length ||
          Object.keys(filtersObject).some(key => filtersObject[key] !== prev.filters[key])

        if (!filtersChanged) {
          return prev
        }

        return {
          ...prev,
          filters: filtersObject,
        }
      })
    },
    onPaginationChange: (updater) => {
      setTableState(prev => {
        const newPagination = typeof updater === 'function'
          ? updater({ pageIndex: prev.pagination.page - 1, pageSize: prev.pagination.pageSize })
          : updater

        return {
          ...prev,
          pagination: {
            page: newPagination.pageIndex + 1,
            pageSize: newPagination.pageSize,
          }
        }
      })
    },
    onSortingChange: (updater) => {
      setTableState(prev => {
        const currentSorting = prev.sorting.map(s => ({
          id: s.field,
          desc: s.direction === 'desc',
        }))

        const newSorting = typeof updater === 'function'
          ? updater(currentSorting)
          : updater

        return {
          ...prev,
          sorting: newSorting.map(s => ({
            field: s.id,
            direction: s.desc ? 'desc' : 'asc',
          }))
        }
      })
    },
    onRowSelectionChange: (updater) => {
      handleRowSelectionChange(updater, data, getRowId, setTableState)
    },
  })

  return table
}
