'use client'

import { useState, useRef, useEffect } from 'react'
import { Column } from '@tanstack/react-table'
import { CloseIcon } from '@/icons'

interface ColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>
  type?: 'text' | 'select' | 'range' | 'date'
  options?: { label: string; value: string }[]
}

export function ColumnFilter<TData, TValue>({
  column,
  type = 'text',
  options = [],
}: ColumnFilterProps<TData, TValue>) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterValue, setFilterValue] = useState<any>(column.getFilterValue() || '')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleApply = () => {
    column.setFilterValue(filterValue || undefined)
    setIsOpen(false)
  }

  const handleClear = () => {
    setFilterValue('')
    column.setFilterValue(undefined)
    setIsOpen(false)
  }

  const isFiltered = column.getIsFiltered()

  if (!column.getCanFilter()) {
    return null
  }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`ml-1 p-0.5 rounded transition-colors ${
          isFiltered
            ? 'text-brand-600 dark:text-brand-400'
            : 'text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400'
        }`}
        title="Filter"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="fill-current"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5ZM5 10C5 9.44772 5.44772 9 6 9H14C14.5523 9 15 9.44772 15 10C15 10.5523 14.5523 11 14 11H6C5.44772 11 5 10.5523 5 10ZM8 14C7.44772 14 7 14.4477 7 15C7 15.5523 7.44772 16 8 16H12C12.5523 16 13 15.5523 13 15C13 14.4477 12.5523 14 12 14H8Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-theme-lg z-50 min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3">
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by {column.id}
              </label>

              {type === 'text' && (
                <input
                  type="text"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApply()
                    if (e.key === 'Escape') setIsOpen(false)
                  }}
                  placeholder="Enter value..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  autoFocus
                />
              )}

              {type === 'select' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  autoFocus
                >
                  <option value="">All</option>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {type === 'range' && (
                <div className="space-y-2">
                  <input
                    type="number"
                    value={filterValue?.min || ''}
                    onChange={(e) =>
                      setFilterValue({
                        ...filterValue,
                        min: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Min"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <input
                    type="number"
                    value={filterValue?.max || ''}
                    onChange={(e) =>
                      setFilterValue({
                        ...filterValue,
                        max: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Max"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleClear}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
