// New clean API (recommended)
export { AdvancedTable, createTableConfig, TablePresets } from './AdvancedTable'
export type { TableConfig } from './types'

// Legacy component (still works, but prefer AdvancedTable)
export { AdvancedTableEnhanced } from './AdvancedTableEnhanced'

// Utilities
export { useServerTable, buildQueryParams } from './useServerTable'
export * from './utils'
