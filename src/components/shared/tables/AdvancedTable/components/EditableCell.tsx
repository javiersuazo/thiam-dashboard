'use client'

import { useState, useEffect, useRef } from 'react'
import Input from '@/components/shared/form/input/InputField'
import Select from '@/components/shared/form/Select'
import Button from '@/components/shared/ui/button/Button'

interface EditableCellProps {
  value: any
  onSave: (value: any) => void | Promise<void>
  type?: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'datetime' | 'checkbox'
  options?: { label: string; value: any }[]
  className?: string
  multiple?: boolean
}

export function EditableCell({
  value: initialValue,
  onSave,
  type = 'text',
  options = [],
  className = '',
  multiple = false,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>(
    Array.isArray(initialValue) ? initialValue : []
  )

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [editing])

  const handleSave = async (valueToSave?: any) => {
    const finalValue = valueToSave !== undefined ? valueToSave : value

    if (finalValue === initialValue) {
      setEditing(false)
      return
    }

    console.log('💾 EditableCell handleSave:', {
      valueToSave,
      finalValue,
      initialValue,
      valueType: typeof finalValue
    })

    let cleanValue = finalValue
    if (typeof finalValue === 'object' && finalValue !== null && !Array.isArray(finalValue)) {
      if ('target' in finalValue) {
        console.error('❌ Attempted to save React event object:', finalValue)
        cleanValue = finalValue.target?.value || finalValue
      }
    }

    setSaving(true)
    try {
      await onSave(cleanValue)
      setEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
      setValue(initialValue)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setValue(initialValue)
      setEditing(false)
    }
  }

  // Checkbox - no editing mode, toggle directly
  if (type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-center">
        <span className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={!!value}
            disabled={saving}
            onChange={async (e) => {
              const newValue = e.target.checked
              setValue(newValue)
              setSaving(true)
              try {
                await onSave(newValue)
              } catch (error) {
                console.error('Failed to save:', error)
                setValue(initialValue)
              } finally {
                setSaving(false)
              }
            }}
          />
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] transition-colors ${
              value
                ? "border-brand-500 bg-brand-500"
                : "bg-transparent border-gray-300 dark:border-gray-700"
            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className={value ? "" : "opacity-0"}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="white"
                  strokeWidth="1.6666"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </span>
      </label>
    )
  }

  if (editing) {
    // Single Select
    if (type === 'select') {
      return (
        <div onKeyDown={handleKeyDown}>
          <Select
            options={options}
            placeholder="Select an option"
            onChange={(newValue) => {
              setValue(newValue)
              handleSave(newValue)
            }}
            defaultValue={value}
            className={className}
          />
        </div>
      )
    }

    // Multi Select
    if (type === 'multiselect') {
      const handleMultiSave = async () => {
        setSaving(true)
        try {
          await onSave(selectedItems)
          setEditing(false)
        } catch (error) {
          console.error('Failed to save:', error)
          setSelectedItems(Array.isArray(initialValue) ? initialValue : [])
        } finally {
          setSaving(false)
        }
      }

      const toggleItem = (itemValue: any) => {
        const newSelected = selectedItems.includes(itemValue)
          ? selectedItems.filter(v => v !== itemValue)
          : [...selectedItems, itemValue]
        setSelectedItems(newSelected)
      }

      return (
        <div className="absolute top-0 left-0 z-50 min-w-[300px] max-w-[400px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-theme-lg p-3">
          {/* Selected items display - limited height with scroll */}
          {selectedItems.length > 0 && (
            <div className="mb-3 max-h-24 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((itemValue, idx) => {
                  const option = options.find(opt => opt.value === itemValue)
                  return (
                    <div
                      key={idx}
                      className="group flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white/90 rounded-full border border-gray-200 dark:border-gray-700"
                    >
                      <span>{option?.label || itemValue}</span>
                      <button
                        onClick={() => toggleItem(itemValue)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Available options - scrollable list */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-2">
              Select options:
            </p>
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(option.value)}
                    onChange={() => toggleItem(option.value)}
                    className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
                    disabled={saving}
                  />
                  <span className="text-sm text-gray-900 dark:text-white/90">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItems(Array.isArray(initialValue) ? initialValue : [])
                setEditing(false)
              }}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleMultiSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )
    }

    // Date Picker
    if (type === 'date' || type === 'datetime') {
      return (
        <Input
          type={type === 'datetime' ? 'datetime-local' : 'date'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className={className}
        />
      )
    }

    // Text/Number Input
    return (
      <Input
        type={type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => setValue(type === 'number' ? Number(e.target.value) : e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={saving}
        className={className}
      />
    )
  }

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 px-3 py-2 -mx-3 -my-2 rounded-lg transition-colors ${className}`}
      title="Double-click to edit"
    >
      <span className="text-gray-900 dark:text-white">
        {value ?? <span className="text-gray-400 dark:text-gray-500">-</span>}
      </span>
    </div>
  )
}
