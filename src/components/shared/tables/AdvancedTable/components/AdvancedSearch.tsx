'use client'

import { useState, useRef, useEffect } from 'react'
import { Table, Column } from '@tanstack/react-table'
import { CloseIcon } from '@/icons'

interface Filter {
  id: string
  columnId: string
  label: string
  value: string
  type: 'text' | 'select' | 'range'
}

interface FilterOption {
  columnId: string
  label: string
  type: 'text' | 'select' | 'range'
  options?: { label: string; value: string }[]
  getValues?: () => { label: string; value: string }[]
}

interface AdvancedSearchProps<TData> {
  table: Table<TData>
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
}

export function AdvancedSearch<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterOptions = [],
}: AdvancedSearchProps<TData>) {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addFilter = (option: FilterOption, value?: string) => {
    const filterId = `${option.columnId}-${Date.now()}`
    const newFilter: Filter = {
      id: filterId,
      columnId: option.columnId,
      label: option.label,
      value: value || '',
      type: option.type,
    }

    setActiveFilters([...activeFilters, newFilter])
    setShowFilterMenu(false)

    const column = table.getColumn(option.columnId)
    if (column && value) {
      column.setFilterValue(value)
    }
  }

  const removeFilter = (filterId: string) => {
    const filter = activeFilters.find(f => f.id === filterId)
    if (filter) {
      const column = table.getColumn(filter.columnId)
      column?.setFilterValue(undefined)
    }
    setActiveFilters(activeFilters.filter(f => f.id !== filterId))
  }

  const updateFilter = (filterId: string, value: string) => {
    setActiveFilters(
      activeFilters.map(f =>
        f.id === filterId ? { ...f, value } : f
      )
    )

    const filter = activeFilters.find(f => f.id === filterId)
    if (filter) {
      const column = table.getColumn(filter.columnId)
      column?.setFilterValue(value)
    }
  }

  const clearAllFilters = () => {
    activeFilters.forEach(filter => {
      const column = table.getColumn(filter.columnId)
      column?.setFilterValue(undefined)
    })
    setActiveFilters([])
    onSearchChange('')
  }

  const hasActiveFilters = activeFilters.length > 0 || searchValue.length > 0

  return (
    <div className="flex-1">
      <div className="relative">
        <div
          className={`relative flex items-center gap-2 flex-wrap p-2 pr-10 border rounded-lg transition-colors ${
            isFocused
              ? 'border-brand-300 ring-3 ring-brand-500/10 dark:border-brand-800'
              : 'border-gray-300 dark:border-gray-700'
          } bg-white dark:bg-gray-900`}
        >
          <button className="text-gray-500 dark:text-gray-400 flex-shrink-0">
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
                d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                fill=""
              />
            </svg>
          </button>

          {activeFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 rounded-md"
            >
              <span className="text-gray-500 dark:text-gray-400">{filter.label}:</span>
              {filter.type === 'text' ? (
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, e.target.value)}
                  className="bg-transparent border-none outline-none w-20 text-brand-700 dark:text-brand-300 placeholder:text-brand-400"
                  placeholder="value"
                  autoFocus
                />
              ) : (
                <span>{filter.value}</span>
              )}
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-1 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-200"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>
          ))}

          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={activeFilters.length > 0 ? 'Add text...' : searchPlaceholder}
            className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              title="Add filter"
            >
              <svg
                width="16"
                height="16"
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
          </div>
        </div>

        {showFilterMenu && filterOptions.length > 0 && (
          <div
            ref={menuRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-theme-lg z-50 max-h-64 overflow-y-auto"
          >
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                Add filter
              </p>
              {filterOptions.map((option) => (
                <button
                  key={option.columnId}
                  onClick={() => addFilter(option)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  <span className="text-xs text-gray-400">{option.type}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>
            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied
            {searchValue && ` • searching for "${searchValue}"`}
          </span>
        </div>
      )}
    </div>
  )
}
