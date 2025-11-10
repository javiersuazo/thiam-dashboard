'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { flexRender } from '@tanstack/react-table'
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
import { TableHeaderCell } from './components/TableHeaderCell'
import { TableDataCell } from './components/TableDataCell'
import { useTableData } from './hooks/useTableData'
import { useTableEditing } from './hooks/useTableEditing'
import { useTableSelection } from './hooks/useTableSelection'
import { useTableColumns } from './hooks/useTableColumns'
import { useTableConfiguration } from './hooks/useTableConfiguration'
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
  })

  const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null)

  const { data, total, totalPages, isLoading, error } = useTableData(dataSource, tableState)

  const {
    editedRows,
    hasEdits,
    handleCellEdit,
    handleSaveRowEdits,
    handleCancelRowEdits,
    handleSaveAllEdits,
    handleCancelAllEdits,
  } = useTableEditing<TRow>({
    onCellEdit,
    onSaveRow,
    onCancelRow,
    onSaveAll,
    onCancelAll,
  })

  const { rowSelectionState, handleRowSelectionChange } = useTableSelection(tableState, data, getRowId)

  const baseColumns = useMemo(() => {
    return schemaProvider.getColumns()
  }, [schemaProvider])

  const tanstackColumns = useTableColumns({
    baseColumns,
    features,
    editableColumns,
    getRowId,
  })

  useEffect(() => {
    plugins.forEach(plugin => {
      plugin.onInit?.({
        data,
        state: tableState,
        columns: baseColumns,
        getRowId,
      })
    })
  }, [])

  useEffect(() => {
    plugins.forEach(plugin => {
      plugin.onDataChange?.(data)
    })
  }, [data, plugins])

  const table = useTableConfiguration({
    data,
    columns: tanstackColumns,
    features,
    totalPages,
    tableState,
    setTableState,
    rowSelectionState,
    handleRowSelectionChange,
    editedRows,
    handleCellEdit,
    getRowId,
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

        <Table style={{ width: table.getTotalSize() }}>
          <TableHeader className="border-t border-gray-100 dark:border-white/[0.05] sticky top-0 z-10 bg-white dark:bg-white/[0.03]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeaderCell
                    key={header.id}
                    header={header}
                    features={features}
                    baseColumns={baseColumns}
                    tableState={tableState}
                    setTableState={setTableState}
                    openFilterColumn={openFilterColumn}
                    setOpenFilterColumn={setOpenFilterColumn}
                  />
                ))}
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
                const editClass = hasChanges
                  ? 'bg-yellow-50 dark:bg-yellow-900/10'
                  : ''
                const customClass = getRowClassName?.(row.original) || ''

                return (
                  <TableRow
                    key={row.id}
                    data-state={tableState.selection.has(rowId) && 'selected'}
                    onClick={() => onRowClick?.(row.original)}
                    className={`${onRowClick ? 'cursor-pointer' : ''} ${editClass} ${customClass}`.trim()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableDataCell
                        key={cell.id}
                        cell={cell}
                        hasChanges={hasChanges}
                        rowId={rowId}
                        handleSaveRowEdits={handleSaveRowEdits}
                        handleCancelRowEdits={handleCancelRowEdits}
                      />
                    ))}
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
