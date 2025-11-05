// Plugin-based API (recommended for new tables)
export { AdvancedTablePlugin } from './AdvancedTablePlugin'
export type {
  IDataSource,
  ISchemaProvider,
  ITableFeature,
  ITransport,
  ColumnDefinition,
  TableFeatures,
  DataSourceParams,
  DataSourceResult,
  BulkOperationResult,
  FieldType,
  SelectOption,
  CellRenderProps,
  CellRenderer,
  TableState,
  TableContext,
  TransportConfig,
} from './core/interfaces'

export {
  ApiDataSource,
  MockDataSource,
  LocalStorageDataSource,
  ManualSchemaProvider,
} from './plugins'
export type {
  ApiDataSourceConfig,
  MockDataSourceConfig,
  LocalStorageDataSourceConfig,
} from './plugins'

export { ReactQueryTransport } from './adapters'
export type { IApiClient } from './core/IApiClient'

export {
  useTableData,
  useTableEditing,
  useTableSelection,
} from './hooks'
export type {
  UseTableDataResult,
  UseTableEditingResult,
  UseTableEditingOptions,
  UseTableSelectionResult,
} from './hooks'

// Clean API (wrapper around AdvancedTableEnhanced)
export { AdvancedTable, createTableConfig, TablePresets } from './AdvancedTable'
export type { TableConfig } from './types'

// Legacy component (still works, but prefer AdvancedTablePlugin or AdvancedTable)
export { AdvancedTableEnhanced } from './AdvancedTableEnhanced'

// Utilities
export { useServerTable, buildQueryParams } from './useServerTable'
export * from './utils'
