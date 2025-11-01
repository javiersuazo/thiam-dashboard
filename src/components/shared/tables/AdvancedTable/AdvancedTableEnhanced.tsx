'use client'

import { useMemo, useState, useEffect, useRef, Fragment } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
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
import { EditableCell } from './components/EditableCell'
import { ColumnFilter } from './components/ColumnFilter'
import { TableSkeleton } from './components/TableSkeleton'
import type { AdvancedTableProps } from './types'
import { AngleDownIcon, AngleUpIcon } from '@/icons'
import { debounce } from './utils'

export function AdvancedTableEnhanced<TData, TValue = unknown>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enableGlobalFilter = true,
  enablePagination = true,
  enableColumnVisibility = true,
  enableColumnResizing = false,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  enableVirtualization = false,
  enableExpanding = false,
  serverSide,
  bulkActions = [],
  searchPlaceholder = 'Search...',
  emptyState,
  loadingState,
  onRowClick,
  className = '',
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  showSearch = true,
  showPagination = true,
  showColumnVisibility = true,
  showExport = true,
  showRowsPerPage = true,
  exportFileName = 'export',
  onExport,
  onStateChange,
  initialState,
  getSubRows,
  renderSubComponent,
  onCellEdit,
  editableColumns = [],
  virtualizerOptions = {},
  getRowClassName,
  showBulkSave = false,
  onSaveAll,
  onCancelAll,
  bulkSaveLabel,
  filterOptions = [],
  controlledPagination,
  controlledSorting,
  controlledFilters,
  controlledSearch,
}: AdvancedTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState(initialState?.sorting ?? [])
  const [internalColumnFilters, setInternalColumnFilters] = useState(initialState?.columnFilters ?? [])
  const [columnVisibility, setColumnVisibility] = useState(initialState?.columnVisibility ?? {})
  const [rowSelection, setRowSelection] = useState(initialState?.rowSelection ?? {})
  const [internalGlobalFilter, setInternalGlobalFilter] = useState(initialState?.globalFilter ?? '')
  const [searchInput, setSearchInput] = useState('')
  const [expanded, setExpanded] = useState({})
  const [columnOrder, setColumnOrder] = useState<string[]>(initialState?.columnOrder ?? [])

  const [sorting, setSorting] = controlledSorting || [internalSorting, setInternalSorting]
  const [columnFilters, setColumnFilters] = controlledFilters || [internalColumnFilters, setInternalColumnFilters]
  const [globalFilter, setGlobalFilter] = controlledSearch || [internalGlobalFilter, setInternalGlobalFilter]

  console.log('🔄 AdvancedTableEnhanced - State:', {
    isControlled: {
      pagination: !!controlledPagination,
      sorting: !!controlledSorting,
      filters: !!controlledFilters,
      search: !!controlledSearch,
    },
    currentState: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: controlledPagination?.[0],
    },
  })

  const tableContainerRef = useRef<HTMLDivElement>(null)

  const debouncedSetGlobalFilter = useMemo(
    () => debounce((value: string) => setGlobalFilter(value), 300),
    []
  )

  useEffect(() => {
    debouncedSetGlobalFilter(searchInput)
  }, [searchInput, debouncedSetGlobalFilter])

  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
        pagination: {
          pageIndex: table.getState().pagination.pageIndex,
          pageSize: table.getState().pagination.pageSize,
        },
        globalFilter,
      })
    }
  }, [sorting, columnFilters, columnVisibility, rowSelection, globalFilter])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      expanded,
      columnOrder,
      pagination: controlledPagination?.[0] || { pageIndex: 0, pageSize: defaultPageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: controlledPagination?.[1],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination && !enableVirtualization ? getPaginationRowModel() : undefined,
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
    enableRowSelection,
    enableMultiRowSelection,
    enableSorting,
    enableColumnResizing,
    enableExpanding,
    getSubRows,
    manualPagination: serverSide?.enabled,
    manualSorting: serverSide?.enabled,
    manualFiltering: serverSide?.enabled,
    pageCount: serverSide?.totalPages,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: defaultPageSize,
      },
    },
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => virtualizerOptions.estimateSize ?? 50,
    overscan: virtualizerOptions.overscan ?? 10,
    enabled: enableVirtualization,
  })

  const isLoading = serverSide?.isLoading ?? false
  const isFetching = serverSide?.isFetching ?? false

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

  const renderLoadingState = () => {
    if (loadingState) return loadingState

    return <TableSkeleton rows={defaultPageSize} columns={table.getVisibleLeafColumns().length} />
  }

  const handleCellEdit = async (rowId: string, columnId: string, value: any) => {
    if (onCellEdit) {
      await onCellEdit(rowId, columnId, value)
    }
  }

  const virtualItems = enableVirtualization ? rowVirtualizer.getVirtualItems() : null
  const totalSize = enableVirtualization ? rowVirtualizer.getTotalSize() : 0
  const paddingTop = virtualItems && virtualItems.length > 0 ? virtualItems[0]?.start ?? 0 : 0
  const paddingBottom =
    virtualItems && virtualItems.length > 0
      ? totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0)
      : 0

  return (
    <div className={`overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl ${className}`}>
      {(showSearch || bulkActions.length > 0 || showExport || showColumnVisibility || showBulkSave) && (
        <TableToolbar
          table={table}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder={searchPlaceholder}
          bulkActions={bulkActions}
          showSearch={showSearch}
          showExport={showExport && !showBulkSave}
          showColumnVisibility={showColumnVisibility && !showBulkSave}
          exportFileName={exportFileName}
          onExport={onExport}
          showBulkSave={showBulkSave}
          onSaveAll={onSaveAll}
          onCancelAll={onCancelAll}
          bulkSaveLabel={bulkSaveLabel}
          filterOptions={filterOptions}
        />
      )}

      <div
        ref={tableContainerRef}
        className={`max-w-full overflow-auto custom-scrollbar relative ${
          enableVirtualization ? 'max-h-[600px]' : ''
        }`}
      >
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-500/20 z-20">
            <div className="h-full bg-brand-500 animate-[loading_1s_ease-in-out_infinite]" />
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
                          <ColumnFilter
                            column={header.column}
                            type={(header.column.columnDef.meta as any)?.filterType}
                            options={(header.column.columnDef.meta as any)?.filterOptions}
                          />
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
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
                >
                  {renderLoadingState()}
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              <>
                {enableVirtualization && paddingTop > 0 && (
                  <tr>
                    <td style={{ height: `${paddingTop}px` }} />
                  </tr>
                )}
                {(enableVirtualization ? virtualItems! : rows).map((virtualRowOrRow) => {
                  const row = enableVirtualization
                    ? rows[(virtualRowOrRow as any).index]
                    : virtualRowOrRow

                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && 'selected'}
                        onClick={() => onRowClick?.(row.original)}
                        className={`${onRowClick ? 'cursor-pointer' : ''} ${getRowClassName ? getRowClassName(row) : ''}`}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isEditable = editableColumns.includes(cell.column.id)

                          return (
                            <TableCell
                              key={cell.id}
                              className={`px-4 py-3 border border-gray-100 dark:border-white/[0.05] text-theme-sm ${
                                isEditable ? 'relative' : ''
                              }`}
                              style={{
                                width: cell.column.getSize(),
                              }}
                            >
                              {isEditable && onCellEdit ? (
                                <EditableCell
                                  value={cell.getValue()}
                                  onSave={(value) => handleCellEdit(row.id, cell.column.id, value)}
                                  type={
                                    (cell.column.columnDef.meta as any)?.editType ??
                                    (typeof cell.getValue() === 'number' ? 'number' : 'text')
                                  }
                                  options={(cell.column.columnDef.meta as any)?.editOptions}
                                />
                              ) : (
                                <>
                                  {enableExpanding && cell.column.id === 'expander' ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        row.getToggleExpandedHandler()()
                                      }}
                                      className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                                    >
                                      {row.getIsExpanded() ? '▼' : '▶'}
                                    </button>
                                  ) : (
                                    flexRender(cell.column.columnDef.cell, cell.getContext())
                                  )}
                                </>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                      {row.getIsExpanded() && renderSubComponent && (
                        <TableRow>
                          <TableCell
                            colSpan={row.getVisibleCells().length}
                            className="px-0 py-0 border border-gray-100 dark:border-white/[0.05]"
                          >
                            {renderSubComponent({ row })}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
                {enableVirtualization && paddingBottom > 0 && (
                  <tr>
                    <td style={{ height: `${paddingBottom}px` }} />
                  </tr>
                )}
              </>
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

      {showPagination && enablePagination && !enableVirtualization && (
        <TablePagination
          table={table}
          showRowsPerPage={showRowsPerPage}
          pageSizeOptions={pageSizeOptions}
        />
      )}

      {enableVirtualization && (
        <div className="border-t border-gray-100 dark:border-white/[0.05] px-4 py-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {rows.length} items (Virtual Scrolling Enabled)
          </p>
        </div>
      )}
    </div>
  )
}
