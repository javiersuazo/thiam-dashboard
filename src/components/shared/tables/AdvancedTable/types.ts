/**
 * Clean API Design for AdvancedTableEnhanced
 *
 * Design Principles:
 * 1. Intuitive - Easy to understand and use
 * 2. Composable - Build complex configs from simple parts
 * 3. Type-safe - Full TypeScript support
 * 4. Flexible - Support all use cases
 * 5. Minimal - Only configure what you need
 */

import type {
  ColumnDef,
  PaginationState,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table'

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * Main table configuration
 * Everything is optional except columns and data
 */
export interface TableConfig<TData> {
  // Required
  columns: ColumnDef<TData>[]
  data: TData[]

  // Optional feature groups
  features?: FeatureConfig
  server?: ServerConfig
  ui?: UIConfig
  actions?: ActionsConfig<TData>
  editing?: EditingConfig<TData>
  state?: StateConfig
  styling?: StylingConfig<TData>

  // Row identification
  getRowId?: (row: TData) => string
}

// =============================================================================
// FEATURE CONFIGURATION
// =============================================================================

/**
 * Feature toggles - what capabilities to enable
 * All default to sensible values
 */
export interface FeatureConfig {
  sorting?: boolean              // Default: true
  filtering?: boolean            // Default: true
  globalSearch?: boolean         // Default: true
  pagination?: boolean           // Default: true
  rowSelection?: boolean         // Default: false
  multiSelect?: boolean          // Default: true (if rowSelection enabled)
  columnVisibility?: boolean     // Default: true
  columnResizing?: boolean       // Default: false
  virtualization?: boolean       // Default: false
  expandable?: boolean           // Default: false
  export?: boolean               // Default: true
}

// =============================================================================
// SERVER-SIDE CONFIGURATION
// =============================================================================

/**
 * Server-side data fetching configuration
 * Use when data is fetched from an API
 */
export interface ServerConfig {
  enabled: boolean

  // Loading states
  isLoading?: boolean
  isFetching?: boolean

  // Pagination info from server
  totalItems?: number
  totalPages?: number
  currentPage?: number

  // Optional: Custom handlers
  onFetch?: (params: ServerFetchParams) => void | Promise<void>
}

export interface ServerFetchParams {
  pagination: PaginationState
  sorting: SortingState
  filters: ColumnFiltersState
  search: string
}

// =============================================================================
// UI CONFIGURATION
// =============================================================================

/**
 * UI customization options
 */
export interface UIConfig {
  // Toolbar
  toolbar?: {
    show?: boolean
    search?: {
      show?: boolean
      placeholder?: string
      debounce?: number           // Default: 300ms
    }
    filters?: {
      show?: boolean
      preset?: PresetFilter[]
    }
    columnVisibility?: {
      show?: boolean
    }
    export?: {
      show?: boolean
      filename?: string
      formats?: ('csv' | 'json' | 'xlsx')[]
    }
  }

  // Pagination
  pagination?: {
    show?: boolean
    position?: 'top' | 'bottom' | 'both'    // Default: 'bottom'
    pageSize?: number                        // Default: 10
    pageSizeOptions?: number[]               // Default: [10, 20, 50, 100]
    showInfo?: boolean                       // Default: true ("Showing 1-10 of 100")
    showPageSizeSelector?: boolean           // Default: true
  }

  // Empty/Loading states
  states?: {
    loading?: React.ReactNode
    empty?: React.ReactNode
    error?: React.ReactNode
  }

  // Density
  density?: 'compact' | 'normal' | 'comfortable'  // Default: 'normal'
}

export interface PresetFilter {
  columnId: string
  label: string
  type: 'text' | 'select' | 'range' | 'date' | 'multiselect'
  options?: { label: string; value: any }[]
  defaultValue?: any
}

// =============================================================================
// ACTIONS CONFIGURATION
// =============================================================================

/**
 * User actions and interactions
 */
export interface ActionsConfig<TData> {
  // Row actions
  row?: {
    onClick?: (row: TData, event: React.MouseEvent) => void
    onDoubleClick?: (row: TData, event: React.MouseEvent) => void
    onContextMenu?: (row: TData, event: React.MouseEvent) => void
    menu?: RowAction<TData>[]
  }

  // Bulk actions (when rows are selected)
  bulk?: BulkAction<TData>[]

  // Custom actions in toolbar
  custom?: CustomAction[]
}

export interface RowAction<TData> {
  label: string
  icon?: React.ReactNode
  onClick: (row: TData) => void | Promise<void>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  disabled?: (row: TData) => boolean
  show?: (row: TData) => boolean
}

export interface BulkAction<TData> {
  label: string
  icon?: React.ReactNode
  onClick: (selectedRows: TData[]) => void | Promise<void>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  disabled?: (selectedRows: TData[]) => boolean
  confirmMessage?: string | ((selectedRows: TData[]) => string)
}

export interface CustomAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void | Promise<void>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  position?: 'left' | 'right'  // Default: 'right'
}

// =============================================================================
// EDITING CONFIGURATION
// =============================================================================

/**
 * Inline editing configuration
 */
export interface EditingConfig<TData> {
  // Which columns are editable
  enabled?: boolean
  columns?: string[] | EditableColumn[]

  // Edit mode
  mode?: 'cell' | 'row'  // Default: 'cell'

  // Validation
  validate?: (rowId: string, columnId: string, value: any) => boolean | string

  // Handlers
  onEdit?: (rowId: string, columnId: string, value: any) => void | Promise<void>
  onSave?: (rowId: string, changes: Partial<TData>) => void | Promise<void>
  onCancel?: (rowId: string) => void

  // Bulk editing
  bulk?: {
    enabled?: boolean
    onSaveAll?: (changes: Record<string, Partial<TData>>) => void | Promise<void>
    onCancelAll?: () => void
    saveLabel?: string
    cancelLabel?: string
  }

  // Optimistic updates
  optimistic?: boolean  // Default: false
}

export interface EditableColumn {
  id: string
  type?: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'checkbox'
  options?: { label: string; value: any }[]
  validate?: (value: any) => boolean | string
  format?: (value: any) => any
  parse?: (value: any) => any
}

// =============================================================================
// STATE CONFIGURATION
// =============================================================================

/**
 * Table state management
 */
export interface StateConfig {
  // Initial state
  initial?: {
    sorting?: SortingState
    filters?: ColumnFiltersState
    visibility?: VisibilityState
    selection?: RowSelectionState
    search?: string
    pagination?: PaginationState
    expanded?: Record<string, boolean>
  }

  // Controlled state (for external control)
  controlled?: {
    sorting?: [SortingState, (value: SortingState) => void]
    filters?: [ColumnFiltersState, (value: ColumnFiltersState) => void]
    visibility?: [VisibilityState, (value: VisibilityState) => void]
    selection?: [RowSelectionState, (value: RowSelectionState) => void]
    search?: [string, (value: string) => void]
    pagination?: [PaginationState, (value: PaginationState) => void]
  }

  // State change callbacks
  onChange?: (state: TableState) => void
  onSortChange?: (sorting: SortingState) => void
  onFilterChange?: (filters: ColumnFiltersState) => void
  onSearchChange?: (search: string) => void
  onPageChange?: (pagination: PaginationState) => void
  onSelectionChange?: (selection: RowSelectionState) => void

  // Persistence
  persistence?: {
    enabled?: boolean
    key?: string  // LocalStorage key
    fields?: ('sorting' | 'filters' | 'visibility' | 'pageSize')[]
  }
}

export interface TableState {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  rowSelection: RowSelectionState
  pagination: PaginationState
  globalFilter: string
  expanded?: Record<string, boolean>
}

// =============================================================================
// STYLING CONFIGURATION
// =============================================================================

/**
 * Custom styling and theming
 */
export interface StylingConfig<TData> {
  // Table-level
  table?: {
    className?: string
    striped?: boolean          // Alternate row colors
    bordered?: boolean         // Show borders
    hoverable?: boolean        // Highlight on hover
    compact?: boolean          // Reduce padding
  }

  // Row-level
  row?: {
    className?: string | ((row: TData) => string)
    getVariant?: (row: TData) => 'default' | 'success' | 'warning' | 'error'
    highlightSelected?: boolean
    highlightEdited?: boolean
  }

  // Cell-level
  cell?: {
    className?: string
    align?: 'left' | 'center' | 'right'
  }

  // Header
  header?: {
    className?: string
    sticky?: boolean           // Stick to top on scroll
  }

  // Custom renderers
  renderRow?: (row: TData, defaultRender: React.ReactNode) => React.ReactNode
  renderCell?: (cell: any, defaultRender: React.ReactNode) => React.ReactNode
}

// =============================================================================
// BUILDER HELPERS
// =============================================================================

/**
 * Helper to build table config with better DX
 */
export class TableConfigBuilder<TData> {
  private config: Partial<TableConfig<TData>> = {}

  columns(columns: ColumnDef<TData>[]) {
    this.config.columns = columns
    return this
  }

  data(data: TData[]) {
    this.config.data = data
    return this
  }

  features(features: Partial<FeatureConfig>) {
    this.config.features = { ...this.config.features, ...features }
    return this
  }

  server(server: Partial<ServerConfig>) {
    this.config.server = { ...this.config.server, ...server } as ServerConfig
    return this
  }

  ui(ui: Partial<UIConfig>) {
    this.config.ui = { ...this.config.ui, ...ui }
    return this
  }

  actions(actions: Partial<ActionsConfig<TData>>) {
    this.config.actions = { ...this.config.actions, ...actions }
    return this
  }

  editing(editing: Partial<EditingConfig<TData>>) {
    this.config.editing = { ...this.config.editing, ...editing }
    return this
  }

  state(state: Partial<StateConfig>) {
    this.config.state = { ...this.config.state, ...state }
    return this
  }

  styling(styling: Partial<StylingConfig<TData>>) {
    this.config.styling = { ...this.config.styling, ...styling }
    return this
  }

  build(): TableConfig<TData> {
    if (!this.config.columns || !this.config.data) {
      throw new Error('TableConfig requires columns and data')
    }
    return this.config as TableConfig<TData>
  }
}

/**
 * Factory function to create config builder
 */
export function createTableConfig<TData>() {
  return new TableConfigBuilder<TData>()
}

// =============================================================================
// PRESETS
// =============================================================================

/**
 * Common configuration presets
 */
export const TablePresets = {
  /**
   * Simple read-only table
   */
  simple: <TData>(): Partial<TableConfig<TData>> => ({
    features: {
      sorting: true,
      filtering: false,
      globalSearch: false,
      pagination: true,
      rowSelection: false,
    },
    ui: {
      toolbar: {
        show: false,
      },
    },
  }),

  /**
   * Full-featured data table
   */
  dataTable: <TData>(): Partial<TableConfig<TData>> => ({
    features: {
      sorting: true,
      filtering: true,
      globalSearch: true,
      pagination: true,
      rowSelection: true,
      columnVisibility: true,
      export: true,
    },
  }),

  /**
   * Server-side table
   */
  serverSide: <TData>(config: ServerConfig): Partial<TableConfig<TData>> => ({
    server: {
      enabled: true,
      ...config,
    },
    features: {
      sorting: true,
      filtering: true,
      globalSearch: true,
      pagination: true,
    },
  }),

  /**
   * Editable table
   */
  editable: <TData>(columns: string[]): Partial<TableConfig<TData>> => ({
    editing: {
      enabled: true,
      columns,
      mode: 'cell',
      optimistic: true,
      bulk: {
        enabled: true,
      },
    },
  }),

  /**
   * Compact table for dashboards
   */
  compact: <TData>(): Partial<TableConfig<TData>> => ({
    ui: {
      density: 'compact',
      toolbar: {
        show: false,
      },
      pagination: {
        show: true,
        showInfo: false,
        showPageSizeSelector: false,
      },
    },
    styling: {
      table: {
        compact: true,
        striped: true,
      },
    },
  }),
}
