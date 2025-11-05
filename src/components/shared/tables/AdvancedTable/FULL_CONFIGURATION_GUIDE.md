# AdvancedTable - Full Configuration Guide

## Complete Configuration Reference

This is the COMPLETE list of every configuration option available in the AdvancedTable.

---

## 1. Component Props

```typescript
interface AdvancedTablePluginProps<TRow = any> {
  // ============================================
  // REQUIRED PROPS
  // ============================================

  /** Data source - provides data with pagination/filtering/sorting */
  dataSource: IDataSource<TRow>

  /** Schema provider - defines columns and their types */
  schemaProvider: ISchemaProvider<TRow>

  // ============================================
  // CORE CONFIGURATION
  // ============================================

  /** Feature toggles - enable/disable table features */
  features?: TableFeatures

  /** i18n labels - all UI text for internationalization */
  labels?: TableLabels

  /** Function to get unique ID from row */
  getRowId?: (row: TRow) => string

  // ============================================
  // INLINE EDITING
  // ============================================

  /** Column keys that are editable */
  editableColumns?: string[]

  /** Callback when cell is edited */
  onCellEdit?: (rowId: string, columnId: string, value: any) => void | Promise<void>

  /** Callback to save single row */
  onSaveRow?: (rowId: string, changes: Partial<TRow>) => void | Promise<void>

  /** Callback to cancel single row edits */
  onCancelRow?: (rowId: string) => void

  /** Callback to save all edited rows at once */
  onSaveAll?: (allChanges: Record<string, Partial<TRow>>) => void | Promise<void>

  /** Callback to cancel all edits */
  onCancelAll?: () => void

  /** Label for bulk save button */
  bulkSaveLabel?: string

  // ============================================
  // BULK ACTIONS
  // ============================================

  /** Bulk action buttons shown when rows are selected */
  bulkActions?: BulkAction<TRow>[]

  // ============================================
  // SEARCH & EXPORT
  // ============================================

  /** Placeholder for global search input */
  searchPlaceholder?: string

  /** Filename for CSV export */
  exportFileName?: string

  /** Custom export handler */
  onExport?: (data: TRow[]) => void

  // ============================================
  // ROW INTERACTIONS
  // ============================================

  /** Callback when row is clicked */
  onRowClick?: (row: TRow) => void

  /** Callback when rows are selected */
  onSelectionChange?: (selectedRowIds: string[]) => void

  // ============================================
  // PLUGINS & EXTENSIBILITY
  // ============================================

  /** Custom plugin instances for extending functionality */
  plugins?: ITableFeature<TRow>[]

  /** Custom styling classes */
  className?: string
}
```

---

## 2. Features Configuration

```typescript
interface TableFeatures {
  /** Enable column sorting */
  sorting?: boolean
  // Usage: sorting: true

  /** Enable per-column filtering */
  filtering?: boolean
  // Usage: filtering: true

  /** Enable global search across all columns */
  globalSearch?: boolean
  // Usage: globalSearch: true

  /** Enable pagination */
  pagination?: boolean | {
    /** Initial page size */
    pageSize?: number
    /** Available page size options */
    pageSizeOptions?: number[]
  }
  // Usage:
  // Simple: pagination: true
  // Advanced: pagination: { pageSize: 20, pageSizeOptions: [10, 20, 50, 100] }

  /** Enable row selection with checkboxes */
  rowSelection?: boolean | {
    /** Allow multiple row selection */
    multiple?: boolean
    /** Preserve selection across page changes */
    preserveSelection?: boolean
  }
  // Usage:
  // Simple: rowSelection: true
  // Advanced: rowSelection: { multiple: true, preserveSelection: true }

  /** Enable inline cell editing */
  inlineEditing?: boolean | {
    /** Edit mode - cell or row */
    mode?: 'cell' | 'row'
  }
  // Usage:
  // Simple: inlineEditing: true
  // Advanced: inlineEditing: { mode: 'cell' }

  /** Enable bulk operations */
  bulkOperations?: boolean | string[]
  // Usage: bulkOperations: true

  /** Enable data export */
  export?: boolean | {
    /** Export formats */
    formats?: Array<'csv' | 'json' | 'excel'>
  }
  // Usage:
  // Simple: export: true
  // Advanced: export: { formats: ['csv', 'json'] }

  /** Enable column visibility toggle */
  columnVisibility?: boolean
  // Usage: columnVisibility: true

  /** Enable column reordering */
  columnReorder?: boolean
  // Usage: columnReorder: true

  /** Enable row expansion */
  rowExpansion?: boolean
  // Usage: rowExpansion: true
}
```

---

## 3. Column Definition

```typescript
interface ColumnDefinition<TRow = any, TValue = any> {
  // ============================================
  // BASIC PROPERTIES
  // ============================================

  /** Column key - must match data property */
  key: keyof TRow | string
  // Example: key: 'name'

  /** Column header text */
  header: string
  // Example: header: 'Product Name'

  /** Translation key for header (i18n) */
  headerTranslationKey?: string
  // Example: headerTranslationKey: 'products.columns.name'

  /** Column data type */
  type?: FieldType
  // Options: 'text' | 'number' | 'date' | 'datetime' | 'boolean' |
  //          'currency' | 'select' | 'multi-select' | 'email' | 'url' | 'custom'

  // ============================================
  // DISPLAY & RENDERING
  // ============================================

  /** Custom cell renderer */
  cell?: (props: CellRenderProps<TRow, TValue>) => ReactNode
  // Example: cell: ({ value }) => <Badge>{value}</Badge>

  /** Column width */
  width?: number | string
  // Example: width: 200 or width: '20%'

  /** Minimum column width */
  minWidth?: number
  // Example: minWidth: 100

  /** Maximum column width */
  maxWidth?: number
  // Example: maxWidth: 500

  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  // Example: align: 'right' (for prices)

  /** Hide column by default */
  hidden?: boolean
  // Example: hidden: true

  // ============================================
  // FEATURES
  // ============================================

  /** Enable sorting for this column */
  sortable?: boolean
  // Default: true

  /** Enable filtering for this column */
  filterable?: boolean
  // Default: true

  /** Enable inline editing for this column */
  editable?: boolean
  // Default: false

  // ============================================
  // SELECT/MULTI-SELECT OPTIONS
  // ============================================

  /** Options for select/multi-select types */
  options?: SelectOption[]
  // Example: options: [
  //   { value: 'active', label: 'Active', translationKey: 'statuses.active' }
  // ]

  /** Translation namespace for cell values (i18n) */
  valueTranslationKey?: string
  // Example: valueTranslationKey: 'categories'
  // Translates: 'electronics' → t('categories.electronics')

  // ============================================
  // FORMATTING & PARSING
  // ============================================

  /** Format value for display */
  format?: (value: any) => string
  // Example: format: (value) => `$${value.toFixed(2)}`

  /** Parse string input to value */
  parse?: (value: string) => any
  // Example: parse: (value) => parseFloat(value)

  // ============================================
  // VALIDATION (for inline editing)
  // ============================================

  validation?: {
    /** Field is required */
    required?: boolean
    /** Minimum value (for numbers) */
    min?: number
    /** Maximum value (for numbers) */
    max?: number
    /** Regex pattern */
    pattern?: RegExp
    /** Custom validation function */
    custom?: (value: any) => boolean | string
  }
  // Example: validation: { required: true, min: 0, max: 100 }
}
```

---

## 4. Select Option Configuration

```typescript
interface SelectOption {
  /** Option value (sent to API) */
  value: string | number
  // Example: value: 'electronics'

  /** Display label */
  label: string
  // Example: label: 'Electronics'

  /** Translation key for label (i18n) */
  translationKey?: string
  // Example: translationKey: 'categories.electronics'

  /** Disable this option */
  disabled?: boolean
  // Example: disabled: true
}
```

---

## 5. i18n Labels Configuration

```typescript
interface TableLabels {
  // Pagination labels
  show?: string                    // Default: 'Show'
  entries?: string                 // Default: 'entries'
  showing?: string                 // Default: 'Showing'
  to?: string                      // Default: 'to'
  of?: string                      // Default: 'of'
  page?: string                    // Default: 'Page'

  // Action labels
  exportCSV?: string               // Default: 'Export CSV'
  columns?: string                 // Default: 'Columns'
  manageColumns?: string           // Default: 'Manage Columns'
  showAll?: string                 // Default: 'Show All'
  apply?: string                   // Default: 'Apply'
  clear?: string                   // Default: 'Clear'
  cancel?: string                  // Default: 'Cancel'
  saveAllChanges?: string          // Default: 'Save All Changes'

  // Filter labels
  filterBy?: string                // Default: 'Filter by'
  search?: string                  // Default: 'Search'
  searchPlaceholder?: string       // Default: 'Search...'
  min?: string                     // Default: 'Min'
  max?: string                     // Default: 'Max'
  from?: string                    // Default: 'From'
  all?: string                     // Default: 'All'
  yes?: string                     // Default: 'Yes'
  no?: string                      // Default: 'No'
  selectValue?: string             // Default: 'Select value...'

  // Editing labels
  selected?: string                // Default: 'Selected'
  availableOptions?: string        // Default: 'Available options'

  // Helper text
  dragToReorder?: string           // Default: 'Drag items to reorder columns'
  clearSearch?: string             // Default: 'Clear search'
}
```

---

## 6. Bulk Action Configuration

```typescript
interface BulkAction<TRow = any> {
  /** Button label */
  label: string
  // Example: 'Delete Selected'

  /** Button variant */
  variant?: 'primary' | 'outline' | 'destructive' | 'success'
  // Example: variant: 'destructive'

  /** Button icon */
  icon?: ReactNode
  // Example: icon: <TrashIcon />

  /** Click handler - receives selected rows */
  onClick: (selectedRows: TRow[]) => void
  // Example: onClick: (rows) => deleteRows(rows)

  /** Disable condition */
  disabled?: (selectedRows: TRow[]) => boolean
  // Example: disabled: (rows) => rows.length === 0
}
```

---

## 7. Data Source Interface

```typescript
interface IDataSource<TRow = any> {
  /** Fetch data with pagination/sorting/filtering/search */
  fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>>

  /** Create new row (optional - for inline editing) */
  create?(data: Partial<TRow>): Promise<TRow>

  /** Update row (optional - for inline editing) */
  update?(id: string, data: Partial<TRow>): Promise<TRow>

  /** Delete row (optional - for bulk actions) */
  delete?(id: string): Promise<void>

  /** Bulk delete (optional - for bulk actions) */
  bulkDelete?(ids: string[]): Promise<BulkOperationResult>

  /** Batch update (optional - for bulk editing) */
  batchUpdate?(updates: Record<string, Partial<TRow>>): Promise<BulkOperationResult>
}

interface DataSourceParams {
  pagination?: {
    page: number           // 1-indexed
    pageSize: number
  }
  sorting?: Array<{
    field: string
    direction: 'asc' | 'desc'
  }>
  filters?: Record<string, any>
  search?: string
}

interface DataSourceResult<TRow> {
  data: TRow[]           // Current page data
  total: number          // Total items count
  page: number           // Current page
  pageSize: number       // Items per page
  totalPages: number     // Total pages
}
```

---

## 8. Complete Working Example

```typescript
import {
  AdvancedTablePlugin,
  MockDataSource,
  ManualSchemaProvider,
  type ColumnDefinition,
} from '@/components/shared/tables/AdvancedTable'
import { useTableTranslations } from '@/lib/table-i18n'

interface Product {
  id: string
  name: string
  category: string      // API returns key: 'electronics'
  price: number
  inStock: boolean
}

export function ProductsTable() {
  const { translateColumn, getTableLabels } = useTableTranslations()

  // 1. Define columns
  const columns: ColumnDefinition<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      headerTranslationKey: 'products.columns.name',
      type: 'text',
      sortable: true,
      filterable: true,
      editable: true,
      width: 250
    },
    {
      key: 'category',
      header: 'Category',
      headerTranslationKey: 'products.columns.category',
      type: 'select',
      valueTranslationKey: 'categories',
      options: [
        {
          value: 'electronics',
          label: 'Electronics',
          translationKey: 'categories.electronics'
        },
        {
          value: 'clothing',
          label: 'Clothing',
          translationKey: 'categories.clothing'
        }
      ],
      cell: ({ value }) => <Badge>{translateValue(value, 'categories')}</Badge>
    },
    {
      key: 'price',
      header: 'Price',
      headerTranslationKey: 'products.columns.price',
      type: 'currency',
      align: 'right',
      format: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'inStock',
      header: 'In Stock',
      headerTranslationKey: 'products.columns.stock',
      type: 'boolean',
      align: 'center'
    }
  ]

  // 2. Translate columns
  const translatedColumns = columns.map(translateColumn)

  // 3. Create data source
  const dataSource = new MockDataSource({
    data: products,
    getRowId: (row) => row.id
  })

  // 4. Create schema
  const schema = new ManualSchemaProvider(translatedColumns)

  // 5. Get translated labels
  const labels = getTableLabels()

  // 6. Render table
  return (
    <AdvancedTablePlugin
      // Required
      dataSource={dataSource}
      schemaProvider={schema}

      // i18n
      labels={labels}

      // Features
      features={{
        sorting: true,
        filtering: true,
        globalSearch: true,
        pagination: {
          pageSize: 20,
          pageSizeOptions: [10, 20, 50, 100]
        },
        rowSelection: {
          multiple: true,
          preserveSelection: false
        },
        inlineEditing: true,
        columnVisibility: true,
        export: true
      }}

      // Inline editing
      editableColumns={['name', 'category', 'price', 'inStock']}
      onCellEdit={async (rowId, columnId, value) => {
        console.log('Edited:', { rowId, columnId, value })
      }}
      onSaveRow={async (rowId, changes) => {
        await api.updateProduct(rowId, changes)
      }}
      onCancelRow={(rowId) => {
        console.log('Cancelled:', rowId)
      }}
      onSaveAll={async (allChanges) => {
        await api.batchUpdateProducts(allChanges)
      }}
      bulkSaveLabel="Save All Changes"

      // Bulk actions
      bulkActions={[
        {
          label: 'Delete Selected',
          variant: 'destructive',
          icon: <TrashIcon />,
          onClick: async (rows) => {
            if (confirm(`Delete ${rows.length} products?`)) {
              await api.deleteProducts(rows.map(r => r.id))
            }
          }
        },
        {
          label: 'Export Selected',
          variant: 'outline',
          icon: <DownloadIcon />,
          onClick: (rows) => {
            exportToCSV(rows, 'selected-products.csv')
          }
        }
      ]}

      // Search & export
      searchPlaceholder="Search products..."
      exportFileName="products"
      onExport={(data) => {
        // Custom export handler
        exportToExcel(data, 'products.xlsx')
      }}

      // Row interactions
      getRowId={(row) => row.id}
      onRowClick={(row) => {
        router.push(`/products/${row.id}`)
      }}
      onSelectionChange={(selectedIds) => {
        console.log('Selected:', selectedIds)
      }}

      // Styling
      className="custom-table-class"
    />
  )
}
```

---

## 9. Quick Configuration Templates

### Minimal (Read-Only)
```typescript
<AdvancedTablePlugin
  dataSource={dataSource}
  schemaProvider={schema}
/>
```

### Standard (Most Common)
```typescript
<AdvancedTablePlugin
  dataSource={dataSource}
  schemaProvider={schema}
  labels={getTableLabels()}
  features={{
    sorting: true,
    filtering: true,
    globalSearch: true,
    pagination: { pageSize: 20 },
    columnVisibility: true,
    export: true
  }}
  searchPlaceholder="Search..."
  exportFileName="data"
/>
```

### Full-Featured (Everything)
```typescript
<AdvancedTablePlugin
  dataSource={dataSource}
  schemaProvider={schema}
  labels={getTableLabels()}
  features={{
    sorting: true,
    filtering: true,
    globalSearch: true,
    pagination: { pageSize: 20, pageSizeOptions: [10, 20, 50] },
    rowSelection: { multiple: true },
    inlineEditing: true,
    columnVisibility: true,
    export: true
  }}
  editableColumns={['name', 'price']}
  onCellEdit={handleCellEdit}
  onSaveRow={handleSaveRow}
  onCancelRow={handleCancelRow}
  onSaveAll={handleSaveAll}
  bulkActions={[
    { label: 'Delete', variant: 'destructive', icon: <TrashIcon />, onClick: handleDelete }
  ]}
  searchPlaceholder="Search..."
  exportFileName="data"
  onRowClick={handleRowClick}
  getRowId={(row) => row.id}
/>
```

---

## 10. Migration Checklist

When migrating from another table library:

- [ ] Replace data fetching with `IDataSource` implementation
- [ ] Define columns using `ColumnDefinition[]`
- [ ] Add `headerTranslationKey` for i18n headers
- [ ] Add `translationKey` to select options
- [ ] Use `useTableTranslations()` hook
- [ ] Pass `labels` prop for UI translation
- [ ] Replace pagination logic with `pagination` feature
- [ ] Replace sorting with `sorting` feature
- [ ] Replace filtering with `filtering` feature
- [ ] Move row selection to `rowSelection` feature
- [ ] Move bulk actions to `bulkActions` prop
- [ ] Test all features work correctly
- [ ] Verify translations in all languages
- [ ] Test mobile responsiveness

---

## Summary

The AdvancedTable requires only 2 props to work:
1. `dataSource` - where data comes from
2. `schemaProvider` - how to display it

Everything else is optional and configurable!

**For production**, also add:
3. `labels` - for i18n
4. `features` - for enabling features
5. Column `translationKey` properties - for translating data

That's it! You now have a fully-featured, production-ready, internationalized data table! 🎉
