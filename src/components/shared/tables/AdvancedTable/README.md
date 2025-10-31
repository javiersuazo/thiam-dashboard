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

For tables with large datasets, implement server-side pagination, sorting, filtering, and search:

```tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AdvancedTableEnhanced } from '@/components/shared/tables/AdvancedTable/AdvancedTableEnhanced'
import type { SortingState, ColumnFiltersState } from '@tanstack/react-table'

interface Employee {
  id: string
  name: string
  email: string
  department: string
  status: 'active' | 'inactive' | 'pending'
  salary: number
}

interface EmployeesResponse {
  data: Employee[]
  total: number
  page: number
  pageSize: number
}

export function EmployeesTable() {
  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Fetch data with all parameters
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['employees', pagination, sorting, columnFilters, globalFilter],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        pageSize: String(pagination.pageSize),
      })

      // Add sorting
      if (sorting.length > 0) {
        params.append('sortBy', sorting[0].id)
        params.append('sortOrder', sorting[0].desc ? 'desc' : 'asc')
      }

      // Add global search
      if (globalFilter) {
        params.append('search', globalFilter)
      }

      // Add column filters
      columnFilters.forEach(filter => {
        if (filter.value) {
          // Handle different filter types
          if (typeof filter.value === 'object' && 'min' in filter.value) {
            // Range filter
            if (filter.value.min) params.append(`${filter.id}_min`, String(filter.value.min))
            if (filter.value.max) params.append(`${filter.id}_max`, String(filter.value.max))
          } else if (Array.isArray(filter.value)) {
            // Multiselect filter - send as comma-separated string
            params.append(filter.id, filter.value.join(','))
            // Alternative: send as multiple parameters
            // filter.value.forEach(val => params.append(filter.id, val))
          } else {
            // Simple filter (text, select)
            params.append(filter.id, String(filter.value))
          }
        }
      })

      const response = await fetch(`/api/employees?${params}`)
      return response.json() as Promise<EmployeesResponse>
    },
    keepPreviousData: true, // Keep showing old data while fetching new data
  })

  return (
    <AdvancedTableEnhanced
      columns={columns}
      data={data?.data || []}
      enableSorting
      enableFiltering
      enableGlobalFilter
      enablePagination
      serverSide={{
        enabled: true,
        isLoading,
        isFetching,
        totalPages: Math.ceil((data?.total || 0) / pagination.pageSize),
      }}
      onStateChange={(state) => {
        if (state.sorting) setSorting(state.sorting)
        if (state.columnFilters) setColumnFilters(state.columnFilters)
        if (state.pagination) setPagination(state.pagination)
        if (state.globalFilter !== undefined) setGlobalFilter(state.globalFilter)
      }}
      initialState={{
        sorting,
        columnFilters,
        pagination,
      }}
    />
  )
}
```

### Backend API Expectations

⚠️ **Important**: Query parameter names are **automatically generated** from your **column `accessorKey`** values.

#### How Column Schema Maps to Query Parameters

**Your Column Definition:**
```tsx
const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',        // ← This becomes ?name=...
    header: 'Name',
  },
  {
    accessorKey: 'department',  // ← This becomes ?department=...
    header: 'Department',
    meta: { filterType: 'select' },
  },
  {
    accessorKey: 'salary',      // ← This becomes ?salary_min=... and ?salary_max=...
    header: 'Salary',
    meta: { filterType: 'range' },
  },
  {
    accessorKey: 'skills',      // ← This becomes ?skills=...
    header: 'Skills',
    meta: { editType: 'multiselect' },
  },
]
```

**Generated Query Parameters:**
```
?name=john                              ← From accessorKey: 'name'
&department=Engineering                 ← From accessorKey: 'department'
&salary_min=80000&salary_max=150000    ← From accessorKey: 'salary' (range adds _min/_max)
&skills=JavaScript,TypeScript,React     ← From accessorKey: 'skills' (array becomes comma-separated)
```

**The table automatically:**
1. Takes the `accessorKey` from your column definition
2. Uses it as the query parameter name
3. Sends the filter value with that parameter name

**So if you change your column:**
```tsx
// Change this:
{ accessorKey: 'department' }

// Query parameters change automatically:
// Before: ?department=Engineering
// After:  ?dept=Engineering (if you changed to accessorKey: 'dept')
```

#### Complete Flow Example

**1. You Define Columns:**
```tsx
const columns: ColumnDef<Employee>[] = [
  { accessorKey: 'fullName', header: 'Name' },           // ← fullName
  { accessorKey: 'dept', header: 'Department' },         // ← dept
  { accessorKey: 'yearlySalary', header: 'Salary' },     // ← yearlySalary
]
```

**2. User Applies Filters in the Table:**
- Searches for "john"
- Filters by dept = "Engineering"
- Filters by yearlySalary = $80k-$150k
- Sorts by yearlySalary descending
- Goes to page 2

**3. Table Automatically Generates This URL:**
```
GET /api/employees?page=2&pageSize=20&sortBy=yearlySalary&sortOrder=desc&search=john&dept=Engineering&yearlySalary_min=80000&yearlySalary_max=150000
```
Notice:
- `dept` (NOT `department`) - matches your `accessorKey`
- `yearlySalary` (NOT `salary`) - matches your `accessorKey`
- `fullName` is searched via global `search` parameter

**4. Your Backend Receives:**
```typescript
req.query = {
  page: '2',
  pageSize: '20',
  sortBy: 'yearlySalary',       // ← Your accessorKey
  sortOrder: 'desc',
  search: 'john',
  dept: 'Engineering',          // ← Your accessorKey
  yearlySalary_min: '80000',    // ← Your accessorKey + _min
  yearlySalary_max: '150000',   // ← Your accessorKey + _max
}
```

**5. You Must Map to Database Columns:**
```typescript
// Map frontend accessorKey to actual database column names
const columnMap = {
  fullName: 'full_name',      // frontend → database
  dept: 'department',         // frontend → database
  yearlySalary: 'salary',     // frontend → database
}

// Apply filters
if (req.query.dept) {
  query = query.where(columnMap.dept, req.query.dept)
  // Becomes: WHERE department = 'Engineering'
}

if (req.query.yearlySalary_min) {
  query = query.where(columnMap.yearlySalary, '>=', req.query.yearlySalary_min)
  // Becomes: WHERE salary >= 80000
}
```

**Key Takeaway:**
- ✅ Frontend uses `accessorKey` for query parameters
- ✅ Backend receives those exact `accessorKey` names
- ✅ Backend maps them to actual database column names
- ✅ Keep `accessorKey` names consistent with your API contract

Your backend should handle these query parameters:

#### Pagination
```
?page=1&pageSize=20
```

#### Sorting
```
?sortBy=name&sortOrder=asc
```
- `sortBy`: Column ID to sort by
- `sortOrder`: `asc` or `desc`

#### Global Search
```
?search=john
```
- Searches across all searchable columns

#### Column Filters

**Text Filter:**
```
?name=john
```

**Select Filter (Single Value):**
```
?status=active
```

**Multiselect Filter (Multiple Values):**
```
?skills=JavaScript,TypeScript,React
```
Or as separate parameters:
```
?skills=JavaScript&skills=TypeScript&skills=React
```

**Range Filter:**
```
?salary_min=50000&salary_max=100000
```

**Multiple Different Filters:**
```
?department=Engineering&status=active&skills=JavaScript,TypeScript&salary_min=80000
```

#### Complete Example Requests

**Basic Request (Pagination + Sorting):**
```
GET /api/employees?page=1&pageSize=20&sortBy=name&sortOrder=asc
```

**With Global Search:**
```
GET /api/employees?page=1&pageSize=20&search=john
```

**With Single Filters:**
```
GET /api/employees?page=1&pageSize=20&department=Engineering&status=active
```

**With Range Filter:**
```
GET /api/employees?page=1&pageSize=20&salary_min=80000&salary_max=150000
```

**With Multiselect Filter:**
```
GET /api/employees?page=1&pageSize=20&skills=JavaScript,TypeScript,React
```

**Complete Example (All Features Combined):**
```
GET /api/employees?page=2&pageSize=20&sortBy=salary&sortOrder=desc&search=john&department=Engineering&status=active&skills=JavaScript,TypeScript,React&salary_min=80000&salary_max=150000
```

**Breaking Down the Complete Example:**
- `page=2` - Get page 2
- `pageSize=20` - 20 items per page
- `sortBy=salary` - Sort by salary column
- `sortOrder=desc` - Descending order (highest first)
- `search=john` - Global search for "john" across all columns
- `department=Engineering` - Filter: only Engineering department
- `status=active` - Filter: only active employees
- `skills=JavaScript,TypeScript,React` - Filter: employees with ANY of these skills
- `salary_min=80000` - Filter: salary >= 80,000
- `salary_max=150000` - Filter: salary <= 150,000

**Result:** Shows active Engineering employees with salaries between $80k-$150k who have JavaScript, TypeScript, or React skills, matching "john" in their name/email, sorted by salary (highest first), page 2 of results (20 per page)

#### Expected Response Format
```json
{
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "department": "Engineering",
      "status": "active",
      "salary": 120000
    }
  ],
  "total": 156,
  "page": 2,
  "pageSize": 20
}
```

### Backend Implementation Example (Node.js/Express)

```typescript
// GET /api/employees
app.get('/api/employees', async (req, res) => {
  const {
    page = '1',
    pageSize = '20',
    sortBy,
    sortOrder = 'asc',
    search,
    // Column filters
    department,
    status,
    salary_min,
    salary_max,
    skills, // Multiselect filter
  } = req.query

  // Build database query
  let query = db.from('employees')

  // Apply global search
  if (search) {
    query = query.where(builder => {
      builder
        .where('name', 'ilike', `%${search}%`)
        .orWhere('email', 'ilike', `%${search}%`)
    })
  }

  // Apply column filters
  if (department) {
    query = query.where('department', department)
  }
  if (status) {
    query = query.where('status', status)
  }
  if (salary_min) {
    query = query.where('salary', '>=', Number(salary_min))
  }
  if (salary_max) {
    query = query.where('salary', '<=', Number(salary_max))
  }

  // Handle multiselect filter (array of values)
  if (skills) {
    // Split comma-separated values
    const skillsArray = Array.isArray(skills) ? skills : skills.split(',')

    // Option 1: Match ANY of the selected skills (OR condition)
    // Use this if skills is a JSON column or array type
    query = query.where(builder => {
      skillsArray.forEach(skill => {
        builder.orWhereRaw('skills @> ?', [JSON.stringify([skill])])
      })
    })

    // Option 2: If using a junction table (many-to-many)
    // query = query.whereIn('id', function() {
    //   this.select('employee_id')
    //     .from('employee_skills')
    //     .whereIn('skill_name', skillsArray)
    // })

    // Option 3: If skills is stored as comma-separated string
    // query = query.where(builder => {
    //   skillsArray.forEach(skill => {
    //     builder.orWhere('skills', 'like', `%${skill}%`)
    //   })
    // })
  }

  // Get total count for pagination
  const totalQuery = query.clone()
  const [{ count }] = await totalQuery.count('* as count')

  // Apply sorting
  if (sortBy) {
    query = query.orderBy(sortBy, sortOrder)
  }

  // Apply pagination
  const offset = (Number(page) - 1) * Number(pageSize)
  query = query.limit(Number(pageSize)).offset(offset)

  // Execute query
  const data = await query

  res.json({
    data,
    total: Number(count),
    page: Number(page),
    pageSize: Number(pageSize),
  })
})
```

### Multiselect Filters - Special Considerations

Multiselect filters send **arrays of values** and require special handling:

#### Frontend
```tsx
// When user selects: JavaScript, TypeScript, React
// The filter value becomes: ['JavaScript', 'TypeScript', 'React']

// Column definition
{
  accessorKey: 'skills',
  header: 'Skills',
  meta: {
    filterType: 'multiselect', // Not yet implemented for column filters
    editType: 'multiselect',   // Available for inline editing
    editOptions: [
      { label: 'JavaScript', value: 'JavaScript' },
      { label: 'TypeScript', value: 'TypeScript' },
      { label: 'React', value: 'React' },
    ],
  },
}

// The array is sent as comma-separated: ?skills=JavaScript,TypeScript,React
```

#### Backend Handling Options

**Option 1: JSON/Array Column (PostgreSQL)**
```sql
-- Database schema
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  skills JSONB -- or TEXT[]
);

-- Query
SELECT * FROM employees
WHERE skills @> '["JavaScript"]'
   OR skills @> '["TypeScript"]';
```

**Option 2: Junction Table (Many-to-Many)**
```sql
-- Database schema
CREATE TABLE employees (id UUID PRIMARY KEY);
CREATE TABLE skills (id UUID PRIMARY KEY, name TEXT);
CREATE TABLE employee_skills (
  employee_id UUID REFERENCES employees(id),
  skill_id UUID REFERENCES skills(id)
);

-- Query
SELECT DISTINCT e.* FROM employees e
JOIN employee_skills es ON e.id = es.employee_id
JOIN skills s ON es.skill_id = s.id
WHERE s.name IN ('JavaScript', 'TypeScript', 'React');
```

**Option 3: Comma-Separated String**
```sql
-- Database schema (not recommended for production)
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  skills TEXT -- "JavaScript,TypeScript,React"
);

-- Query
SELECT * FROM employees
WHERE skills LIKE '%JavaScript%'
   OR skills LIKE '%TypeScript%';
```

#### Which Approach to Use?

- **JSON/Array Column**: Best for PostgreSQL, easy to query, good performance with indexes
- **Junction Table**: Most flexible, best for relational databases, supports additional metadata
- **Comma-Separated**: Simplest but least flexible, avoid for production

### Tips for Backend Integration

1. **Debouncing**: The table automatically debounces search input (300ms) to reduce API calls
2. **Query Keys**: React Query caches based on all parameters - changing any filter/sort/search triggers a new request
3. **Loading States**: Use `isLoading` for initial load, `isFetching` for background updates
4. **Error Handling**: Wrap API calls in try-catch and show user-friendly error messages
5. **Performance**: Add database indexes on commonly filtered/sorted columns (including JSON paths for array columns)
6. **Security**: Always validate and sanitize query parameters on the backend
7. **Rate Limiting**: Consider implementing rate limiting for search endpoints
8. **Multiselect Filters**: Use OR logic (match ANY selected value) rather than AND logic for better UX

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
