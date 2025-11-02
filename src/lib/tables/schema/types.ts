/**
 * Schema-Driven Table Types
 *
 * These types represent the API schema structure that defines table configuration.
 * They are based on the entity.EntitySchema from the generated API types.
 */

import type { components } from '@/lib/api/generated/schema'

export type EntitySchema = components['schemas']['entity.EntitySchema']
export type ColumnSchema = components['schemas']['entity.ColumnSchema']
export type BulkOperations = components['schemas']['entity.BulkOperations']
export type BulkOperation = components['schemas']['entity.BulkOperation']
export type FilterConfig = components['schemas']['entity.FilterConfig']
export type DisplaySettings = components['schemas']['entity.DisplaySettings']
export type Validation = components['schemas']['entity.Validation']
export type SelectOption = components['schemas']['entity.SelectOption']
export type ColumnType = components['schemas']['entity.ColumnType']
export type DataType = components['schemas']['entity.DataType']

/**
 * Parsed schema configuration ready for table consumption
 */
export interface ParsedSchema {
  entity: string
  displayName: string

  // Column configuration
  columns: ColumnSchema[]
  editableFields: string[]
  sortableFields: string[]
  filterableFields: string[]
  searchableFields: string[]

  // Feature configuration
  filters: FilterConfig
  bulkOperations: BulkOperations

  // Field mappings
  columnsByKey: Map<string, ColumnSchema>
  filterOptions: Map<string, SelectOption[]>
}
