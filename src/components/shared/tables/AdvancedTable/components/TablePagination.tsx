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

  return (
    <div className="border border-t-0 rounded-b-xl border-gray-100 dark:border-white/[0.05]">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {showRowsPerPage && (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
              <select
                className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 pr-8 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                value={pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size} className="dark:bg-gray-900">
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
            </>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="text-gray-800 dark:text-white/90">{startIndex + 1}</span> to{' '}
            <span className="text-gray-800 dark:text-white/90">{endIndex}</span> of{' '}
            <span className="text-gray-800 dark:text-white/90">{totalItems}</span>
          </span>
        </div>

        <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-gray-50 p-4 sm:w-auto sm:justify-normal sm:rounded-none sm:bg-transparent sm:p-0 dark:bg-gray-900 dark:sm:bg-transparent">
          <button
            onClick={() => table.previousPage()}
            disabled={!canPreviousPage}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.58203 9.99868C2.58174 10.1909 2.6549 10.3833 2.80152 10.53L7.79818 15.5301C8.09097 15.8231 8.56584 15.8233 8.85883 15.5305C9.15183 15.2377 9.152 14.7629 8.85921 14.4699L5.13911 10.7472L16.6665 10.7472C17.0807 10.7472 17.4165 10.4114 17.4165 9.99715C17.4165 9.58294 17.0807 9.24715 16.6665 9.24715L5.14456 9.24715L8.85919 5.53016C9.15199 5.23717 9.15184 4.7623 8.85885 4.4695C8.56587 4.1767 8.09099 4.17685 7.79819 4.46984L2.84069 9.43049C2.68224 9.568 2.58203 9.77087 2.58203 9.99715C2.58203 9.99766 2.58203 9.99817 2.58203 9.99868Z"
              />
            </svg>
          </button>

          <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
            Page <span>{pageIndex + 1}</span> of <span>{totalPages}</span>
          </span>

          <ul className="hidden items-center gap-0.5 sm:flex">
            {Array.from({ length: totalPages }, (_, i) => i).map((n) => (
              <li key={n}>
                <button
                  onClick={() => table.setPageIndex(n)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                    pageIndex === n
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-700 hover:bg-brand-500 hover:text-white dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <span>{n + 1}</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => table.nextPage()}
            disabled={!canNextPage}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.4165 9.9986C17.4168 10.1909 17.3437 10.3832 17.197 10.53L12.2004 15.5301C11.9076 15.8231 11.4327 15.8233 11.1397 15.5305C10.8467 15.2377 10.8465 14.7629 11.1393 14.4699L14.8594 10.7472L3.33203 10.7472C2.91782 10.7472 2.58203 10.4114 2.58203 9.99715C2.58203 9.58294 2.91782 9.24715 3.33203 9.24715L14.854 9.24715L11.1393 5.53016C10.8465 5.23717 10.8467 4.7623 11.1397 4.4695C11.4327 4.1767 11.9075 4.17685 12.2003 4.46984L17.1578 9.43049C17.3163 9.568 17.4165 9.77087 17.4165 9.99715C17.4165 9.99763 17.4165 9.99812 17.4165 9.9986Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
