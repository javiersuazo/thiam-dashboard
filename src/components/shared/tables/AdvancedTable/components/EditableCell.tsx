'use client'

import { useState, useEffect, useRef } from 'react'

interface EditableCellProps {
  value: any
  onSave: (value: any) => void | Promise<void>
  type?: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'datetime'
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

  const handleSave = async () => {
    if (value === initialValue) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      await onSave(value)
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

  if (editing) {
    // Single Select
    if (type === 'select') {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    // Multi Select (Checkbox list)
    if (type === 'multiselect') {
      const toggleItem = (itemValue: any) => {
        const newSelected = selectedItems.includes(itemValue)
          ? selectedItems.filter(v => v !== itemValue)
          : [...selectedItems, itemValue]
        setSelectedItems(newSelected)
      }

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

      return (
        <div className="relative">
          <div className="max-h-48 overflow-y-auto space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(option.value)}
                  onChange={() => toggleItem(option.value)}
                  className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
                  disabled={saving}
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                setSelectedItems(Array.isArray(initialValue) ? initialValue : [])
                setEditing(false)
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleMultiSave}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )
    }

    // Date Picker
    if (type === 'date' || type === 'datetime') {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type === 'datetime' ? 'datetime-local' : 'date'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        />
      )
    }

    // Text/Number Input
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => setValue(type === 'number' ? Number(e.target.value) : e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={saving}
        className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
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
