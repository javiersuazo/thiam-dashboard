/**
 * Configuration Adapter
 *
 * Converts the new clean API configuration to the internal format
 * used by AdvancedTableEnhanced component
 */

import type { TableConfig } from './types'
import type { AdvancedTableProps as LegacyProps } from './types.old'
import { parseSchema, buildColumnsFromSchema, getApiValue } from '@/lib/tables/schema'

export function adaptTableConfig<TData>(
  config: TableConfig<TData>
): LegacyProps<TData> {
  const {
    columns: manualColumns,
    data,
    getRowId,
    schema,
    schemaOptions = {},
    features = {},
    server,
    ui = {},
    actions = {},
    editing = {},
    state = {},
    styling = {},
  } = config

  const parsedSchema = schema ? parseSchema(schema) : null

  const columns = parsedSchema
    ? buildColumnsFromSchema<TData>(parsedSchema, schemaOptions)
    : manualColumns || []

  // Map features
  const enableSorting = features.sorting ?? true
  const enableFiltering = features.filtering ?? true
  const enableGlobalFilter = features.globalSearch ?? true
  const enablePagination = features.pagination ?? true
  const enableRowSelection = features.rowSelection ?? false
  const enableMultiRowSelection = features.multiSelect ?? true
  const enableColumnVisibility = features.columnVisibility ?? true
  const enableColumnResizing = features.columnResizing ?? false
  const enableVirtualization = features.virtualization ?? false
  const enableExpanding = features.expandable ?? false

  // Map server config
  const serverSide = server
    ? {
        enabled: server.enabled,
        isLoading: server.isLoading,
        isFetching: server.isFetching,
        totalItems: server.totalItems,
        totalPages: server.totalPages,
      }
    : undefined

  // Map UI config
  const searchPlaceholder = ui.toolbar?.search?.placeholder ?? 'Search...'
  const showSearch = ui.toolbar?.search?.show ?? ui.toolbar?.show ?? true
  const showPagination = ui.pagination?.show ?? true
  const showColumnVisibility = ui.toolbar?.columnVisibility?.show ?? true
  const showExport = ui.toolbar?.export?.show ?? (features.export ?? true)
  const showRowsPerPage = ui.pagination?.showPageSizeSelector ?? true
  const defaultPageSize = ui.pagination?.pageSize ?? 10
  const pageSizeOptions = ui.pagination?.pageSizeOptions ?? [10, 20, 50, 100]
  const exportFileName = ui.toolbar?.export?.filename ?? 'export'
  const emptyState = ui.states?.empty
  const loadingState = ui.states?.loading

  // Map actions
  const bulkActions = actions.bulk ?? []
  const onRowClick = actions.row?.onClick

  // Map editing (auto-populate from schema if available)
  const editableColumns = editing.enabled
    ? (Array.isArray(editing.columns)
        ? editing.columns.map((col) =>
            typeof col === 'string' ? col : col.id
          )
        : parsedSchema?.editableFields || [])
    : []

  // Auto-translation wrapper for onCellEdit
  const autoTranslate = schemaOptions.autoTranslate ?? true
  const onCellEdit = editing.onEdit && autoTranslate && parsedSchema
    ? (rowId: string, columnId: string, value: unknown) => {
        const column = parsedSchema.columns.find(col => col.key === columnId)
        const apiValue = column?.type === 'select' && column.options
          ? getApiValue(value, column.options)
          : value
        editing.onEdit!(rowId, columnId, apiValue)
      }
    : editing.onEdit

  const showBulkSave = editing.bulk?.enabled ?? false
  const onSaveAll = editing.bulk?.onSaveAll
  const onCancelAll = editing.bulk?.onCancelAll
  const bulkSaveLabel = editing.bulk?.saveLabel ?? 'Save All Changes'

  // Map state
  const initialState = state.initial
  const onStateChange = state.onChange
  const controlledPagination = state.controlled?.pagination
  const controlledSorting = state.controlled?.sorting
  const controlledFilters = state.controlled?.filters
  const controlledSearch = state.controlled?.search
  const controlledSelection = state.controlled?.selection

  // Map styling
  const className = styling.table?.className ?? ''
  const getRowClassName = typeof styling.row?.className === 'function'
    ? styling.row.className
    : undefined

  // Build filter options from UI config
  const filterOptions = ui.toolbar?.filters?.preset ?? []

  return {
    columns,
    data,
    getRowId,
    enableSorting,
    enableFiltering,
    enableGlobalFilter,
    enablePagination,
    enableColumnVisibility,
    enableColumnResizing,
    enableRowSelection,
    enableMultiRowSelection,
    enableVirtualization,
    enableExpanding,
    serverSide,
    bulkActions,
    searchPlaceholder,
    emptyState,
    loadingState,
    onRowClick,
    className,
    defaultPageSize,
    pageSizeOptions,
    showSearch,
    showPagination,
    showColumnVisibility,
    showExport,
    showRowsPerPage,
    exportFileName,
    onStateChange,
    initialState,
    onCellEdit,
    editableColumns,
    getRowClassName,
    showBulkSave,
    onSaveAll,
    onCancelAll,
    bulkSaveLabel,
    filterOptions: filterOptions as any,
    controlledPagination,
    controlledSorting,
    controlledFilters,
    controlledSearch,
    controlledSelection,
  }
}

/**
 * Apply default configuration
 */
export function applyDefaults<TData>(
  config: Partial<TableConfig<TData>>
): TableConfig<TData> {
  return {
    columns: config.columns,
    data: config.data ?? [],
    getRowId: config.getRowId,
    schema: config.schema,
    schemaOptions: config.schemaOptions,
    features: {
      sorting: true,
      filtering: true,
      globalSearch: true,
      pagination: true,
      rowSelection: false,
      multiSelect: true,
      columnVisibility: true,
      columnResizing: false,
      virtualization: false,
      expandable: false,
      export: true,
      ...config.features,
    },
    server: config.server,
    ui: {
      toolbar: {
        show: true,
        search: {
          show: true,
          placeholder: 'Search...',
          debounce: 300,
          ...config.ui?.toolbar?.search,
        },
        filters: {
          show: true,
          ...config.ui?.toolbar?.filters,
        },
        columnVisibility: {
          show: true,
          ...config.ui?.toolbar?.columnVisibility,
        },
        export: {
          show: true,
          filename: 'export',
          formats: ['csv'],
          ...config.ui?.toolbar?.export,
        },
        ...config.ui?.toolbar,
      },
      pagination: {
        show: true,
        position: 'bottom',
        pageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
        showInfo: true,
        showPageSizeSelector: true,
        ...config.ui?.pagination,
      },
      states: config.ui?.states,
      density: config.ui?.density ?? 'normal',
    },
    actions: config.actions,
    editing: config.editing,
    state: config.state,
    styling: config.styling,
  }
}
