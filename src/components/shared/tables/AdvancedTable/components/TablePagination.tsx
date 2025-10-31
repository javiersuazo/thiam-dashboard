'use client'

import { Table } from '@tanstack/react-table'

interface TablePaginationProps<TData> {
  table: Table<TData>
  showRowsPerPage?: boolean
  pageSizeOptions?: number[]
}

export function TablePagination<TData>({
  table,
  showRowsPerPage = true,
  pageSizeOptions = [5, 10, 20, 50],
}: TablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalPages = table.getPageCount()
  const canPreviousPage = table.getCanPreviousPage()
  const canNextPage = table.getCanNextPage()

  const startIndex = pageIndex * pageSize
  const endIndex = Math.min(startIndex + pageSize, table.getFilteredRowModel().rows.length)
  const totalItems = table.getFilteredRowModel().rows.length

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(0)

      let startPage = Math.max(1, pageIndex - 1)
      let endPage = Math.min(totalPages - 2, pageIndex + 1)

      if (pageIndex <= 2) {
        endPage = 3
      }
      if (pageIndex >= totalPages - 3) {
        startPage = totalPages - 4
      }

      if (startPage > 1) {
        pages.push('...')
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages - 1)
    }

    return pages
  }

  return (
    <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex items-center gap-3">
          {showRowsPerPage && (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
              <div className="relative z-20 bg-transparent">
                <select
                  className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value))
                  }}
                >
                  {pageSizeOptions.map((size) => (
                    <option
                      key={size}
                      value={size}
                      className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                    >
                      {size}
                    </option>
                  ))}
                </select>
                <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                  <svg
                    className="stroke-current"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                      stroke=""
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
            </>
          )}
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1} to {endIndex} of {totalItems} entries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.firstPage()}
            disabled={!canPreviousPage}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg
              className="stroke-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.8332 12.5L6.33317 8L10.8332 3.5"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.16683 12.5L5.16683 3.5"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button
            onClick={() => table.previousPage()}
            disabled={!canPreviousPage}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg
              className="stroke-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.8332 12.5L6.33317 8L10.8332 3.5"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center w-9 h-9 text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === pageIndex

            return (
              <button
                key={pageNumber}
                onClick={() => table.setPageIndex(pageNumber)}
                className={`flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                {pageNumber + 1}
              </button>
            )
          })}

          <button
            onClick={() => table.nextPage()}
            disabled={!canNextPage}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg
              className="stroke-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.1665 3.5L9.6665 8L5.1665 12.5"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            onClick={() => table.lastPage()}
            disabled={!canNextPage}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg
              className="stroke-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.1665 3.5L9.6665 8L5.1665 12.5"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.8332 3.5L10.8332 12.5"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
