# Advanced Table Component

A comprehensive, reusable table component built on TanStack Table v8, designed for the Thiam Dashboard. This component provides a feature-rich data table with backend integration, sorting, filtering, pagination, row selection, and bulk actions.

## Features

- ✅ **Server-Side Integration** - Built-in support for backend API pagination, sorting, and filtering
- ✅ **Sorting** - Multi-column sorting with visual indicators
- ✅ **Global Search** - Search across all columns
- ✅ **Column Filtering** - Per-column filter support
- ✅ **Pagination** - Customizable page sizes with elegant controls
- ✅ **Row Selection** - Single and multi-row selection with checkboxes
- ✅ **Bulk Actions** - Perform actions on multiple selected rows
- ✅ **Export** - CSV and JSON export functionality
- ✅ **Column Visibility** - Show/hide columns dynamically
- ✅ **Inline Editing** - Edit cells directly with multiple input types (text, number, select, multiselect, date)
- ✅ **Virtual Scrolling** - Handle 100k+ rows efficiently
- ✅ **Skeleton Loading** - Beautiful loading states with animated skeletons
- ✅ **Responsive** - Mobile-friendly with horizontal scrolling
- ✅ **Dark Mode** - Full support for light and dark themes
- ✅ **Loading States** - Built-in loading and empty state handling
- ✅ **Type Safe** - Full TypeScript support with generic types

## Installation

The component is already included in the project. No additional installation required.

## Basic Usage

### Client-Side Table (Static Data)

```tsx
'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { AdvancedTable } from '@/components/shared/tables/AdvancedTable'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export function UsersTable({ users }: { users: User[] }) {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Role',
      },
    ],
    []
  )

  return (
    <AdvancedTable
      columns={columns}
      data={users}
      enableSorting
      enableGlobalFilter
      enablePagination
    />
  )
}
```

### Server-Side Table (Backend Integration)

```tsx
'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { AdvancedTable, useServerTable, buildQueryParams } from '@/components/shared/tables/AdvancedTable'
import { api } from '@/lib/api'

interface Request {
  id: string
  customerName: string
  status: string
}

export function RequestsTable() {
  const {
    data,
    serverSideConfig,
    pagination,
    setPagination,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
  } = useServerTable<Request>({
    queryKey: ['requests', 'list'],
    queryFn: async (params) => {
      const queryParams = buildQueryParams(params)

      const { data: response, error } = await api.GET('/requests', {
        params: { query: queryParams },
      })

      if (error) throw new Error('Failed to fetch requests')

      return {
        data: response?.requests || [],
        total: response?.total || 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil((response?.total || 0) / params.pageSize),
      }
    },
  })

  const columns = useMemo<ColumnDef<Request>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
    ],
    []
  )

  return (
    <AdvancedTable
      columns={columns}
      data={data}
      serverSide={serverSideConfig}
      onStateChange={(state) => {
        if (state.sorting) setSorting(state.sorting)
        if (state.pagination) setPagination(state.pagination)
        if (state.globalFilter !== undefined) setGlobalFilter(state.globalFilter)
      }}
    />
  )
}
```

## Advanced Features

### Row Selection with Bulk Actions

```tsx
const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  // ... other columns
]

<AdvancedTable
  columns={columns}
  data={data}
  enableRowSelection
  enableMultiRowSelection
  bulkActions={[
    {
      label: 'Delete',
      variant: 'destructive',
      icon: <TrashIcon />,
      onClick: (selectedRows) => {
        console.log('Deleting:', selectedRows)
      },
    },
    {
      label: 'Export',
      variant: 'outline',
      onClick: (selectedRows) => {
        console.log('Exporting:', selectedRows)
      },
    },
  ]}
/>
```

### Custom Cell Rendering

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge color={status === 'active' ? 'success' : 'error'}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button onClick={() => editUser(row.original)}>
          <PencilIcon />
        </button>
        <button onClick={() => deleteUser(row.original)}>
          <TrashIcon />
        </button>
      </div>
    ),
  },
]
```

### Row Click Handler

```tsx
<AdvancedTable
  columns={columns}
  data={data}
  onRowClick={(row) => {
    router.push(`/users/${row.id}`)
  }}
/>
```

### Inline Editing

Enable inline editing for specific columns:

```tsx
const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: {
      editType: 'text', // Text input
    },
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    meta: {
      editType: 'number', // Number input
    },
  },
  {
    accessorKey: 'department',
    header: 'Department',
    meta: {
      editType: 'select', // Dropdown
      editOptions: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Product', value: 'Product' },
        { label: 'Design', value: 'Design' },
      ],
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      editType: 'select', // Dropdown
      editOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  },
  {
    accessorKey: 'skills',
    header: 'Skills',
    meta: {
      editType: 'multiselect', // Multiple selection
      editOptions: [
        { label: 'JavaScript', value: 'JavaScript' },
        { label: 'TypeScript', value: 'TypeScript' },
        { label: 'React', value: 'React' },
      ],
    },
  },
  {
    accessorKey: 'joinDate',
    header: 'Join Date',
    meta: {
      editType: 'date', // Date picker
    },
  },
]

<AdvancedTableEnhanced
  columns={columns}
  data={data}
  editableColumns={['name', 'salary', 'department', 'status', 'skills', 'joinDate']}
  onCellEdit={async (rowId, columnId, value) => {
    // Update backend
    await updateEmployee(rowId, { [columnId]: value })
  }}
/>
```

#### Bulk Edit Mode

Track multiple edits and save them all at once:

```tsx
const [editedRows, setEditedRows] = useState<Record<string, Partial<Employee>>>({})

const handleCellEdit = async (rowId: string, columnId: string, value: any) => {
  setEditedRows(prev => ({
    ...prev,
    [rowId]: { ...prev[rowId], [columnId]: value }
  }))
}

const handleSaveAll = async () => {
  // Save all changes to backend
  await Promise.all(
    Object.entries(editedRows).map(([id, changes]) =>
      updateEmployee(id, changes)
    )
  )
  setEditedRows({})
}

<AdvancedTableEnhanced
  columns={columns}
  data={data}
  editableColumns={['department', 'salary', 'status']}
  onCellEdit={handleCellEdit}
  showBulkSave={Object.keys(editedRows).length > 0}
  onSaveAll={handleSaveAll}
  onCancelAll={() => setEditedRows({})}
  bulkSaveLabel={`Save Changes (${Object.keys(editedRows).length})`}
  getRowClassName={(row) =>
    editedRows[row.id] ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
  }
/>
```

#### Supported Input Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | Single-line text input | Name, Description |
| `number` | Numeric input | Age, Salary, Quantity |
| `select` | Single-select dropdown | Department, Status |
| `multiselect` | Multiple-select with checkboxes | Skills, Tags, Categories |
| `date` | Date picker | Join Date, Birth Date |
| `datetime` | Date and time picker | Created At, Updated At |

### Column Filtering

Add filters to specific columns:

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  meta: {
    filterType: 'select', // 'text' | 'select' | 'range'
    filterOptions: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
}

{
  accessorKey: 'salary',
  header: 'Salary',
  meta: {
    filterType: 'range', // Min/Max range filter
  },
}

{
  accessorKey: 'name',
  header: 'Name',
  meta: {
    filterType: 'text', // Text search
  },
}
```

### Virtual Scrolling

For large datasets (10k+ rows), enable virtual scrolling:

```tsx
<AdvancedTableEnhanced
  columns={columns}
  data={largeDataset}
  enableVirtualization
  virtualizerOptions={{
    estimateSize: 50, // Row height in pixels
    overscan: 10, // Extra rows to render outside viewport
  }}
/>
```

## Props Reference

### AdvancedTableProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData>[]` | **Required** | Column definitions |
| `data` | `TData[]` | **Required** | Table data |
| `enableSorting` | `boolean` | `true` | Enable column sorting |
| `enableFiltering` | `boolean` | `true` | Enable column filters |
| `enableGlobalFilter` | `boolean` | `true` | Enable global search |
| `enablePagination` | `boolean` | `true` | Enable pagination |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `enableMultiRowSelection` | `boolean` | `true` | Allow multiple row selection |
| `serverSide` | `ServerSideConfig` | `undefined` | Server-side configuration |
| `bulkActions` | `BulkAction[]` | `[]` | Actions for selected rows |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `onRowClick` | `(row: TData) => void` | `undefined` | Row click handler |
| `defaultPageSize` | `number` | `10` | Initial page size |
| `pageSizeOptions` | `number[]` | `[5, 10, 20, 50]` | Available page sizes |
| `showSearch` | `boolean` | `true` | Show search input |
| `showPagination` | `boolean` | `true` | Show pagination controls |
| `showExport` | `boolean` | `true` | Show export button |
| `showRowsPerPage` | `boolean` | `true` | Show rows per page selector |
| `exportFileName` | `string` | `'export'` | Export file name |
| `onStateChange` | `(state) => void` | `undefined` | State change callback |

## useServerTable Hook

The `useServerTable` hook simplifies server-side table integration:

```tsx
const {
  data,              // Fetched data
  serverSideConfig,  // Config object for AdvancedTable
  pagination,        // Current pagination state
  setPagination,     // Update pagination
  sorting,           // Current sorting state
  setSorting,        // Update sorting
  globalFilter,      // Current search term
  setGlobalFilter,   // Update search
  refetch,           // Manually refetch data
  isLoading,         // Initial loading state
  isFetching,        // Background fetching state
  totalItems,        // Total number of items
  totalPages,        // Total number of pages
} = useServerTable({
  queryKey: ['resource', 'list'],
  queryFn: async (params) => {
    // Fetch from your API
    return {
      data: [],
      total: 0,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: 0,
    }
  },
})
```

## Backend Integration

The `buildQueryParams` utility converts table state to API query parameters:

```tsx
const queryParams = buildQueryParams({
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: 'john',
  filters: { status: 'active' },
})
// Result: { offset: '0', limit: '10', sort_by: 'createdAt', sort_order: 'desc', search: 'john', status: 'active' }
```

Expected backend response format:

```typescript
interface BackendResponse<T> {
  data: T[]           // Array of items
  total: number       // Total count of items
  page: number        // Current page number
  pageSize: number    // Items per page
  totalPages: number  // Total number of pages
}
```

## Styling

The table uses the admin template's existing design system:
- Border colors: `border-gray-100 dark:border-white/[0.05]`
- Background: `bg-white dark:bg-white/[0.03]`
- Text colors: `text-gray-800 dark:text-white/90`
- Brand colors: `brand-500` for active states

## Examples

See the test page at `/table-test` for a comprehensive example with all features enabled.

## Architecture

```
AdvancedTable/
├── types.ts                      # TypeScript interfaces
├── utils.ts                      # Helper functions (export, debounce)
├── useServerTable.ts             # Server-side hook
├── AdvancedTable.tsx             # Main component
├── components/
│   ├── TableToolbar.tsx          # Search, filters, bulk actions
│   └── TablePagination.tsx       # Pagination controls
└── index.ts                      # Public exports
```

## Best Practices

1. **Memoize columns** - Always wrap column definitions in `useMemo()`
2. **Use server-side for large datasets** - Client-side is fine for <1000 rows
3. **Implement proper loading states** - Use `isLoading` and `isFetching`
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Optimize re-renders** - Use `onStateChange` callback wisely
6. **Type everything** - Leverage TypeScript for better DX

## Troubleshooting

### Table not rendering
- Ensure `columns` and `data` are provided
- Check that columns are memoized with `useMemo()`

### Sorting not working
- Set `enableSorting={true}`
- Ensure column has valid `accessorKey`

### Server-side not updating
- Verify `onStateChange` is updating parent state
- Check that `serverSideConfig` is passed correctly

### Export not working
- Ensure data is an array of objects
- Check browser console for errors

## Support

For issues or questions:
1. Check this documentation
2. Review the test page example at `/table-test`
3. Refer to TanStack Table docs: https://tanstack.com/table/latest
