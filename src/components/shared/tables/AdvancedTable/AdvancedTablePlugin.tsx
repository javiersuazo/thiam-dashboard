'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table/index'
import { TableToolbar } from './components/TableToolbar'
import { TablePagination } from './components/TablePagination'
import { TableSkeleton } from './components/TableSkeleton'
import { EditableCell } from './components/EditableCell'
import { AngleDownIcon, AngleUpIcon, CheckLineIcon, CloseIcon } from '@/icons'
import Checkbox from '../../form/input/Checkbox'
import type {
  IDataSource,
  ISchemaProvider,
  ITableFeature,
  TableFeatures,
  ColumnDefinition,
  TableState,
  DataSourceParams,
} from './core/interfaces'
import type { BulkAction } from './types'

export interface AdvancedTablePluginProps<TRow = any> {
  dataSource: IDataSource<TRow>
  schemaProvider: ISchemaProvider<TRow>
  features?: TableFeatures
  plugins?: ITableFeature<TRow>[]
  bulkActions?: BulkAction<TRow>[]
  getRowId?: (row: TRow) => string
  className?: string
  emptyState?: React.ReactNode
  onRowClick?: (row: TRow) => void
  searchPlaceholder?: string
  exportFileName?: string
  editableColumns?: string[]
  onCellEdit?: (rowId: string, columnId: string, value: any) => void | Promise<void>
  onSaveRow?: (rowId: string, changes: Partial<TRow>) => void | Promise<void>
  onCancelRow?: (rowId: string) => void
  onSaveAll?: (changes: Record<string, Partial<TRow>>) => void | Promise<void>
  onCancelAll?: () => void
  getRowClassName?: (row: TRow) => string
}

export function AdvancedTablePlugin<TRow = any>({
  dataSource,
  schemaProvider,
  features = {},
  plugins = [],
  bulkActions = [],
  getRowId = (row: any) => row.id,
  className = '',
  emptyState,
  onRowClick,
  searchPlaceholder = 'Search...',
  exportFileName = 'export',
  editableColumns = [],
  onCellEdit,
  onSaveRow,
  onCancelRow,
  onSaveAll,
  onCancelAll,
  getRowClassName,
}: AdvancedTablePluginProps<TRow>) {
  const [data, setData] = useState<TRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [editedRows, setEditedRows] = useState<Record<string, Partial<TRow>>>({})

  const [tableState, setTableState] = useState<TableState>({
    pagination: {
      page: 1,
      pageSize: features.pagination === false ? 999999 :
        typeof features.pagination === 'object' ? features.pagination.pageSize || 20 : 20,
    },
    sorting: [],
    filters: {},
    search: '',
    selection: new Set<string>(),
    expandedRows: new Set<string>(),
    editingCells: new Map<string, any>(),
  })

  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const handleCellEdit = useCallback(async (rowId: string, columnId: string, value: any) => {
    setEditedRows(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [columnId]: value
      }
    }))

    if (onCellEdit) {
      await onCellEdit(rowId, columnId, value)
    }
  }, [onCellEdit])

  const handleSaveRowEdits = useCallback(async (rowId: string) => {
    const changes = editedRows[rowId]
    if (!changes) return

    if (onSaveRow) {
      await onSaveRow(rowId, changes)
    }

    setEditedRows(prev => {
      const newEdited = { ...prev }
      delete newEdited[rowId]
      return newEdited
    })
  }, [editedRows, onSaveRow])

  const handleCancelRowEdits = useCallback((rowId: string) => {
    if (onCancelRow) {
      onCancelRow(rowId)
    }

    setEditedRows(prev => {
      const newEdited = { ...prev }
      delete newEdited[rowId]
      return newEdited
    })
  }, [onCancelRow])

  const handleSaveAllEdits = useCallback(async () => {
    if (onSaveAll) {
      await onSaveAll(editedRows)
    }
    setEditedRows({})
  }, [editedRows, onSaveAll])

  const handleCancelAllEdits = useCallback(() => {
    if (onCancelAll) {
      onCancelAll()
    }
    setEditedRows({})
  }, [onCancelAll])

  const baseColumns = useMemo(() => {
    return schemaProvider.getColumns()
  }, [schemaProvider])

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
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to fetch data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [dataSource, tableState])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    plugins.forEach(plugin => {
      plugin.onInit?.({
        data,
        state: tableState,
        columns,
        getRowId,
      })
    })
  }, [])

  useEffect(() => {
    plugins.forEach(plugin => {
      plugin.onDataChange?.(data)
    })
  }, [data, plugins])

  const tanstackColumns = useMemo(() => {
    const cols = []

    if (features.rowSelection) {
      const multiple = typeof features.rowSelection === 'object'
        ? features.rowSelection.multiple !== false
        : true

      cols.push({
        id: 'select',
        header: ({ table }: any) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onChange={(checked) => {
              table.toggleAllPageRowsSelected(checked)
            }}
          />
        ),
        cell: ({ row }: any) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(checked) => {
              row.toggleSelected(checked)
            }}
          />
        ),
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      })
    }

    baseColumns.forEach(col => {
      const isEditable = editableColumns.includes(String(col.key))

      cols.push({
        id: String(col.key),
        accessorKey: String(col.key),
        header: col.header,
        cell: (context: any) => {
          const value = context.getValue()
          const row = context.row.original
          const rowId = getRowId(row)
          const editedValue = editedRows[rowId]?.[col.key as keyof TRow]
          const displayValue = editedValue !== undefined ? editedValue : value

          if (isEditable && features.inlineEditing) {
            const fieldType = col.type
            let editType: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'datetime' | 'checkbox' = 'text'

            if (fieldType === 'boolean') {
              editType = 'checkbox'
            } else if (fieldType === 'select') {
              editType = 'select'
            } else if (fieldType === 'multi-select') {
              editType = 'multiselect'
            } else if (fieldType === 'number' || fieldType === 'currency') {
              editType = 'number'
            } else if (fieldType === 'date') {
              editType = 'date'
            } else if (fieldType === 'datetime') {
              editType = 'datetime'
            }

            return (
              <EditableCell
                value={displayValue}
                onSave={(newValue) => handleCellEdit(rowId, String(col.key), newValue)}
                type={editType}
                options={col.options}
              />
            )
          }

          if (col.cell) {
            return col.cell({
              value: displayValue,
              row,
              column: col,
              rowIndex: context.row.index,
            })
          }

          if (col.format) return col.format(displayValue)
          if (displayValue === null || displayValue === undefined) return '-'
          return String(displayValue)
        },
        enableSorting: col.sortable !== false && features.sorting !== false,
        enableColumnFilter: col.filterable !== false && features.filtering !== false,
        size: typeof col.width === 'number' ? col.width : undefined,
        minSize: col.minWidth,
        maxSize: col.maxWidth,
      })
    })

    return cols
  }, [baseColumns, features])

  const rowSelectionState = useMemo(() => {
    const state: Record<string, boolean> = {}
    tableState.selection.forEach((id) => {
      const index = data.findIndex(row => getRowId(row) === id)
      if (index !== -1) {
        state[index] = true
      }
    })
    return state
  }, [tableState.selection, data, getRowId])

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    getRowId: (row, index) => getRowId(row),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: features.filtering !== false ? getFilteredRowModel() : undefined,
    getSortedRowModel: features.sorting !== false ? getSortedRowModel() : undefined,
    getPaginationRowModel: features.pagination !== false ? getPaginationRowModel() : undefined,
    enableRowSelection: features.rowSelection !== false,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: tableState.pagination.page - 1,
        pageSize: tableState.pagination.pageSize,
      },
      sorting: tableState.sorting.map(s => ({
        id: s.field,
        desc: s.direction === 'desc',
      })),
      rowSelection: rowSelectionState,
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
      const currentSelection = rowSelectionState
      const newSelection = typeof updater === 'function'
        ? updater(currentSelection)
        : updater

      const selectedIds = new Set<string>()
      Object.keys(newSelection).forEach((indexStr) => {
        const index = parseInt(indexStr, 10)
        if (newSelection[indexStr] && data[index]) {
          selectedIds.add(getRowId(data[index]))
        }
      })

      setTableState(prev => ({
        ...prev,
        selection: selectedIds,
      }))
    },
  })

  const handleSearch = useCallback((value: string) => {
    setTableState(prev => ({
      ...prev,
      search: value,
      pagination: { ...prev.pagination, page: 1 },
    }))
  }, [])

  const renderEmptyState = () => {
    if (emptyState) return emptyState

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">No data found</p>
      </div>
    )
  }

  const rows = table.getRowModel().rows

  const startIndex = (tableState.pagination.page - 1) * tableState.pagination.pageSize
  const endIndex = Math.min(startIndex + tableState.pagination.pageSize, total)
  const hasEdits = Object.keys(editedRows).length > 0

  return (
    <div className={`overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl ${className}`}>
      {(features.globalSearch !== false || bulkActions.length > 0 || hasEdits) && (
        <TableToolbar
          table={table}
          searchValue={tableState.search}
          onSearchChange={handleSearch}
          searchPlaceholder={searchPlaceholder}
          bulkActions={bulkActions}
          showSearch={features.globalSearch !== false && !hasEdits}
          showExport={features.export !== false && !hasEdits}
          showColumnVisibility={features.columnVisibility !== false && !hasEdits}
          exportFileName={exportFileName}
          filterOptions={[]}
          showBulkSave={hasEdits}
          onSaveAll={handleSaveAllEdits}
          onCancelAll={handleCancelAllEdits}
          bulkSaveLabel={`Save Changes (${Object.keys(editedRows).length})`}
        />
      )}

      {plugins.map(plugin => (
        <div key={plugin.name}>{plugin.renderToolbar?.()}</div>
      ))}

      <div className="max-w-full overflow-auto custom-scrollbar relative">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            Error loading data: {error.message}
          </div>
        )}

        <Table>
          <TableHeader className="border-t border-gray-100 dark:border-white/[0.05] sticky top-0 z-10 bg-white dark:bg-white/[0.03]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`flex items-center gap-1 ${
                              header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </p>
                            {header.column.getCanSort() && (
                              <div className="flex flex-col">
                                <AngleUpIcon
                                  className={`w-3 h-3 ${
                                    header.column.getIsSorted() === 'asc'
                                      ? 'text-brand-500 dark:text-brand-500'
                                      : 'text-gray-300 dark:text-gray-700'
                                  }`}
                                />
                                <AngleDownIcon
                                  className={`w-3 h-3 -mt-1 ${
                                    header.column.getIsSorted() === 'desc'
                                      ? 'text-brand-500 dark:text-brand-500'
                                      : 'text-gray-300 dark:text-gray-700'
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={tableState.pagination.pageSize} columns={table.getVisibleLeafColumns().length} />
            ) : rows.length ? (
              rows.map((row) => {
                const rowId = getRowId(row.original)
                const hasChanges = !!editedRows[rowId]
                const rowClass = hasChanges
                  ? 'bg-yellow-50 dark:bg-yellow-900/10'
                  : ''

                return (
                  <TableRow
                    key={row.id}
                    data-state={tableState.selection.has(rowId) && 'selected'}
                    onClick={() => onRowClick?.(row.original)}
                    className={`${onRowClick ? 'cursor-pointer' : ''} ${rowClass}`.trim()}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isActionsColumn = cell.column.id === 'actions'

                      return (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] text-theme-sm"
                          style={{
                            width: cell.column.getSize(),
                          }}
                        >
                          {isActionsColumn && hasChanges ? (
                            <div className="flex items-center gap-2">
                              <button
                                className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSaveRowEdits(rowId)
                                }}
                                title="Save changes"
                              >
                                <CheckLineIcon className="w-5 h-5" />
                              </button>
                              <button
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancelRowEdits(rowId)
                                }}
                                title="Cancel changes"
                              >
                                <CloseIcon className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
                >
                  {renderEmptyState()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {features.pagination !== false && (
        <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
            <div className="pb-3 xl:pb-0">
              <p className="pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left">
                Showing {total > 0 ? startIndex + 1 : 0} to {endIndex} of {total} entries
              </p>
            </div>
            <TablePagination
              table={table}
              showRowsPerPage={true}
              pageSizeOptions={
                typeof features.pagination === 'object' && features.pagination.pageSizeOptions
                  ? features.pagination.pageSizeOptions
                  : [10, 20, 50, 100]
              }
            />
          </div>
        </div>
      )}

      {plugins.map(plugin => (
        <div key={`${plugin.name}-footer`}>{plugin.renderFooter?.()}</div>
      ))}
    </div>
  )
}
