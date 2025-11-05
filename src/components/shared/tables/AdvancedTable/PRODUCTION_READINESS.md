# AdvancedTable Production Readiness Analysis

## Hardcoded Labels Audit

### Components with Hardcoded Text

#### 1. **TablePagination.tsx**
- ✅ `"Show"` - pagination label
- ✅ `"entries"` - pagination label
- ✅ `"Showing"` - pagination label
- ✅ `"to"` - pagination label
- ✅ `"of"` - pagination label
- ✅ `"Page"` - mobile pagination label

#### 2. **TableToolbar.tsx**
- ✅ `"Export CSV"` - export button
- ✅ `"Save All Changes"` - bulk save button (has `bulkSaveLabel` prop as override)
- ✅ `"Cancel"` - cancel button
- ⚠️ `searchPlaceholder = 'Search...'` - already has prop, good!

#### 3. **ColumnVisibilityDropdown.tsx**
- ✅ `"Columns"` - button label
- ✅ `"Manage Columns"` - dropdown header
- ✅ `"Show All"` - show all button
- ✅ `"💡 Drag items to reorder columns"` - helper text

#### 4. **FilterPopover.tsx**
- ✅ `"Filter by {column.header}"` - filter label (dynamic)
- ✅ `"Search {column.header}..."` - search placeholder (dynamic)
- ✅ `"Apply"` - apply button
- ✅ `"Clear"` - clear button
- ✅ `"Min"` - min input placeholder
- ✅ `"Max"` - max input placeholder
- ✅ `"From"` - from date placeholder
- ✅ `"To"` - to date placeholder
- ✅ `"All"`, `"Yes"`, `"No"` - boolean filter options
- ✅ `"Select value..."` - select placeholder

#### 5. **EditableCell.tsx**
- ✅ `"Selected ({count}):"` - selected items label
- ✅ `"Available options:"` - available options label
- ✅ `"Cancel"` - cancel button
- ✅ `"Apply"` - apply button (for multi-select)

#### 6. **AdvancedSearch.tsx**
- ⚠️ `searchPlaceholder = 'Search...'` - already has prop
- ✅ `"Clear search"` - clear button title

---

## API Requirements

### What the AdvancedTable Needs from API

#### **Core Data Source Interface** (`IDataSource`)

```typescript
interface DataSourceParams {
  pagination?: {
    page: number        // 1-indexed
    pageSize: number    // items per page
  }
  sorting?: Array<{
    field: string       // column key to sort by
    direction: 'asc' | 'desc'
  }>
  filters?: Record<string, any>  // column filters
  search?: string     // global search term
}

interface DataSourceResult<TRow> {
  data: TRow[]        // current page data
  total: number       // total items count
  page: number        // current page
  pageSize: number    // items per page
  totalPages: number  // total pages
}

interface IDataSource<TRow> {
  // Required: Fetch data with pagination, sorting, filtering, search
  fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>>

  // Optional: CRUD operations (only if editing is enabled)
  create?(data: Partial<TRow>): Promise<TRow>
  update?(id: string, data: Partial<TRow>): Promise<TRow>
  delete?(id: string): Promise<void>

  // Optional: Bulk operations (only if bulk actions are enabled)
  bulkDelete?(ids: string[]): Promise<BulkOperationResult>
  batchUpdate?(updates: Record<string, Partial<TRow>>): Promise<BulkOperationResult>
}
```

#### **API Endpoint Requirements**

**Minimum Required:**
- `GET /api/resource?page=1&pageSize=20&sort=name:asc&search=query&filter[status]=active`
  - Returns: `{ data: [...], total: 100, page: 1, pageSize: 20, totalPages: 5 }`

**For Full Features:**
- `POST /api/resource` - create new item
- `PUT /api/resource/:id` - update item
- `DELETE /api/resource/:id` - delete item
- `POST /api/resource/bulk-delete` - bulk delete
- `PATCH /api/resource/batch-update` - batch update

---

## Filter Types and Expected Values

```typescript
// Text filter
filters: { name: "john" }

// Select filter
filters: { category: "electronics" }

// Multi-select filter
filters: { tags: ["urgent", "featured"] }

// Numeric range filter
filters: { price: { min: 10, max: 100 } }

// Date range filter
filters: { createdAt: { from: "2024-01-01", to: "2024-12-31" } }

// Boolean filter
filters: { isActive: "true" } // or "false"
```

---

## Column Schema Requirements

```typescript
interface ColumnDefinition {
  key: string                    // Field name in data
  header: string                 // Display label
  type?: FieldType              // Data type for filtering/editing
  options?: Array<{             // For select/multi-select
    label: string
    value: string
  }>
  width?: number | string       // Column width
  sortable?: boolean           // Enable sorting (default: true)
  filterable?: boolean         // Enable filtering (default: true)
  editable?: boolean          // Enable inline editing (default: false)
  render?: (value: any, row: TRow) => React.ReactNode  // Custom cell renderer
}

type FieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multi-select'
  | 'boolean'
```

---

## Data Flexibility

### ✅ **The table CAN handle:**
1. **Any data structure** - as long as you provide:
   - `dataSource` implementing `IDataSource`
   - `schemaProvider` defining columns

2. **Dynamic columns** - define any columns you want:
   ```typescript
   columns: [
     { key: 'id', header: 'ID', type: 'text' },
     { key: 'name', header: 'Product Name', type: 'text' },
     { key: 'price', header: 'Price', type: 'currency' },
     // ... any fields from your data
   ]
   ```

3. **Custom data sources**:
   - `MockDataSource` - for testing/demos with local data
   - `APIDataSource` - for real API integration (you create this)
   - Custom implementation of `IDataSource`

4. **Nested data** - use custom `render` function:
   ```typescript
   {
     key: 'user',
     header: 'User',
     render: (value) => value?.name || 'N/A'
   }
   ```

### Example: Real API Integration

```typescript
class MyAPIDataSource implements IDataSource<MyDataType> {
  constructor(private apiClient: MyAPIClient) {}

  async fetch(params: DataSourceParams) {
    const response = await this.apiClient.get('/items', {
      params: {
        page: params.pagination?.page,
        pageSize: params.pagination?.pageSize,
        sort: params.sorting?.[0],
        search: params.search,
        ...params.filters
      }
    })

    return {
      data: response.data.items,
      total: response.data.total,
      page: response.data.page,
      pageSize: response.data.pageSize,
      totalPages: Math.ceil(response.data.total / response.data.pageSize)
    }
  }

  async create(data: Partial<MyDataType>) {
    const response = await this.apiClient.post('/items', data)
    return response.data
  }

  async update(id: string, data: Partial<MyDataType>) {
    const response = await this.apiClient.put(`/items/${id}`, data)
    return response.data
  }

  async delete(id: string) {
    await this.apiClient.delete(`/items/${id}`)
  }
}

// Usage
const dataSource = new MyAPIDataSource(apiClient)
<AdvancedTablePlugin
  dataSource={dataSource}
  schemaProvider={{ columns: myColumns }}
/>
```

---

## Internationalization (i18n) Recommendations

### Option 1: Add i18n props (Recommended)

```typescript
interface AdvancedTableLabels {
  // Pagination
  show?: string
  entries?: string
  showing?: string
  to?: string
  of?: string
  page?: string

  // Actions
  exportCSV?: string
  columns?: string
  manageColumns?: string
  showAll?: string
  apply?: string
  clear?: string
  cancel?: string
  saveAllChanges?: string

  // Filters
  filterBy?: string
  search?: string
  searchPlaceholder?: string
  min?: string
  max?: string
  from?: string
  to?: string
  all?: string
  yes?: string
  no?: string
  selectValue?: string

  // Editing
  selected?: string
  availableOptions?: string

  // Helpers
  dragToReorder?: string
  clearSearch?: string
}

// Props
interface AdvancedTableProps {
  labels?: AdvancedTableLabels
  // ... other props
}
```

### Option 2: Use next-intl (Current Project Pattern)

```typescript
import { useTranslations } from 'next-intl'

// In components
const t = useTranslations('AdvancedTable')

// Usage
<span>{t('show')}</span>
<span>{t('entries')}</span>
```

---

## Production Readiness Checklist

### ✅ **Ready for Production**
- [x] Dynamic data handling via `IDataSource`
- [x] Configurable columns via `schemaProvider`
- [x] Server-side pagination
- [x] Server-side sorting
- [x] Server-side filtering
- [x] Server-side search
- [x] Responsive design (mobile-friendly)
- [x] Dark mode support
- [x] TypeScript type safety
- [x] Error handling
- [x] Loading states
- [x] Accessible HTML (no hydration errors)

### ⚠️ **Needs Consideration**
- [ ] **i18n support** - hardcoded English labels
  - Solution: Add `labels` prop or integrate with `next-intl`
- [ ] **Export filename** - uses default `export.csv`
  - Has `exportFileName` prop, but could be more configurable
- [ ] **Date formatting** - may need locale-specific formatting
  - Currently uses native date inputs

### 🎯 **Optional Enhancements**
- [ ] Virtual scrolling for very large datasets (1000+ rows)
- [ ] Column resizing
- [ ] Column pinning (freeze columns)
- [ ] Advanced filter builder UI
- [ ] Saved filter presets
- [ ] Export to Excel/PDF
- [ ] Print view

---

## Minimal Setup Example

```typescript
// 1. Define your data type
interface Product {
  id: string
  name: string
  price: number
  category: string
  createdAt: string
}

// 2. Create data source
const dataSource = new MockDataSource({
  data: myProducts,
  getRowId: (row) => row.id
})

// 3. Define columns
const columns: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'name', header: 'Name', type: 'text' },
  { key: 'price', header: 'Price', type: 'currency' },
  { key: 'category', header: 'Category', type: 'select', options: categoryOptions },
  { key: 'createdAt', header: 'Created', type: 'date' },
]

// 4. Use the table
<AdvancedTablePlugin
  dataSource={dataSource}
  schemaProvider={{ columns }}
  features={{
    sorting: true,
    filtering: true,
    search: true,
    pagination: true,
    selection: true,
    columnVisibility: true,
    export: true,
  }}
/>
```

That's it! The table handles everything else automatically.
