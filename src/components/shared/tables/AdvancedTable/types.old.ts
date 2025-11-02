import type {
  ColumnDef,
  PaginationState,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState
} from '@tanstack/react-table'

export interface TablePaginationConfig {
  pageIndex: number
  pageSize: number
  totalItems?: number
  totalPages?: number
}

export interface TableState {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  rowSelection: RowSelectionState
  pagination: PaginationState
  globalFilter: string
  columnOrder?: string[]
}

export interface ServerSideConfig<TData> {
  enabled: boolean
  totalItems?: number
  totalPages?: number
  isLoading?: boolean
  isFetching?: boolean
}

export interface BulkAction<TData> {
  label: string
  icon?: React.ReactNode
  onClick: (selectedRows: TData[]) => void | Promise<void>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  disabled?: (selectedRows: TData[]) => boolean
}

export interface AdvancedTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  getRowId?: (row: TData) => string

  enableSorting?: boolean
  enableFiltering?: boolean
  enableGlobalFilter?: boolean
  enablePagination?: boolean
  enableColumnVisibility?: boolean
  enableColumnResizing?: boolean
  enableRowSelection?: boolean
  enableMultiRowSelection?: boolean
  enableVirtualization?: boolean
  enableExpanding?: boolean

  serverSide?: ServerSideConfig<TData>

  bulkActions?: BulkAction<TData>[]

  searchPlaceholder?: string
  emptyState?: React.ReactNode
  loadingState?: React.ReactNode

  onRowClick?: (row: TData) => void

  className?: string

  defaultPageSize?: number
  pageSizeOptions?: number[]

  showSearch?: boolean
  showPagination?: boolean
  showColumnVisibility?: boolean
  showExport?: boolean
  showRowsPerPage?: boolean

  filterOptions?: {
    columnId: string
    label: string
    type: 'text' | 'select' | 'range'
    options?: { label: string; value: string }[]
  }[]

  exportFileName?: string
  onExport?: (data: TData[]) => void

  onStateChange?: (state: Partial<TableState>) => void

  initialState?: Partial<TableState>

  getSubRows?: (originalRow: TData) => TData[] | undefined
  renderSubComponent?: (props: { row: any }) => React.ReactNode

  onCellEdit?: (rowId: string, columnId: string, value: any) => void | Promise<void>
  editableColumns?: string[]
  getRowClassName?: (row: any) => string

  showBulkSave?: boolean
  onSaveAll?: () => void
  onCancelAll?: () => void
  bulkSaveLabel?: string

  virtualizerOptions?: {
    estimateSize?: number
    overscan?: number
  }

  controlledPagination?: [PaginationState, (updater: PaginationState | ((old: PaginationState) => PaginationState)) => void]
  controlledSorting?: [SortingState, (updater: SortingState | ((old: SortingState) => SortingState)) => void]
  controlledFilters?: [ColumnFiltersState, (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void]
  controlledSelection?: [RowSelectionState, (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => void]
  controlledSearch?: [string, (updater: string | ((old: string) => string)) => void]
}

export interface ExportOptions {
  filename?: string
  format?: 'csv' | 'json'
  includeHeaders?: boolean
  selectedOnly?: boolean
}
