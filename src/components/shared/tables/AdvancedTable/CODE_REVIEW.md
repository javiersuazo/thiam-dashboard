# Code Review: AdvancedTablePlugin.tsx

## 🔴 Critical Issues

### 1. **Unused Hook Imports (Lines 27-29)**

**Issue:** Three hooks are imported but never used anywhere in the component.

```typescript
// ❌ UNUSED - Remove these imports
import { useTableData } from './hooks/useTableData'
import { useTableEditing } from './hooks/useTableEditing'
import { useTableSelection } from './hooks/useTableSelection'
```

**Impact:**
- Bundle size increased unnecessarily
- Confusing for developers (why are they imported?)
- Misleading - suggests they should be used

**Recommendation:**
- **Option 1:** Remove the imports and the hook files
- **Option 2:** Refactor to actually use them (see UNUSED_HOOKS_ISSUE.md)

**Fix:**
```typescript
// Remove lines 27-29
```

---

### 2. **Unused Import: `useRef` (Line 3)**

**Issue:** `useRef` is imported but never used.

```typescript
// ❌ UNUSED
import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
```

**Wait, actually it IS used!** Lines 341-342:
```typescript
const previousSelectionRef = useRef<Set<string>>(new Set())
const previousStateRef = useRef<Record<string, boolean>>({})
```

**Status:** ✅ This is fine, NOT unused.

---

### 3. **Unused TanStack Table Models (Lines 6-9)**

**Issue:** Three TanStack Table imports might not be needed with manual mode.

```typescript
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,    // ❓ Might be unused with manualFiltering
  getPaginationRowModel,  // ❓ Might be unused with manualPagination
  getSortedRowModel,      // ❓ Might be unused with manualSorting
  useReactTable,
} from '@tanstack/react-table'
```

**Analysis:**
```typescript
// Line 386-388: Conditionally used
getFilteredRowModel: features.filtering !== false ? getFilteredRowModel() : undefined,
getSortedRowModel: features.sorting !== false ? getSortedRowModel() : undefined,
getPaginationRowModel: features.pagination !== false ? getPaginationRowModel() : undefined,

// BUT Lines 390-392: Manual mode enabled!
manualPagination: true,
manualSorting: true,
manualFiltering: true,
```

**Problem:** When `manual*` is `true`, TanStack Table doesn't use these models. They're for **client-side** operations only.

**Impact:**
- Bundle includes unused code
- Confusing - why import if manual mode?

**Recommendation:**
Remove these imports since we use manual mode (server-side operations):

```typescript
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

// Remove from lines 386-388:
const table = useReactTable({
  data,
  columns: tanstackColumns,
  getRowId: (row, index) => getRowId(row),
  getCoreRowModel: getCoreRowModel(),
  // ❌ Remove these - not used with manual mode:
  // getFilteredRowModel: features.filtering !== false ? getFilteredRowModel() : undefined,
  // getSortedRowModel: features.sorting !== false ? getSortedRowModel() : undefined,
  // getPaginationRowModel: features.pagination !== false ? getPaginationRowModel() : undefined,

  enableRowSelection: features.rowSelection !== false,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  // ...
})
```

---

### 4. **Excessive Console Logging (Multiple Lines)**

**Issue:** Lots of console.log statements left in production code.

**Locations:**
- Line 176: `console.log('🔄 Fetching data with params:', params)`
- Line 185: `console.error('Failed to fetch data:', err)`
- Lines 415-453: Multiple filter debugging logs
- Lines 675-700: FilterPopover debugging logs

**Impact:**
- Performance overhead
- Exposes internal logic to users
- Clutters browser console
- Not production-ready

**Recommendation:**
Remove all console logs or wrap in development-only check:

```typescript
// Development logging utility
const isDev = process.env.NODE_ENV === 'development'
const log = {
  debug: (...args: any[]) => isDev && console.log(...args),
  error: (...args: any[]) => console.error(...args), // Keep errors
}

// Usage:
log.debug('🔄 Fetching data with params:', params)
```

Or remove entirely for production.

---

## 🟡 Medium Issues

### 5. **Large Component (829 lines)**

**Issue:** Component is too large, violates Single Responsibility Principle.

**Current Structure:**
- Data fetching logic (lines 82-199)
- Edit state management (lines 85, 105-158)
- Selection state (lines 341-379)
- Column configuration (lines 218-315)
- Render logic (lines 558-828)

**Recommendation:**
Extract into custom hooks (which already exist!):

```typescript
export function AdvancedTablePlugin<TRow>({...props}) {
  // Use extracted hooks
  const { data, isLoading, error, total, totalPages } = useTableData(
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

  // Render...
}
```

**Benefit:** Component shrinks to ~500 lines, much more maintainable.

---

### 6. **Duplicate State Management (Lines 87-99)**

**Issue:** `tableState` contains some unused properties.

```typescript
const [tableState, setTableState] = useState<TableState>({
  pagination: { page: 1, pageSize: 20 },
  sorting: [],
  filters: {},
  search: '',
  selection: new Set<string>(),
  expandedRows: new Set<string>(),  // ❓ Never used
  editingCells: new Map<string, any>(),  // ❓ Never used
})
```

**Analysis:**
- `expandedRows` - Never read or written anywhere
- `editingCells` - Never read or written anywhere

**Recommendation:**
Remove unused state properties:

```typescript
const [tableState, setTableState] = useState<TableState>({
  pagination: { page: 1, pageSize: 20 },
  sorting: [],
  filters: {},
  search: '',
  selection: new Set<string>(),
  // Remove: expandedRows, editingCells
})
```

---

### 7. **Inconsistent Prop Interface (Line 41-60)**

**Issue:** Props accept both `ISchemaProvider` and plain columns.

```typescript
export interface AdvancedTablePluginProps<TRow = any> {
  dataSource: IDataSource<TRow>
  schemaProvider: ISchemaProvider<TRow>  // Interface
  // ... but could also accept plain columns array
}
```

**Current Usage:**
```typescript
// Line 161-162
const baseColumns = useMemo(() => {
  return schemaProvider.getColumns()
}, [schemaProvider])
```

**Problem:** If `schemaProvider` changes, memoization breaks. Should track columns directly.

**Recommendation:**
```typescript
const baseColumns = useMemo(() => {
  return schemaProvider.getColumns()
}, [schemaProvider.getColumns]) // ❌ This won't work - function reference changes

// Better:
const columns = useMemo(() => schemaProvider.getColumns(), [])
// Or track columns directly in props
```

---

### 8. **Plugin System Not Used (Lines 45, 66, 201-216, 579-581, 824-826)**

**Issue:** Plugin prop is defined but likely never used in practice.

```typescript
plugins?: ITableFeature<TRow>[]  // Who uses this?

// Lines 201-210: Plugin lifecycle
useEffect(() => {
  plugins.forEach(plugin => {
    plugin.onInit?.({...})
  })
}, [])

// Lines 579-581, 824-826: Plugin rendering
{plugins.map(plugin => (
  <div key={plugin.name}>{plugin.renderToolbar?.()}</div>
))}
```

**Questions:**
- Are there any actual plugin implementations?
- Is this feature documented?
- Is it tested?

**Recommendation:**
- If not used: Remove plugin system entirely
- If used: Document how to create plugins
- Add examples of plugin implementations

---

## 🟢 Minor Issues / Improvements

### 9. **Missing Prop Documentation (Line 41-60)**

**Issue:** Props interface lacks JSDoc comments.

**Recommendation:**
```typescript
export interface AdvancedTablePluginProps<TRow = any> {
  /** Data source for fetching, creating, updating data */
  dataSource: IDataSource<TRow>

  /** Schema provider for column definitions */
  schemaProvider: ISchemaProvider<TRow>

  /** Feature flags to enable/disable table features */
  features?: TableFeatures

  /** Custom plugins for extending table functionality */
  plugins?: ITableFeature<TRow>[]

  /** Bulk actions to show in toolbar when rows selected */
  bulkActions?: BulkAction<TRow>[]

  /** Function to extract unique ID from row */
  getRowId?: (row: TRow) => string

  // ... etc
}
```

---

### 10. **Magic Numbers (Lines 90-91, 554-555)**

**Issue:** Hardcoded values without explanation.

```typescript
// Line 90-91: Why 999999?
pageSize: features.pagination === false ? 999999 : ...

// Line 554-555: Duplicated calculation
const startIndex = (tableState.pagination.page - 1) * tableState.pagination.pageSize
const endIndex = Math.min(startIndex + tableState.pagination.pageSize, total)
```

**Recommendation:**
```typescript
const PAGINATION_DISABLED_PAGE_SIZE = Number.MAX_SAFE_INTEGER

pageSize: features.pagination === false ? PAGINATION_DISABLED_PAGE_SIZE : ...
```

---

### 11. **Inline Empty State SVG (Lines 534-546)**

**Issue:** Large SVG hardcoded inline.

**Recommendation:**
Extract to separate component or icon:

```typescript
import { EmptyTableIcon } from '@/icons'

const renderEmptyState = () => {
  if (emptyState) return emptyState

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <EmptyTableIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
      <p className="text-sm text-gray-500 dark:text-gray-400">No data found</p>
    </div>
  )
}
```

---

### 12. **Inconsistent Null Checks (Line 303)**

**Issue:** Inconsistent null/undefined handling.

```typescript
// Line 303
if (displayValue === null || displayValue === undefined) return '-'

// Could use:
if (displayValue == null) return '-'  // Checks both null and undefined
```

---

### 13. **Potential Memory Leak (Lines 341-342)**

**Issue:** Refs hold references to Sets/Objects that might grow indefinitely.

```typescript
const previousSelectionRef = useRef<Set<string>>(new Set())
const previousStateRef = useRef<Record<string, boolean>>({})
```

**Analysis:** These are used for memoization, should be fine. But worth monitoring if selection can grow very large.

---

### 14. **Missing Error Boundaries**

**Issue:** No error boundary to catch rendering errors.

**Recommendation:**
Wrap table in error boundary or add try-catch in render:

```typescript
try {
  return (
    <div className={...}>
      {/* table */}
    </div>
  )
} catch (error) {
  return (
    <div className="p-4 text-red-600">
      Error rendering table: {error.message}
    </div>
  )
}
```

---

## Summary of Unused Code

### ❌ Definitely Unused (Remove):
1. **Unused imports** (lines 27-29):
   - `useTableData`
   - `useTableEditing`
   - `useTableSelection`

2. **Unused TanStack models** (lines 7-9, 386-388):
   - `getFilteredRowModel`
   - `getPaginationRowModel`
   - `getSortedRowModel`
   (Not needed with manual mode)

3. **Unused state properties** (lines 97-98):
   - `expandedRows`
   - `editingCells`

4. **Console logs** (multiple lines):
   - Development debugging statements

### ❓ Possibly Unused (Verify):
1. **Plugin system** (lines 45, 66, 201-216, 579-581, 824-826):
   - Are plugins actually used?
   - Should be removed if not

2. **columnFiltersState** (lines 329-334):
   - Computed but maybe not used?

3. **Error state rendering** (lines 584-588):
   - Is error handling complete?

---

## Recommendations Priority

### High Priority (Do First):
1. ✅ Remove unused hook imports (lines 27-29)
2. ✅ Remove unused TanStack models (lines 7-9, 386-388)
3. ✅ Remove console.log statements
4. ✅ Remove unused state properties (lines 97-98)

### Medium Priority:
5. Refactor to use hooks (see UNUSED_HOOKS_ISSUE.md)
6. Add JSDoc comments to props
7. Decide on plugin system (remove or document)

### Low Priority:
8. Extract empty state SVG
9. Add error boundary
10. Extract magic numbers to constants

---

## Estimated Impact

**Removing unused code:**
- **Lines removed:** ~50 lines
- **Bundle size reduction:** ~5-10KB
- **Performance:** Minimal improvement
- **Maintainability:** Significantly better

**Refactoring to use hooks:**
- **Lines removed:** ~150 lines
- **Bundle size:** No change
- **Performance:** No change
- **Maintainability:** Much better
- **Testability:** Much better

---

## Action Items

### Immediate (Can do now):
```typescript
// 1. Remove unused hook imports
// Delete lines 27-29

// 2. Remove unused TanStack imports
import {
  flexRender,
  getCoreRowModel,
  // Remove: getFilteredRowModel, getPaginationRowModel, getSortedRowModel
  useReactTable,
} from '@tanstack/react-table'

// 3. Remove from table config (lines 386-388)
const table = useReactTable({
  data,
  columns: tanstackColumns,
  getRowId: (row, index) => getRowId(row),
  getCoreRowModel: getCoreRowModel(),
  // Remove these three lines
  enableRowSelection: features.rowSelection !== false,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  // ...
})

// 4. Clean up tableState (line 87-99)
const [tableState, setTableState] = useState<TableState>({
  pagination: { page: 1, pageSize: 20 },
  sorting: [],
  filters: {},
  search: '',
  selection: new Set<string>(),
  // Remove: expandedRows, editingCells
})

// 5. Remove/wrap console logs
// Either delete or wrap with isDev check
```

### Later (Needs refactoring):
- Refactor to use the three hooks
- Add JSDoc documentation
- Decide on plugin system

Would you like me to create a PR with these fixes?
