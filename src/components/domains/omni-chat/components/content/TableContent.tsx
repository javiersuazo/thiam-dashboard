'use client'

import type { TableData } from '../../types'

interface TableContentProps {
  table: TableData
}

export function TableContent({ table }: TableContentProps) {
  if (!table.headers || !table.rows || table.rows.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {table.headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {table.headers.map((header, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
                >
                  {String(row[header.toLowerCase().replace(/\s+/g, '')] ?? row[header] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
