'use client'

import { Table } from '@tanstack/react-table'
import Button from '@/components/shared/ui/button/Button'
import type { BulkAction } from '../types'
import { exportToCSV, exportToJSON } from '../utils'
import { ColumnVisibilityDropdown } from './ColumnVisibilityDropdown'
import { AdvancedSearch } from './AdvancedSearch'

interface TableToolbarProps<TData> {
  table: Table<TData>
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  bulkActions?: BulkAction<TData>[]
  showSearch?: boolean
  showExport?: boolean
  showColumnVisibility?: boolean
  exportFileName?: string
  onExport?: (data: TData[]) => void
  showBulkSave?: boolean
  onSaveAll?: () => void
  onCancelAll?: () => void
  bulkSaveLabel?: string
  filterOptions?: {
    columnId: string
    label: string
    type: 'text' | 'select' | 'range'
    options?: { label: string; value: string }[]
  }[]
}

export function TableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  bulkActions = [],
  showSearch = true,
  showExport = true,
  showColumnVisibility = true,
  exportFileName = 'export',
  onExport,
  showBulkSave = false,
  onSaveAll,
  onCancelAll,
  bulkSaveLabel,
  filterOptions = [],
}: TableToolbarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0

  const handleExport = (format: 'csv' | 'json') => {
    const data = table.getFilteredRowModel().rows.map(row => row.original)

    if (onExport) {
      onExport(data)
      return
    }

    if (format === 'csv') {
      exportToCSV(data as any, `${exportFileName}.csv`)
    } else {
      exportToJSON(data, `${exportFileName}.json`)
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
      {showSearch && (
        <AdvancedSearch
          table={table}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filterOptions={filterOptions}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {showBulkSave ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={onSaveAll}
              startIcon={
                <svg
                  className="fill-current"
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z"
                    fill="currentColor"
                  />
                </svg>
              }
            >
              {bulkSaveLabel || 'Save All Changes'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelAll}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            {hasSelection && bulkActions.length > 0 && (
              <>
                {bulkActions.map((action, index) => {
                  const selectedData = selectedRows.map(row => row.original)
                  const isDisabled = action.disabled?.(selectedData) ?? false

                  return (
                    <Button
                      key={index}
                      variant={action.variant === 'danger' ? 'outline' : action.variant || 'outline'}
                      size="sm"
                      onClick={() => action.onClick(selectedData)}
                      disabled={isDisabled}
                      startIcon={action.icon}
                    >
                      {action.label} ({selectedRows.length})
                    </Button>
                  )
                })}
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
              </>
            )}

            {showExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                startIcon={
                  <svg
                    className="fill-current"
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.0018 14.083C9.7866 14.083 9.59255 13.9924 9.45578 13.8472L5.61586 10.0097C5.32288 9.71688 5.32272 9.242 5.61552 8.94902C5.90832 8.65603 6.3832 8.65588 6.67618 8.94868L9.25182 11.5227L9.25182 3.33301C9.25182 2.91879 9.5876 2.58301 10.0018 2.58301C10.416 2.58301 10.7518 2.91879 10.7518 3.33301L10.7518 11.5193L13.3242 8.94866C13.6172 8.65587 14.0921 8.65604 14.3849 8.94903C14.6777 9.24203 14.6775 9.7169 14.3845 10.0097L10.5761 13.8154C10.4385 13.979 10.2323 14.083 10.0018 14.083ZM4.0835 13.333C4.0835 12.9188 3.74771 12.583 3.3335 12.583C2.91928 12.583 2.5835 12.9188 2.5835 13.333V15.1663C2.5835 16.409 3.59086 17.4163 4.8335 17.4163H15.1676C16.4102 17.4163 17.4176 16.409 17.4176 15.1663V13.333C17.4176 12.9188 17.0818 12.583 16.6676 12.583C16.2533 12.583 15.9176 12.9188 15.9176 13.333V15.1663C15.9176 15.5806 15.5818 15.9163 15.1676 15.9163H4.8335C4.41928 15.9163 4.0835 15.5806 4.0835 15.1663V13.333Z"
                      fill="currentColor"
                    />
                  </svg>
                }
              >
                Export CSV
              </Button>
            )}

            {showColumnVisibility && <ColumnVisibilityDropdown table={table} />}
          </>
        )}
      </div>
    </div>
  )
}
