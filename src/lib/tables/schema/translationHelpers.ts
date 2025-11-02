/**
 * Translation Helpers for Schema-Driven Tables
 *
 * Handles translation between API keys and display labels for select/enum fields
 */

import type { SelectOption, ColumnSchema, ParsedSchema } from './types'

/**
 * Get display label from API value using schema options
 *
 * @example
 * // Schema options: [{ value: "vegetables", label: "Vegetales" }]
 * getDisplayLabel("vegetables", options) // Returns: "Vegetales"
 */
export function getDisplayLabel(value: any, options?: SelectOption[]): string {
  if (value === null || value === undefined) return ''
  if (!options || options.length === 0) return String(value)

  const option = options.find(opt => opt.value === value)
  return option?.label || String(value)
}

/**
 * Get API value (key) from display label
 *
 * @example
 * // Schema options: [{ value: "vegetables", label: "Vegetales" }]
 * getApiValue("Vegetales", options) // Returns: "vegetables"
 */
export function getApiValue(valueOrLabel: any, options?: SelectOption[]): any {
  if (valueOrLabel === null || valueOrLabel === undefined) return valueOrLabel
  if (!options || options.length === 0) return valueOrLabel

  const byValue = options.find(opt => opt.value === valueOrLabel)
  if (byValue) return byValue.value

  const byLabel = options.find(opt => opt.label === valueOrLabel)
  return byLabel?.value || valueOrLabel
}

/**
 * Create a translation-aware cell edit handler
 *
 * Wraps the user's onCellEdit to automatically convert display labels to API keys
 *
 * @example
 * const handleCellEdit = createTranslationAwareCellEdit(
 *   schema,
 *   (rowId, columnId, apiValue) => {
 *     // apiValue is already converted to key
 *     setEditedRows(prev => ({ ...prev, [rowId]: { [columnId]: apiValue } }))
 *   }
 * )
 */
export function createTranslationAwareCellEdit(
  schema: ParsedSchema | undefined,
  onCellEdit: (rowId: string, columnId: string, value: unknown) => void
) {
  return (rowId: string, columnId: string, value: unknown) => {
    if (!schema) {
      onCellEdit(rowId, columnId, value)
      return
    }

    const column = schema.columns.find(col => col.key === columnId)

    if (column?.type === 'select' && column.options) {
      const apiValue = getApiValue(value, column.options)
      onCellEdit(rowId, columnId, apiValue)
    } else {
      onCellEdit(rowId, columnId, value)
    }
  }
}

/**
 * Helper to get translated options for a specific column
 */
export function getColumnOptions(
  schema: ParsedSchema | undefined,
  columnId: string
): SelectOption[] | undefined {
  if (!schema) return undefined
  const column = schema.columns.find(col => col.key === columnId)
  return column?.options
}

/**
 * Batch translate multiple values for display
 * Useful when showing multiple selected values (tags, badges, etc.)
 */
export function translateMultiple(
  values: any[],
  options?: SelectOption[]
): string[] {
  return values.map(value => getDisplayLabel(value, options))
}

/**
 * Reverse translate multiple display labels to API values
 */
export function reverseTranslateMultiple(
  labels: string[],
  options?: SelectOption[]
): any[] {
  return labels.map(label => getApiValue(label, options))
}
