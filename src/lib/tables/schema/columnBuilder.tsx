/**
 * Column Builder
 *
 * Builds TanStack Table column definitions from API schema
 */

import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { ParsedSchema, ColumnSchema, SelectOption } from './types'

/**
 * Helper function to get display label from value using schema options
 */
function getDisplayLabel(value: any, options?: SelectOption[]): string {
  if (!options || options.length === 0) return String(value)
  const option = options.find(opt => opt.value === value)
  return option?.label || String(value)
}

/**
 * Helper function to get value from display label (reverse lookup)
 */
function getValueFromLabel(label: string, options?: SelectOption[]): string {
  if (!options || options.length === 0) return label
  const option = options.find(opt => opt.label === label)
  return option?.value || label
}

/**
 * Build table columns from schema
 */
export function buildColumnsFromSchema<TData = any>(
  parsedSchema: ParsedSchema,
  options?: {
    /**
     * Custom cell renderers by column key
     */
    customCells?: Record<string, ColumnDef<TData>['cell']>

    /**
     * Additional column overrides
     */
    columnOverrides?: Record<string, Partial<ColumnDef<TData>>>

    /**
     * Format function for currency fields
     */
    formatCurrency?: (cents: number, currency?: string) => string

    /**
     * Format function for date fields
     */
    formatDate?: (date: string, format?: string) => string

    /**
     * Translation function for labels
     */
    t?: (key: string) => string

    /**
     * Enable row selection checkbox column
     */
    enableRowSelection?: boolean
  }
): ColumnDef<TData>[] {
  const {
    customCells = {},
    columnOverrides = {},
    formatCurrency,
    formatDate,
    t = (key) => key,
    enableRowSelection = false,
  } = options || {}

  const columns: ColumnDef<TData>[] = []

  // Add selection column if enabled
  if (enableRowSelection) {
    columns.push({
      id: 'select',
      header: ({ table }) => (
        <label className="flex cursor-pointer items-center">
          <span className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${
                table.getIsAllPageRowsSelected()
                  ? "border-brand-500 bg-brand-500"
                  : "bg-transparent border-gray-300 dark:border-gray-700"
              }`}
            >
              <span className={table.getIsAllPageRowsSelected() ? "" : "opacity-0"}>
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
      ),
      cell: ({ row }) => (
        <label className="flex cursor-pointer items-center">
          <span className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${
                row.getIsSelected()
                  ? "border-brand-500 bg-brand-500"
                  : "bg-transparent border-gray-300 dark:border-gray-700"
              }`}
            >
              <span className={row.getIsSelected() ? "" : "opacity-0"}>
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
      ),
      size: 50,
      enableSorting: false,
      enableHiding: false,
    })
  }

  // Add schema-based columns
  const schemaColumns = parsedSchema.columns
    .sort((a, b) => (a.display?.priority || 999) - (b.display?.priority || 999))
    .map(column => {
      const columnDef: ColumnDef<TData> = {
        accessorKey: column.key,
        header: column.label || column.key,
        enableSorting: column.sortable,
        enableColumnFilter: column.filterable,

        // Meta information for AdvancedTable
        meta: {
          // Edit configuration
          editType: column.editable ? mapColumnTypeToEditType(column.type) : undefined,
          editOptions: column.type === 'boolean'
            ? [
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
              ]
            : column.options?.map(opt => ({
                label: opt.label || opt.value || '',
                value: opt.value || '',
              })),

          // Filter configuration
          filterType: column.filterable ? mapColumnTypeToFilterType(column.type) : undefined,
          filterOptions: column.type === 'boolean'
            ? [
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ]
            : column.options?.map(opt => ({
                label: opt.label || opt.value || '',
                value: opt.value || '',
              })),

          // Validation
          validation: column.validation,

          // Display settings
          width: column.display?.width,
          align: column.display?.align,
        },
      }

      // Custom cell renderer if provided
      if (customCells[column.key!]) {
        columnDef.cell = customCells[column.key!]
      } else {
        // Auto-generate cell renderer based on type
        columnDef.cell = createCellRenderer(column, { formatCurrency, formatDate })
      }

      // Apply column overrides
      if (columnOverrides[column.key!]) {
        Object.assign(columnDef, columnOverrides[column.key!])
      }

      return columnDef
    })

  return [...columns, ...schemaColumns]
}

/**
 * Map schema column type to edit type
 */
function mapColumnTypeToEditType(columnType?: string): string {
  switch (columnType) {
    case 'text':
      return 'text'
    case 'number':
    case 'currency':
      return 'number'
    case 'select':
      return 'select'
    case 'boolean':
      return 'checkbox'
    case 'date':
    case 'datetime':
      return 'date'
    default:
      return 'text'
  }
}

/**
 * Map schema column type to filter type
 */
function mapColumnTypeToFilterType(columnType?: string): string {
  switch (columnType) {
    case 'select':
    case 'boolean':
      return 'select'
    case 'number':
    case 'currency':
      return 'range'
    case 'date':
    case 'datetime':
      return 'date'
    default:
      return 'text'
  }
}

/**
 * Create cell renderer based on column configuration
 */
function createCellRenderer<TData>(
  column: ColumnSchema,
  formatters?: {
    formatCurrency?: (cents: number, currency?: string) => string
    formatDate?: (date: string, format?: string) => string
  }
): ColumnDef<TData>['cell'] {
  return ({ row, getValue }) => {
    const value = getValue()

    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>
    }

    // Type-specific rendering
    switch (column.type) {
      case 'currency':
        if (formatters?.formatCurrency) {
          return (
            <span className="text-sm text-gray-700 dark:text-gray-400">
              {formatters.formatCurrency(value as number, column.display?.currency)}
            </span>
          )
        }
        break

      case 'date':
      case 'datetime':
        if (formatters?.formatDate) {
          return (
            <span className="text-sm text-gray-700 dark:text-gray-400">
              {formatters.formatDate(value as string, column.display?.format)}
            </span>
          )
        }
        break

      case 'boolean':
        return (
          <label className="flex cursor-not-allowed items-center">
            <span className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={!!value}
                disabled
              />
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${
                  value
                    ? "border-brand-500 bg-brand-500 opacity-50"
                    : "bg-transparent border-gray-300 dark:border-gray-700 opacity-50"
                }`}
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

      case 'select':
        const option = column.options?.find(opt => opt.value === value)
        return (
          <span className="text-sm text-gray-700 dark:text-gray-400 capitalize">
            {option?.label || value}
          </span>
        )

      case 'number':
        const numValue = typeof value === 'number' ? value : parseFloat(value as string)
        return (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {!isNaN(numValue) ? numValue.toFixed(2) : value}
          </span>
        )

      default:
        return (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {String(value)}
          </span>
        )
    }

    // Fallback
    return <span className="text-sm text-gray-700 dark:text-gray-400">{String(value)}</span>
  }
}
