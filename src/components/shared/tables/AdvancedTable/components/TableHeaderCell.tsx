import { Dispatch, SetStateAction } from 'react'
import { flexRender, type Header } from '@tanstack/react-table'
import { TableHead } from '../../../ui/table'
import { FilterPopover } from './FilterPopover'
import { AngleDownIcon, AngleUpIcon } from '@/icons'
import type { ColumnDefinition, TableFeatures, TableState } from '../core/interfaces'

interface TableHeaderCellProps<TRow> {
  header: Header<TRow, unknown>
  features: TableFeatures
  baseColumns: ColumnDefinition[]
  tableState: TableState
  setTableState: Dispatch<SetStateAction<TableState>>
  openFilterColumn: string | null
  setOpenFilterColumn: Dispatch<SetStateAction<string | null>>
}

export function TableHeaderCell<TRow>({
  header,
  features,
  baseColumns,
  tableState,
  setTableState,
  openFilterColumn,
  setOpenFilterColumn,
}: TableHeaderCellProps<TRow>) {
  return (
    <TableHead
      className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] relative"
      style={{
        width: header.getSize(),
      }}
    >
      {header.isPlaceholder ? null : (
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between w-full">
            <div
              className={`flex items-center gap-1 ${
                header.column.getCanSort() ? 'cursor-pointer select-none' : ''
              }`}
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </div>
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
              {header.column.getCanFilter() && features.filtering !== false && (
                <div className="relative inline-block ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenFilterColumn(
                        openFilterColumn === header.column.id ? null : header.column.id
                      )
                    }}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors relative"
                    title="Filter column"
                  >
                    {tableState.filters[header.column.id] && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-500 rounded-full"></span>
                    )}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`${
                        tableState.filters[header.column.id]
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <path
                        d="M2 3.5H14L9.5 9V13L6.5 14.5V9L2 3.5Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </button>
                  {openFilterColumn === header.column.id && (() => {
                    const filterValue = tableState.filters[header.column.id]
                    return (
                      <FilterPopover
                        column={
                          baseColumns.find((col) => String(col.key) === header.column.id)!
                        }
                        value={filterValue}
                        onFilterChange={(value) => {
                          setTableState(prev => {
                            const newFilters = { ...prev.filters }

                            if (value === undefined || value === null) {
                              delete newFilters[header.column.id]
                            } else {
                              newFilters[header.column.id] = value
                            }

                            return {
                              pagination: prev.pagination,
                              sorting: prev.sorting,
                              filters: newFilters,
                              search: prev.search,
                              selection: prev.selection,
                            }
                          })
                        }}
                        onClose={() => setOpenFilterColumn(null)}
                      />
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {header.column.getCanResize() && features.columnResize !== false && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={`absolute top-0 right-0 h-full w-[5px] -mr-[2px] cursor-col-resize select-none touch-none group/resizer ${
            header.column.getIsResizing() ? 'bg-brand-500 dark:bg-brand-400' : 'hover:bg-brand-500/50 dark:hover:bg-brand-400/50'
          }`}
        >
          <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-current opacity-0 group-hover/resizer:opacity-100 transition-opacity" />
        </div>
      )}
    </TableHead>
  )
}
