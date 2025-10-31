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

  const hasActiveSearch = searchValue.length > 0

  return (
    <div className="flex-1">
      <div className="relative">
        <div
          className={`relative flex items-center gap-2 h-11 px-4 border rounded-lg transition-colors ${
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

          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30"
          />

          {hasActiveSearch && (
            <button
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
              title="Clear search"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
