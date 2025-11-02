/**
 * Schema Parser
 *
 * Parses API entity schema into a structured format optimized for table consumption
 */

import type { EntitySchema, ParsedSchema, ColumnSchema, SelectOption } from './types'

/**
 * Parse entity schema from API response
 */
export function parseSchema(schema: EntitySchema | undefined): ParsedSchema | null {
  if (!schema || !schema.columns) {
    return null
  }

  const columns = schema.columns
  const columnsByKey = new Map<string, ColumnSchema>()
  const filterOptions = new Map<string, SelectOption[]>()

  const editableFields: string[] = []
  const sortableFields: string[] = []
  const filterableFields: string[] = []
  const searchableFields: string[] = []

  // Process each column
  columns.forEach(column => {
    if (!column.key) return

    columnsByKey.set(column.key, column)

    if (column.editable) editableFields.push(column.key)
    if (column.sortable) sortableFields.push(column.key)
    if (column.filterable) filterableFields.push(column.key)
    if (column.searchable) searchableFields.push(column.key)

    // Store filter options for select fields
    if (column.options && column.options.length > 0) {
      filterOptions.set(column.key, column.options)
    }
  })

  return {
    entity: schema.entity || 'unknown',
    displayName: schema.displayName || 'Items',
    columns,
    editableFields,
    sortableFields,
    filterableFields,
    searchableFields,
    filters: schema.filters || { search: false, sortBy: [], status: [] },
    bulkOperations: schema.bulkOperations || {},
    columnsByKey,
    filterOptions,
  }
}

/**
 * Get editable columns from schema
 */
export function getEditableColumns(parsedSchema: ParsedSchema | null): string[] {
  return parsedSchema?.editableFields || []
}

/**
 * Get filter options for a column
 */
export function getColumnFilterOptions(
  parsedSchema: ParsedSchema | null,
  columnKey: string
): SelectOption[] | undefined {
  return parsedSchema?.filterOptions.get(columnKey)
}

/**
 * Check if a column is editable
 */
export function isColumnEditable(parsedSchema: ParsedSchema | null, columnKey: string): boolean {
  return parsedSchema?.editableFields.includes(columnKey) ?? false
}

/**
 * Get column configuration
 */
export function getColumnConfig(
  parsedSchema: ParsedSchema | null,
  columnKey: string
): ColumnSchema | undefined {
  return parsedSchema?.columnsByKey.get(columnKey)
}
