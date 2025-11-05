'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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

  const getInitialValue = useCallback(() => {
    if (value !== undefined && value !== null && value !== '') return value

    if (column.type === 'number' || column.type === 'currency') {
      return { min: '', max: '' }
    }
    if (column.type === 'date' || column.type === 'datetime') {
      return { from: '', to: '' }
    }
    if (column.type === 'multi-select') {
      return []
    }
    return ''
  }, [value, column.type])

  const [localValue, setLocalValue] = useState(getInitialValue)
  const [position, setPosition] = useState<{ right?: boolean; left?: boolean }>({})

  useEffect(() => {
    const newValue = getInitialValue()
    console.log('🔄 FilterPopover useEffect:', { value, newValue, columnType: column.type })
    setLocalValue(newValue)
  }, [getInitialValue])

  useEffect(() => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      // Check if popover overflows right edge
      const overflowsRight = rect.right > viewportWidth - 20
      // Check if there's enough space on the left
      const spaceOnLeft = rect.left > 280

      setPosition({
        right: overflowsRight && spaceOnLeft,
        left: !overflowsRight || !spaceOnLeft,
      })
    }
  }, [])

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
    let valueToApply = localValue

    if (column.type === 'number' || column.type === 'currency') {
      const min = localValue?.min !== '' ? Number(localValue.min) : undefined
      const max = localValue?.max !== '' ? Number(localValue.max) : undefined

      if (min === undefined && max === undefined) {
        valueToApply = undefined
      } else {
        valueToApply = { min, max }
      }
    } else if (column.type === 'date' || column.type === 'datetime') {
      const from = localValue?.from !== '' ? localValue.from : undefined
      const to = localValue?.to !== '' ? localValue.to : undefined

      if (from === undefined && to === undefined) {
        valueToApply = undefined
      } else {
        valueToApply = { from, to }
      }
    } else if (column.type === 'multi-select') {
      if (Array.isArray(localValue) && localValue.length === 0) {
        valueToApply = undefined
      }
    } else {
      if (localValue === '' || localValue === null) {
        valueToApply = undefined
      }
    }

    onFilterChange(valueToApply)
    onClose()
  }

  const handleClear = () => {
    let clearValue: any = ''

    if (column.type === 'number' || column.type === 'currency') {
      clearValue = { min: '', max: '' }
    } else if (column.type === 'date' || column.type === 'datetime') {
      clearValue = { from: '', to: '' }
    } else if (column.type === 'multi-select') {
      clearValue = []
    }

    setLocalValue(clearValue)
    onFilterChange(undefined)
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
            <div className="max-h-40 md:max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {column.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
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
      className={`absolute top-full mt-1 z-50 w-64 md:min-w-[280px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl p-3 md:p-4 ${
        position.right ? 'right-0' : 'left-0'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {renderFilterInput()}

      <div className="flex gap-2 mt-3 md:mt-4 pt-2 md:pt-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleClear}
          className="flex-1 px-2 py-2 md:px-3 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[40px] md:min-h-[44px]"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-2 py-2 md:px-3 text-xs md:text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 min-h-[40px] md:min-h-[44px]"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
