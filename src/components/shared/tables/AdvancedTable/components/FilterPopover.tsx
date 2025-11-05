'use client'

import { useState, useRef, useEffect } from 'react'
import type { ColumnDefinition, FieldType } from '../core/interfaces'
import Input from '@/components/shared/form/input/InputField'
import Select from '@/components/shared/form/Select'
import Checkbox from '@/components/shared/form/input/Checkbox'

interface FilterPopoverProps {
  column: ColumnDefinition
  value: any
  onFilterChange: (value: any) => void
  onClose: () => void
}

export function FilterPopover({ column, value, onFilterChange, onClose }: FilterPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [localValue, setLocalValue] = useState(value ?? '')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleApply = () => {
    onFilterChange(localValue)
    onClose()
  }

  const handleClear = () => {
    setLocalValue('')
    onFilterChange('')
    onClose()
  }

  const renderFilterInput = () => {
    const fieldType = column.type

    switch (fieldType) {
      case 'select':
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-400">
              Filter by {column.header}
            </label>
            <Select
              options={column.options || []}
              value={localValue}
              onChange={(val) => setLocalValue(val)}
              placeholder="Select value..."
            />
          </div>
        )

      case 'multi-select':
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-400">
              Filter by {column.header}
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {column.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <Checkbox
                    checked={Array.isArray(localValue) && localValue.includes(option.value)}
                    onChange={(checked) => {
                      const currentValues = Array.isArray(localValue) ? localValue : []
                      if (checked) {
                        setLocalValue([...currentValues, option.value])
                      } else {
                        setLocalValue(currentValues.filter(v => v !== option.value))
                      }
                    }}
                  />
                  <span className="text-sm text-gray-900 dark:text-white/90">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'boolean':
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-400">
              Filter by {column.header}
            </label>
            <Select
              options={[
                { label: 'All', value: '' },
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
              ]}
              value={localValue}
              onChange={(val) => setLocalValue(val)}
            />
          </div>
        )

      case 'number':
      case 'currency':
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-400">
              Filter by {column.header}
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={localValue?.min ?? ''}
                onChange={(e) => setLocalValue({ ...localValue, min: e.target.value })}
                placeholder="Min"
              />
              <Input
                type="number"
                value={localValue?.max ?? ''}
                onChange={(e) => setLocalValue({ ...localValue, max: e.target.value })}
                placeholder="Max"
              />
            </div>
          </div>
        )

      case 'date':
      case 'datetime':
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-400">
              Filter by {column.header}
            </label>
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                value={localValue?.from ?? ''}
                onChange={(e) => setLocalValue({ ...localValue, from: e.target.value })}
                placeholder="From"
              />
              <Input
                type="date"
                value={localValue?.to ?? ''}
                onChange={(e) => setLocalValue({ ...localValue, to: e.target.value })}
                placeholder="To"
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-400">
              Filter by {column.header}
            </label>
            <Input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              placeholder={`Search ${column.header}...`}
              className="min-h-[44px]"
            />
          </div>
        )
    }
  }

  return (
    <div
      ref={popoverRef}
      className="absolute top-full left-0 mt-1 z-50 min-w-[280px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl p-4"
      onClick={(e) => e.stopPropagation()}
    >
      {renderFilterInput()}

      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleClear}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 min-h-[44px]"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
