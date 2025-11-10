# AdvancedTableEnhanced - Clean API Examples

## Design Philosophy

The new API is designed to be:
- **Intuitive**: Easy to understand and use
- **Composable**: Build complex configs from simple parts
- **Type-safe**: Full TypeScript support
- **Flexible**: Support all use cases
- **Minimal**: Only configure what you need

## Basic Usage

### Simple Read-Only Table

```typescript
import { AdvancedTable } from '@/components/shared/tables'
import { TablePresets } from './types'

function SimpleTable() {
  return (
    <AdvancedTable
      columns={columns}
      data={data}
      {...TablePresets.simple()}
    />
  )
}
```

### Full-Featured Data Table

```typescript
function DataTable() {
  return (
    <AdvancedTable
      columns={columns}
      data={data}
      features={{
        sorting: true,
        filtering: true,
        globalSearch: true,
        pagination: true,
        rowSelection: true,
        export: true,
      }}
    />
  )
}
```

## Server-Side Table

```typescript
function IngredientTable({ accountId }: { accountId: string }) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['ingredients', accountId, pagination, sorting, filters, search],
    queryFn: () => fetchIngredients({ accountId, pagination, sorting, filters, search }),
  })

  return (
    <AdvancedTable
      columns={columns}
      data={data?.items || []}

      server={{
        enabled: true,
        isLoading,
        totalItems: data?.total,
        totalPages: data?.totalPages,
      }}

      state={{
        controlled: {
          pagination: [pagination, setPagination],
          sorting: [sorting, setSorting],
          filters: [filters, setFilters],
          search: [search, setSearch],
        },
      }}
    />
  )
}
```

## Editable Table

```typescript
function EditableEmployeeTable() {
  const [editedRows, setEditedRows] = useState<Record<string, Partial<Employee>>>({})

  return (
    <AdvancedTable
      columns={columns}
      data={employees}

      editing={{
        enabled: true,
        mode: 'cell',
        columns: [
          { id: 'name', type: 'text' },
          { id: 'salary', type: 'number' },
          { id: 'department', type: 'select', options: departmentOptions },
          { id: 'status', type: 'select', options: statusOptions },
          { id: 'skills', type: 'multiselect', options: skillOptions },
        ],
        onEdit: (rowId, columnId, value) => {
          setEditedRows(prev => ({
            ...prev,
            [rowId]: { ...prev[rowId], [columnId]: value }
          }))
        },
        bulk: {
          enabled: true,
          onSaveAll: async (changes) => {
            await saveChanges(changes)
            setEditedRows({})
          },
          onCancelAll: () => setEditedRows({}),
        },
      }}

      styling={{
        row: {
          className: (row) => editedRows[row.id] ? 'bg-yellow-50' : '',
        },
      }}
    />
  )
}
```

## With Actions

```typescript
function ProductTable() {
  return (
    <AdvancedTable
      columns={columns}
      data={products}

      actions={{
        // Row-level actions
        row: {
          onClick: (product) => router.push(`/products/${product.id}`),
          menu: [
            {
              label: 'Edit',
              icon: <PencilIcon />,
              onClick: (product) => openEditModal(product),
            },
            {
              label: 'Delete',
              icon: <TrashIcon />,
              variant: 'destructive',
              onClick: async (product) => {
                if (confirm('Delete this product?')) {
                  await deleteProduct(product.id)
                }
              },
            },
          ],
        },

        // Bulk actions
        bulk: [
          {
            label: 'Delete Selected',
            variant: 'destructive',
            confirmMessage: (rows) => `Delete ${rows.length} products?`,
            onClick: async (rows) => {
              await bulkDelete(rows.map(r => r.id))
            },
          },
          {
            label: 'Export Selected',
            onClick: (rows) => exportToCSV(rows),
          },
        ],

        // Custom toolbar actions
        custom: [
          {
            label: 'Import',
            icon: <UploadIcon />,
            onClick: () => openImportModal(),
          },
        ],
      }}
    />
  )
}
```

## Using Config Builder

```typescript
import { createTableConfig } from '@/components/shared/tables'

function AdvancedTable() {
  const config = createTableConfig<Employee>()
    .columns(columns)
    .data(employees)
    .features({
      sorting: true,
      filtering: true,
      rowSelection: true,
    })
    .server({
      enabled: true,
      isLoading,
      totalPages,
    })
    .editing({
      enabled: true,
      columns: ['salary', 'department'],
      onEdit: handleEdit,
    })
    .actions({
      bulk: [
        { label: 'Delete', onClick: handleBulkDelete },
      ],
    })
    .styling({
      table: { striped: true, hoverable: true },
      row: { highlightSelected: true },
    })
    .build()

  return <AdvancedTable {...config} />
}
```

## Custom UI Configuration

```typescript
function CustomUITable() {
  return (
    <AdvancedTable
      columns={columns}
      data={data}

      ui={{
        toolbar: {
          search: {
            placeholder: 'Search employees...',
            debounce: 500,
          },
          filters: {
            preset: [
              {
                columnId: 'department',
                label: 'Department',
                type: 'select',
                options: departmentOptions,
              },
              {
                columnId: 'status',
                label: 'Status',
                type: 'select',
                options: statusOptions,
              },
              {
                columnId: 'salary',
                label: 'Salary Range',
                type: 'range',
              },
            ],
          },
          export: {
            filename: 'employees-export',
            formats: ['csv', 'xlsx'],
          },
        },

        pagination: {
          position: 'both',
          pageSize: 20,
          pageSizeOptions: [10, 20, 50, 100, 200],
        },

        states: {
          loading: <CustomLoader />,
          empty: <CustomEmptyState />,
        },

        density: 'comfortable',
      }}
    />
  )
}
```

## State Persistence

```typescript
function PersistentTable() {
  return (
    <AdvancedTable
      columns={columns}
      data={data}

      state={{
        persistence: {
          enabled: true,
          key: 'employees-table',
          fields: ['sorting', 'filters', 'visibility', 'pageSize'],
        },
        onChange: (state) => {
          console.log('Table state changed:', state)
        },
      }}
    />
  )
}
```

## Combining Presets

```typescript
import { TablePresets } from '@/components/shared/tables'

function CombinedTable() {
  return (
    <AdvancedTable
      columns={columns}
      data={data}

      // Start with preset
      {...TablePresets.dataTable()}

      // Add server-side
      {...TablePresets.serverSide({
        enabled: true,
        isLoading,
        totalPages
      })}

      // Add editing
      {...TablePresets.editable(['name', 'email'])}

      // Override specific settings
      ui={{
        pagination: {
          pageSize: 50,
        },
      }}
    />
  )
}
```

## Real-World Example: Ingredient Table

```typescript
function IngredientTable({ accountId }: { accountId: string }) {
  // State
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  const [search, setSearch] = useState('')
  const [editedRows, setEditedRows] = useState<Record<string, Partial<Ingredient>>>({})

  // Data fetching
  const { data, isLoading } = useQuery({
    queryKey: ['ingredients', accountId, pagination, sorting, filters, search],
    queryFn: () => fetchIngredients({ accountId, pagination, sorting, filters, search }),
  })

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ingredient> }) =>
      updateIngredient(accountId, id, data),
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteIngredients(accountId, ids),
  })

  return (
    <AdvancedTable
      // Data
      columns={ingredientColumns}
      data={data?.items || []}

      // Features
      features={{
        sorting: true,
        filtering: true,
        globalSearch: true,
        pagination: true,
        rowSelection: true,
        export: true,
      }}

      // Server-side
      server={{
        enabled: true,
        isLoading,
        totalItems: data?.total,
        totalPages: data?.totalPages,
      }}

      // State management
      state={{
        controlled: {
          pagination: [pagination, setPagination],
          sorting: [sorting, setSorting],
          filters: [filters, setFilters],
          search: [search, setSearch],
        },
        persistence: {
          enabled: true,
          key: `ingredients-${accountId}`,
          fields: ['pageSize', 'visibility'],
        },
      }}

      // Editing
      editing={{
        enabled: true,
        mode: 'cell',
        columns: [
          { id: 'name', type: 'text' },
          { id: 'currentStock', type: 'number' },
          { id: 'costPerUnitCents', type: 'number' },
          { id: 'supplier', type: 'text' },
          { id: 'category', type: 'select', options: categoryOptions },
          { id: 'status', type: 'select', options: statusOptions },
        ],
        onEdit: (rowId, columnId, value) => {
          setEditedRows(prev => ({
            ...prev,
            [rowId]: { ...prev[rowId], [columnId]: value },
          }))
        },
        bulk: {
          enabled: true,
          onSaveAll: async (changes) => {
            await Promise.all(
              Object.entries(changes).map(([id, data]) =>
                updateMutation.mutateAsync({ id, data })
              )
            )
            setEditedRows({})
          },
          onCancelAll: () => setEditedRows({}),
          saveLabel: `Save Changes (${Object.keys(editedRows).length})`,
        },
      }}

      // Actions
      actions={{
        bulk: [
          {
            label: 'Delete Selected',
            variant: 'destructive',
            icon: <TrashIcon />,
            confirmMessage: (rows) =>
              `Delete ${rows.length} ingredient(s)?`,
            onClick: async (rows) => {
              await deleteMutation.mutateAsync(rows.map(r => r.id))
            },
          },
          {
            label: 'Export Selected',
            onClick: (rows) => exportIngredients(rows),
          },
        ],
      }}

      // UI
      ui={{
        toolbar: {
          search: {
            placeholder: 'Search ingredients...',
          },
          filters: {
            preset: [
              {
                columnId: 'category',
                label: 'Category',
                type: 'select',
                options: categoryOptions,
              },
              {
                columnId: 'status',
                label: 'Status',
                type: 'select',
                options: statusOptions,
              },
            ],
          },
          export: {
            filename: 'ingredients',
          },
        },
        states: {
          empty: (
            <div className="py-12 text-center">
              <p className="text-gray-500">No ingredients found</p>
            </div>
          ),
        },
      }}

      // Styling
      styling={{
        row: {
          className: (row) =>
            editedRows[row.id] ? 'bg-yellow-50 dark:bg-yellow-900/10' : '',
          highlightSelected: true,
        },
        table: {
          striped: true,
          hoverable: true,
        },
      }}
    />
  )
}
```

## Migration Guide

### Old API
```typescript
<AdvancedTableEnhanced
  columns={columns}
  data={data}
  enableSorting
  enableFiltering
  enableGlobalFilter
  enablePagination
  enableRowSelection
  serverSide={{
    enabled: true,
    isLoading,
    totalPages,
  }}
  bulkActions={[...]}
  searchPlaceholder="Search..."
  onCellEdit={handleEdit}
  editableColumns={['col1', 'col2']}
  showBulkSave
  onSaveAll={handleSaveAll}
  onCancelAll={handleCancelAll}
/>
```

### New API
```typescript
<AdvancedTable
  columns={columns}
  data={data}

  features={{
    sorting: true,
    filtering: true,
    globalSearch: true,
    pagination: true,
    rowSelection: true,
  }}

  server={{
    enabled: true,
    isLoading,
    totalPages,
  }}

  actions={{
    bulk: [...],
  }}

  ui={{
    toolbar: {
      search: {
        placeholder: 'Search...',
      },
    },
  }}

  editing={{
    enabled: true,
    columns: ['col1', 'col2'],
    onEdit: handleEdit,
    bulk: {
      enabled: true,
      onSaveAll: handleSaveAll,
      onCancelAll: handleCancelAll,
    },
  }}
/>
```

## Benefits

1. **Grouped Configuration**: Related settings are grouped together
2. **Better Discoverability**: Autocomplete works better with nested objects
3. **Type Safety**: Each config group has its own types
4. **Flexibility**: Easy to add new features without bloating the main interface
5. **Composability**: Can create and share preset configurations
6. **Backwards Compatible**: Can support both APIs during migration
