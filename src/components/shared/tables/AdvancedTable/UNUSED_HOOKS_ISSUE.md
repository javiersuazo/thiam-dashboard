# Unused Hooks Issue

## Current Problem

The table has three custom hooks that are **imported but never used**:

```typescript
// AdvancedTablePlugin.tsx
import { useTableData } from './hooks/useTableData'
import { useTableEditing } from './hooks/useTableEditing'
import { useTableSelection } from './hooks/useTableSelection'
```

These hooks are **imported but their logic is duplicated inline** in the component.

---

## Why This Happened

During development, the logic was initially written inline in `AdvancedTablePlugin` for rapid prototyping. The hooks were created later to extract and organize this logic following SOLID principles (Single Responsibility), but the refactoring to use them was never completed.

---

## Current State

### What's Duplicated

**1. Data Fetching Logic** (lines 82-199 in AdvancedTablePlugin.tsx)
```typescript
// Duplicated in component:
const [data, setData] = useState<TRow[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<Error | null>(null)

const fetchData = useCallback(async () => {
  setIsLoading(true)
  setError(null)
  try {
    const result = await dataSource.fetch(params)
    setData(result.data)
    setTotal(result.total)
  } catch (err) {
    setError(err as Error)
  } finally {
    setIsLoading(false)
  }
}, [dataSource, tableState])

// Should use:
const { data, isLoading, error } = useTableData(dataSource, tableState)
```

**2. Edit State Management** (lines 85, 105-158 in AdvancedTablePlugin.tsx)
```typescript
// Duplicated in component:
const [editedRows, setEditedRows] = useState<Record<string, Partial<TRow>>>({})

const handleCellEdit = useCallback(async (rowId, columnId, value) => {
  setEditedRows(prev => ({
    ...prev,
    [rowId]: { ...prev[rowId], [columnId]: value }
  }))
  if (onCellEdit) await onCellEdit(rowId, columnId, value)
}, [onCellEdit])

// Should use:
const editing = useTableEditing({
  onCellEdit,
  onSaveRow,
  onSaveAll,
  onCancelRow,
  onCancelAll
})
```

**3. Selection State** (lines 96 in tableState)
```typescript
// Duplicated in component:
const [tableState, setTableState] = useState<TableState>({
  selection: new Set<string>(),
  // ...
})

// Should use:
const selection = useTableSelection(tableState, data, getRowId)
```

---

## Two Options to Fix

### Option 1: Use the Hooks (Cleaner, More Maintainable) ✅

**Benefits:**
- Cleaner component code
- Better separation of concerns
- Easier to test each hook independently
- Follows SOLID principles
- Reusable hooks for other table implementations

**Refactored Component:**
```typescript
export function AdvancedTablePlugin<TRow = any>({
  dataSource,
  schemaProvider,
  features = {},
  onCellEdit,
  onSaveRow,
  onSaveAll,
  onCancelRow,
  onCancelAll,
  getRowId = (row: any) => row.id,
  // ... other props
}: AdvancedTablePluginProps<TRow>) {
  // Use extracted hooks instead of inline logic
  const { data, isLoading, error, total, totalPages, fetchData } = useTableData(
    dataSource,
    tableState
  )

  const editing = useTableEditing({
    onCellEdit,
    onSaveRow,
    onSaveAll,
    onCancelRow,
    onCancelAll
  })

  const selection = useTableSelection(tableState, data, getRowId)

  // Rest of component uses hook results
  return (
    <div>
      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <Table data={data} />
      )}
    </div>
  )
}
```

**Estimated Refactoring Time:** 1-2 hours

**Code Reduction:** ~150 lines removed from main component

### Option 2: Remove the Unused Hooks (Simpler, Less Ideal) ❌

**Benefits:**
- Keeps code as-is
- No refactoring needed

**Drawbacks:**
- Larger, less maintainable component
- Harder to test
- Violates Single Responsibility Principle
- Keeps technical debt

**Action:**
```bash
# Remove unused hook files
rm src/components/shared/tables/AdvancedTable/hooks/useTableData.ts
rm src/components/shared/tables/AdvancedTable/hooks/useTableEditing.ts
rm src/components/shared/tables/AdvancedTable/hooks/useTableSelection.ts
rm src/components/shared/tables/AdvancedTable/hooks/index.ts

# Remove imports from AdvancedTablePlugin.tsx
# Remove exports from index.ts
```

---

## Recommendation: Option 1 (Use the Hooks)

**Why:**
1. **Better Architecture** - Follows SOLID principles
2. **Easier Testing** - Test hooks independently
3. **Cleaner Code** - Main component becomes ~150 lines shorter
4. **Reusability** - Hooks can be used in custom table implementations
5. **Future-Proof** - Easier to extend and maintain

**Trade-off:**
- Requires 1-2 hours of refactoring
- Potential for introducing bugs (mitigated by thorough testing)

---

## If We Refactor to Use Hooks

### useTableData Hook

**Purpose:** Handle all data fetching logic

```typescript
export function useTableData<TRow>(
  dataSource: IDataSource<TRow>,
  tableState: TableState
) {
  const [data, setData] = useState<TRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params: DataSourceParams = {
        pagination: tableState.pagination,
        sorting: tableState.sorting,
        filters: tableState.filters,
        search: tableState.search
      }

      const result = await dataSource.fetch(params)

      setData(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [dataSource, tableState])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    total,
    totalPages,
    fetchData
  }
}
```

**Benefits:**
- All fetching logic in one place
- Easy to mock for testing
- Can be used in other table implementations

### useTableEditing Hook

**Purpose:** Handle all edit state management

```typescript
export function useTableEditing<TRow>({
  onCellEdit,
  onSaveRow,
  onSaveAll,
  onCancelRow,
  onCancelAll
}: UseTableEditingOptions<TRow>) {
  const [editedRows, setEditedRows] = useState<Record<string, Partial<TRow>>>({})

  const handleCellEdit = useCallback(
    async (rowId: string, columnId: string, value: any) => {
      setEditedRows(prev => ({
        ...prev,
        [rowId]: { ...prev[rowId], [columnId]: value }
      }))

      if (onCellEdit) {
        await onCellEdit(rowId, columnId, value)
      }
    },
    [onCellEdit]
  )

  const handleSaveRow = useCallback(
    async (rowId: string) => {
      const changes = editedRows[rowId]
      if (!changes) return

      if (onSaveRow) {
        await onSaveRow(rowId, changes)
      }

      setEditedRows(prev => {
        const newEdited = { ...prev }
        delete newEdited[rowId]
        return newEdited
      })
    },
    [editedRows, onSaveRow]
  )

  const handleSaveAll = useCallback(async () => {
    if (onSaveAll) {
      await onSaveAll(editedRows)
    }
    setEditedRows({})
  }, [editedRows, onSaveAll])

  const handleCancelRow = useCallback(
    (rowId: string) => {
      if (onCancelRow) {
        onCancelRow(rowId)
      }
      setEditedRows(prev => {
        const newEdited = { ...prev }
        delete newEdited[rowId]
        return newEdited
      })
    },
    [onCancelRow]
  )

  const handleCancelAll = useCallback(() => {
    if (onCancelAll) {
      onCancelAll()
    }
    setEditedRows({})
  }, [onCancelAll])

  return {
    editedRows,
    hasEdits: Object.keys(editedRows).length > 0,
    handleCellEdit,
    handleSaveRow,
    handleSaveAll,
    handleCancelRow,
    handleCancelAll
  }
}
```

**Benefits:**
- All edit logic isolated
- Easy to test edit flows
- Clear API for edit operations

### useTableSelection Hook

**Purpose:** Handle row selection state

```typescript
export function useTableSelection<TRow>(
  tableState: TableState,
  data: TRow[],
  getRowId: (row: TRow) => string
) {
  const selectedIds = Array.from(tableState.selection)
  const selectedRows = useMemo(() => {
    return data.filter(row => tableState.selection.has(getRowId(row)))
  }, [data, tableState.selection, getRowId])

  const allSelected = useMemo(() => {
    return data.length > 0 && data.every(row => tableState.selection.has(getRowId(row)))
  }, [data, tableState.selection, getRowId])

  const someSelected = useMemo(() => {
    return data.some(row => tableState.selection.has(getRowId(row))) && !allSelected
  }, [data, tableState.selection, getRowId, allSelected])

  return {
    selectedIds,
    selectedRows,
    selectedCount: selectedIds.length,
    allSelected,
    someSelected
  }
}
```

**Benefits:**
- Selection logic centralized
- Easy to compute derived state
- Memoized for performance

---

## Testing Strategy If We Refactor

### Test useTableData Hook
```typescript
describe('useTableData', () => {
  it('fetches data on mount', async () => {
    const mockDataSource = { fetch: jest.fn().mockResolvedValue({ data: [], total: 0 }) }
    const { result } = renderHook(() => useTableData(mockDataSource, tableState))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual([])
  })

  it('handles errors', async () => {
    const mockDataSource = { fetch: jest.fn().mockRejectedValue(new Error('API Error')) }
    const { result } = renderHook(() => useTableData(mockDataSource, tableState))

    await waitFor(() => expect(result.current.error).toBeTruthy())
  })
})
```

### Test useTableEditing Hook
```typescript
describe('useTableEditing', () => {
  it('tracks cell edits', async () => {
    const onCellEdit = jest.fn()
    const { result } = renderHook(() => useTableEditing({ onCellEdit }))

    act(() => {
      result.current.handleCellEdit('row1', 'name', 'New Name')
    })

    expect(result.current.editedRows).toEqual({
      row1: { name: 'New Name' }
    })
    expect(onCellEdit).toHaveBeenCalledWith('row1', 'name', 'New Name')
  })
})
```

---

## Decision Needed

**Should we:**
1. ✅ **Refactor to use hooks** (recommended) - Better architecture, more maintainable
2. ❌ **Remove unused hooks** - Simpler but keeps technical debt

**My recommendation:** Option 1 - Refactor to use hooks. It's worth the 1-2 hours of work for the long-term benefits.

Would you like me to proceed with the refactoring?
