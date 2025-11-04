/**
 * Core Plugin Interfaces for AdvancedTable
 *
 * Following SOLID principles:
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Components depend on abstractions
 * - Open/Closed: Open for extension via plugins, closed for modification
 */

import { ReactNode } from 'react'

export interface DataSourceParams {
  pagination?: {
    page: number
    pageSize: number
  }
  sorting?: Array<{
    field: string
    direction: 'asc' | 'desc'
  }>
  filters?: Record<string, any>
  search?: string
}

export interface DataSourceResult<TRow = any> {
  data: TRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface BulkOperationResult {
  success: boolean
  affected: number
  errors?: Array<{ id: string; message: string }>
}

export interface IDataSource<TRow = any> {
  fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>>

  create?(data: Partial<TRow>): Promise<TRow>
  update?(id: string, data: Partial<TRow>): Promise<TRow>
  delete?(id: string): Promise<void>

  bulkDelete?(ids: string[]): Promise<BulkOperationResult>
  batchUpdate?(updates: Record<string, Partial<TRow>>): Promise<BulkOperationResult>
}

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'currency'
  | 'select'
  | 'multi-select'
  | 'email'
  | 'url'
  | 'custom'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface CellRenderProps<TRow = any, TValue = any> {
  value: TValue
  row: TRow
  column: ColumnDefinition<TRow>
  rowIndex: number
  isEditing?: boolean
  onChange?: (value: TValue) => void
}

export type CellRenderer<TRow = any, TValue = any> = (props: CellRenderProps<TRow, TValue>) => ReactNode

export interface ColumnDefinition<TRow = any, TValue = any> {
  key: keyof TRow | string
  header: string
  type?: FieldType

  cell?: CellRenderer<TRow, TValue>

  sortable?: boolean
  filterable?: boolean
  editable?: boolean

  width?: number | string
  minWidth?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
  hidden?: boolean

  options?: SelectOption[]

  format?: (value: any) => string
  parse?: (value: string) => any

  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
    custom?: (value: any) => boolean | string
  }
}

export interface ISchemaProvider<TRow = any> {
  getColumns(): ColumnDefinition<TRow>[]
  getColumn(key: keyof TRow | string): ColumnDefinition<TRow> | undefined
  getFieldType(field: keyof TRow): FieldType
}

export interface TableState {
  pagination: {
    page: number
    pageSize: number
  }
  sorting: Array<{
    field: string
    direction: 'asc' | 'desc'
  }>
  filters: Record<string, any>
  search: string
  selection: Set<string>
  expandedRows: Set<string>
  editingCells: Map<string, any>
}

export interface TableContext<TRow = any> {
  data: TRow[]
  state: TableState
  columns: ColumnDefinition<TRow>[]
  getRowId: (row: TRow) => string
}

export interface ITableFeature<TRow = any> {
  name: string

  onInit?(context: TableContext<TRow>): void
  onStateChange?(state: TableState, prevState: TableState): void
  onDataChange?(data: TRow[]): void

  renderToolbar?(): ReactNode
  renderCell?(props: CellRenderProps<TRow>): ReactNode
  renderRow?(row: TRow, children: ReactNode): ReactNode
  renderFooter?(): ReactNode
}

export interface TransportConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  params?: Record<string, any>
  data?: any
  headers?: Record<string, string>
}

export interface ITransport {
  request<T>(config: TransportConfig): Promise<T>
}

export interface TableFeatures {
  sorting?: boolean
  filtering?: boolean
  globalSearch?: boolean
  pagination?: boolean | {
    pageSize?: number
    pageSizeOptions?: number[]
  }
  rowSelection?: boolean | {
    multiple?: boolean
    preserveSelection?: boolean
  }
  inlineEditing?: boolean | {
    mode?: 'cell' | 'row'
  }
  bulkOperations?: boolean | string[]
  export?: boolean | {
    formats?: Array<'csv' | 'json' | 'excel'>
  }
  columnVisibility?: boolean
  columnReorder?: boolean
  rowExpansion?: boolean
}
