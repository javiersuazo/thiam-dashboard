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

Enable row selection and define actions that can be performed on multiple rows:

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

### Bulk Actions - Complete Examples

#### Bulk Delete with Confirmation

```tsx
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AdvancedTableEnhanced } from '@/components/shared/tables/AdvancedTable/AdvancedTableEnhanced'
import { TrashIcon } from '@/icons'
import { toast } from 'sonner'

interface Employee {
  id: string
  name: string
  email: string
  department: string
}

export function EmployeesTableWithBulkDelete() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedForDeletion, setSelectedForDeletion] = useState<Employee[]>([])
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch('/api/employees/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) throw new Error('Failed to delete employees')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees'])
      toast.success(`Successfully deleted ${selectedForDeletion.length} employees`)
      setShowDeleteModal(false)
      setSelectedForDeletion([])
    },
    onError: (error) => {
      toast.error('Failed to delete employees')
      console.error(error)
    },
  })

  const handleBulkDelete = (selectedRows: Employee[]) => {
    setSelectedForDeletion(selectedRows)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    const ids = selectedForDeletion.map(row => row.id)
    deleteMutation.mutate(ids)
  }

  return (
    <>
      <AdvancedTableEnhanced
        columns={columns}
        data={employees}
        enableRowSelection
        enableMultiRowSelection
        bulkActions={[
          {
            label: 'Delete Selected',
            variant: 'destructive',
            icon: <TrashIcon className="w-4 h-4" />,
            onClick: handleBulkDelete,
          },
        ]}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete {selectedForDeletion.length} Employees?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This action cannot be undone. The following employees will be permanently deleted:
            </p>
            <div className="max-h-48 overflow-y-auto mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              {selectedForDeletion.map(emp => (
                <div key={emp.id} className="text-sm text-gray-800 dark:text-white py-1">
                  • {emp.name} ({emp.email})
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={deleteMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

**Backend API for Bulk Delete (Node.js/Express):**

```typescript
// DELETE /api/employees/bulk-delete
app.delete('/api/employees/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty ids array' })
    }

    // Delete from database
    const result = await db('employees')
      .whereIn('id', ids)
      .delete()

    // Optional: Log the deletion for audit trail
    await db('audit_log').insert({
      action: 'BULK_DELETE',
      resource: 'employees',
      resource_ids: ids,
      user_id: req.user.id,
      timestamp: new Date(),
    })

    res.json({
      success: true,
      deletedCount: result,
      message: `Successfully deleted ${result} employees`,
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    res.status(500).json({ error: 'Failed to delete employees' })
  }
})
```

#### Bulk Edit - Update Status

```tsx
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AdvancedTableEnhanced } from '@/components/shared/tables/AdvancedTable/AdvancedTableEnhanced'
import { EditIcon } from '@/icons'
import { toast } from 'sonner'
import Select from '@/components/shared/form/Select'

interface Employee {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  department: string
}

export function EmployeesTableWithBulkEdit() {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState<Employee[]>([])
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'pending'>('active')
  const queryClient = useQueryClient()

  const editMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const response = await fetch('/api/employees/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updates: { status } }),
      })

      if (!response.ok) throw new Error('Failed to update employees')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees'])
      toast.success(`Successfully updated ${selectedForEdit.length} employees`)
      setShowEditModal(false)
      setSelectedForEdit([])
    },
    onError: (error) => {
      toast.error('Failed to update employees')
      console.error(error)
    },
  })

  const handleBulkEdit = (selectedRows: Employee[]) => {
    setSelectedForEdit(selectedRows)
    setShowEditModal(true)
  }

  const confirmEdit = () => {
    const ids = selectedForEdit.map(row => row.id)
    editMutation.mutate({ ids, status: newStatus })
  }

  return (
    <>
      <AdvancedTableEnhanced
        columns={columns}
        data={employees}
        enableRowSelection
        enableMultiRowSelection
        bulkActions={[
          {
            label: 'Change Status',
            variant: 'outline',
            icon: <EditIcon className="w-4 h-4" />,
            onClick: handleBulkEdit,
          },
        ]}
      />

      {/* Edit Status Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Update Status for {selectedForEdit.length} Employees
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select a new status to apply to all selected employees:
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Status
              </label>
              <Select
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                  { label: 'Pending', value: 'pending' },
                ]}
                defaultValue={newStatus}
                onChange={(value) => setNewStatus(value as any)}
                placeholder="Select status"
              />
            </div>

            <div className="max-h-32 overflow-y-auto mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Selected employees:</p>
              {selectedForEdit.map(emp => (
                <div key={emp.id} className="text-sm text-gray-800 dark:text-white py-1">
                  • {emp.name} <span className="text-gray-500">({emp.status} → {newStatus})</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={editMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
                disabled={editMutation.isLoading}
              >
                {editMutation.isLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

**Backend API for Bulk Update (Node.js/Express):**

```typescript
// PATCH /api/employees/bulk-update
app.patch('/api/employees/bulk-update', async (req, res) => {
  try {
    const { ids, updates } = req.body

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty ids array' })
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid updates object' })
    }

    // Validate allowed fields (whitelist approach)
    const allowedFields = ['status', 'department', 'role', 'salary']
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key))

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const safeUpdates = {}
    updateFields.forEach(field => {
      safeUpdates[field] = updates[field]
    })

    // Add updated_at timestamp
    safeUpdates.updated_at = new Date()

    // Update database
    const result = await db('employees')
      .whereIn('id', ids)
      .update(safeUpdates)

    // Optional: Log the update for audit trail
    await db('audit_log').insert({
      action: 'BULK_UPDATE',
      resource: 'employees',
      resource_ids: ids,
      changes: safeUpdates,
      user_id: req.user.id,
      timestamp: new Date(),
    })

    res.json({
      success: true,
      updatedCount: result,
      updates: safeUpdates,
      message: `Successfully updated ${result} employees`,
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    res.status(500).json({ error: 'Failed to update employees' })
  }
})
```

#### Bulk Edit - Multiple Fields

```tsx
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AdvancedTableEnhanced } from '@/components/shared/tables/AdvancedTable/AdvancedTableEnhanced'
import { EditIcon } from '@/icons'
import { toast } from 'sonner'
import Select from '@/components/shared/form/Select'
import Input from '@/components/shared/form/input/InputField'

interface Employee {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  department: string
  salary: number
}

export function EmployeesTableWithAdvancedBulkEdit() {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState<Employee[]>([])
  const [updates, setUpdates] = useState<Partial<Employee>>({})
  const queryClient = useQueryClient()

  const editMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Employee> }) => {
      const response = await fetch('/api/employees/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updates }),
      })

      if (!response.ok) throw new Error('Failed to update employees')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees'])
      toast.success(`Successfully updated ${selectedForEdit.length} employees`)
      setShowEditModal(false)
      setSelectedForEdit([])
      setUpdates({})
    },
    onError: (error) => {
      toast.error('Failed to update employees')
      console.error(error)
    },
  })

  const handleBulkEdit = (selectedRows: Employee[]) => {
    setSelectedForEdit(selectedRows)
    setShowEditModal(true)
  }

  const confirmEdit = () => {
    const ids = selectedForEdit.map(row => row.id)
    editMutation.mutate({ ids, updates })
  }

  const hasChanges = Object.keys(updates).length > 0

  return (
    <>
      <AdvancedTableEnhanced
        columns={columns}
        data={employees}
        enableRowSelection
        enableMultiRowSelection
        bulkActions={[
          {
            label: 'Edit Selected',
            variant: 'outline',
            icon: <EditIcon className="w-4 h-4" />,
            onClick: handleBulkEdit,
          },
        ]}
      />

      {/* Multi-Field Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Edit {selectedForEdit.length} Employees
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Only fill in the fields you want to update. Empty fields will not be changed.
            </p>

            <div className="space-y-4 mb-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status (Optional)
                </label>
                <Select
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                    { label: 'Pending', value: 'pending' },
                  ]}
                  value={updates.status}
                  onChange={(value) => setUpdates({ ...updates, status: value as any })}
                  placeholder="Leave unchanged"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department (Optional)
                </label>
                <Select
                  options={[
                    { label: 'Engineering', value: 'Engineering' },
                    { label: 'Product', value: 'Product' },
                    { label: 'Design', value: 'Design' },
                    { label: 'Sales', value: 'Sales' },
                  ]}
                  value={updates.department}
                  onChange={(value) => setUpdates({ ...updates, department: value })}
                  placeholder="Leave unchanged"
                />
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salary (Optional)
                </label>
                <Input
                  type="number"
                  value={updates.salary || ''}
                  onChange={(e) => setUpdates({ ...updates, salary: Number(e.target.value) })}
                  placeholder="Leave unchanged"
                />
              </div>
            </div>

            <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {selectedForEdit.length} employees selected:
              </p>
              <div className="max-h-32 overflow-y-auto">
                {selectedForEdit.map(emp => (
                  <div key={emp.id} className="text-sm text-gray-800 dark:text-white py-1">
                    • {emp.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setUpdates({})
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={editMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
                disabled={editMutation.isLoading || !hasChanges}
              >
                {editMutation.isLoading ? 'Updating...' : `Update ${selectedForEdit.length} Employees`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

#### Multiple Bulk Actions

```tsx
<AdvancedTableEnhanced
  columns={columns}
  data={employees}
  enableRowSelection
  enableMultiRowSelection
  bulkActions={[
    {
      label: 'Delete',
      variant: 'destructive',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: handleBulkDelete,
    },
    {
      label: 'Change Status',
      variant: 'outline',
      icon: <EditIcon className="w-4 h-4" />,
      onClick: handleBulkEdit,
    },
    {
      label: 'Export Selected',
      variant: 'outline',
      icon: <DownloadIcon className="w-4 h-4" />,
      onClick: (selectedRows) => {
        const csv = convertToCSV(selectedRows)
        downloadFile(csv, 'employees.csv')
      },
    },
    {
      label: 'Send Email',
      variant: 'default',
      icon: <MailIcon className="w-4 h-4" />,
      onClick: async (selectedRows) => {
        const emails = selectedRows.map(row => row.email)
        await sendBulkEmail(emails)
      },
    },
  ]}
/>
```

#### Complete Request Examples

**Bulk Delete Request:**
```
DELETE /api/employees/bulk-delete
Content-Type: application/json

{
  "ids": ["emp-1", "emp-2", "emp-3"]
}
```

**Bulk Update Request (Single Field):**
```
PATCH /api/employees/bulk-update
Content-Type: application/json

{
  "ids": ["emp-1", "emp-2", "emp-3"],
  "updates": {
    "status": "active"
  }
}
```

**Bulk Update Request (Multiple Fields):**
```
PATCH /api/employees/bulk-update
Content-Type: application/json

{
  "ids": ["emp-1", "emp-2", "emp-3"],
  "updates": {
    "status": "active",
    "department": "Engineering",
    "salary": 120000
  }
}
```

#### Best Practices for Bulk Actions

1. **Always Confirm Destructive Actions** - Show a confirmation modal for delete operations
2. **Show Preview of Changes** - Display what will be changed before applying
3. **Use Optimistic Updates** - Update UI immediately, rollback on error
4. **Provide Feedback** - Use toast notifications for success/error states
5. **Handle Partial Failures** - If some operations fail, inform the user which ones
6. **Audit Trail** - Log bulk operations for compliance and debugging
7. **Validate on Backend** - Never trust client-side validation alone
8. **Use Transactions** - Ensure all-or-nothing updates when possible
9. **Rate Limiting** - Limit bulk operation sizes to prevent abuse
10. **Permission Checks** - Verify user has permission for each affected resource

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

## Working with Auto-Generated API Types

The project uses `openapi-typescript` to automatically generate TypeScript types from your Swagger/OpenAPI documentation. This ensures your table components are always type-safe and in sync with your backend API.

### Updating API Types

Whenever your API changes, run this command to regenerate types:

```bash
# Make sure your API is running on localhost:8080
npm run api:update:local
```

This will:
1. Fetch the latest Swagger JSON from `http://localhost:8080/swagger/doc.json`
2. Convert it to OpenAPI 3.0 format
3. Generate TypeScript types in `src/lib/api/generated/schema.ts`

### Using Generated Types with Tables

The generated types work seamlessly with the AdvancedTable component:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { AdvancedTableEnhanced } from '@/components/shared/tables/AdvancedTable/AdvancedTableEnhanced'
import { api, type components } from '@/lib/api'

// Extract the response type from your API schema
type Account = components['schemas']['response.Account']

// Create a list response type
interface AccountsResponse {
  data: Account[]
  total: number
  page: number
  pageSize: number
}

export function AccountsTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Type-safe API call using generated types
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['accounts', pagination, sorting, columnFilters, globalFilter],
    queryFn: async () => {
      const { data, error } = await api.GET('/accounts', {
        params: {
          query: {
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
          },
        },
      })

      if (error) throw error

      // Transform to expected format
      return {
        data: data || [],
        total: data?.length || 0,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      } as AccountsResponse
    },
    keepPreviousData: true,
  })

  // Type-safe column definitions
  const columns = useMemo<ColumnDef<Account>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'name',
        header: 'Account Name',
        meta: {
          filterType: 'text',
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        meta: {
          filterType: 'select',
          filterOptions: [
            { label: 'Caterer', value: 'caterer' },
            { label: 'Customer', value: 'customer' },
          ],
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {status}
            </span>
          )
        },
        meta: {
          filterType: 'select',
          filterOptions: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
      },
    ],
    []
  )

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

### Type-Safe Bulk Actions with Generated Types

```tsx
import { api, type components } from '@/lib/api'

type Invoice = components['schemas']['response.Invoice']

export function InvoicesTableWithBulkActions() {
  const queryClient = useQueryClient()

  // Type-safe bulk delete
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await api.DELETE('/invoices/bulk', {
        body: { ids }, // TypeScript knows the exact shape of the request body
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices'])
      toast.success('Invoices deleted successfully')
    },
  })

  // Type-safe bulk update
  const updateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { data, error } = await api.PATCH('/invoices/bulk', {
        body: { ids, updates: { status } }, // Fully typed
      })

      if (error) throw error
      return data
    },
  })

  return (
    <AdvancedTableEnhanced
      columns={columns}
      data={invoices}
      enableRowSelection
      bulkActions={[
        {
          label: 'Delete',
          variant: 'destructive',
          onClick: (rows: Invoice[]) => {
            deleteMutation.mutate(rows.map(r => r.id))
          },
        },
        {
          label: 'Mark as Paid',
          variant: 'default',
          onClick: (rows: Invoice[]) => {
            updateMutation.mutate({
              ids: rows.map(r => r.id),
              status: 'paid',
            })
          },
        },
      ]}
    />
  )
}
```

### Extracting Types from API Schema

The generated schema file exports two main interfaces:

```tsx
import type { paths, components } from '@/lib/api/generated/schema'

// Extract request/response types from paths
type AccountListResponse = paths['/accounts']['get']['responses']['200']['content']['application/json']
type CreateAccountRequest = paths['/accounts']['post']['requestBody']['content']['application/json']

// Extract schema types directly
type Account = components['schemas']['response.Account']
type Invoice = components['schemas']['response.Invoice']
type PaymentMethod = components['schemas']['response.PaymentMethod']

// Use in your components
const columns: ColumnDef<Account>[] = [
  // TypeScript knows all properties of Account
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'type', header: 'Type' },
]
```

### Best Practices with Generated Types

1. **Always regenerate after API changes**
   ```bash
   npm run api:update:local
   ```

2. **Use type extraction instead of manual types**
   ```tsx
   // ✅ Good - Always in sync with API
   type User = components['schemas']['response.User']

   // ❌ Bad - Can get out of sync
   interface User {
     id: string
     name: string
   }
   ```

3. **Use the type-safe API client**
   ```tsx
   // ✅ Good - Full type safety
   const { data, error } = await api.GET('/accounts')

   // ❌ Bad - No type safety
   const response = await fetch('/api/accounts')
   ```

4. **Let TypeScript infer query parameters**
   ```tsx
   // TypeScript knows exactly what params are valid
   const { data } = await api.GET('/accounts', {
     params: {
       query: {
         limit: 10,    // ✅ Valid
         offset: 0,    // ✅ Valid
         invalid: 123, // ❌ TypeScript error
       },
     },
   })
   ```

5. **Add to your workflow**
   ```bash
   # Before starting development
   npm run api:update:local

   # Start dev server
   npm run dev
   ```

### Troubleshooting

**API not running:**
```bash
Error: connect ECONNREFUSED 127.0.0.1:8080
```
Make sure your API server is running on `http://localhost:8080` before running `npm run api:update:local`.

**Types out of sync:**
If you see TypeScript errors after API changes, regenerate types:
```bash
npm run api:update:local
```

**Can't find schema types:**
Ensure the import path is correct:
```tsx
import type { components } from '@/lib/api/generated/schema'
// or
import type { components } from '@/lib/api'
```

## Support

For issues or questions:
1. Check this documentation
2. Review the test page example at `/table-test`
3. Refer to TanStack Table docs: https://tanstack.com/table/latest
