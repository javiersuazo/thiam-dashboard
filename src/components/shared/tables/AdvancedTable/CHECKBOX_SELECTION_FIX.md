# Checkbox Selection Fix

## Issue
The header checkbox for "select all" wasn't working properly:
- Clicking it would select rows, but the header checkbox itself wouldn't show as checked
- Clicking it again wouldn't deselect all rows
- Only 9 out of 10 rows were being selected

## Root Cause

**The Problem**: Index-based vs ID-based selection mismatch

The `useTableSelection` hook was converting row IDs to array indices for the selection state:

```typescript
// WRONG - Converting IDs to indices
const state: Record<string, boolean> = {}
tableState.selection.forEach((id) => {
  const index = data.findIndex(row => getRowId(row) === id)
  if (index !== -1) {
    state[index] = true  // ❌ Using index as key
  }
})
```

But TanStack Table, when provided with a `getRowId` function, uses **row IDs as keys**, not indices:

```typescript
getRowId: (row, index) => getRowId(row)  // Returns string IDs like '1', '2', '3'
```

This caused a mismatch:
- Our state: `{ 0: true, 1: true, 2: true, ... }` (index-based)
- TanStack expects: `{ '1': true, '2': true, '3': true, ... }` (ID-based)

**The Confusion**: TanStack was treating row IDs ('1', '2', '3'...) as if they were indices, causing:
- Row ID '1' was skipped (no index 0 in TanStack's selection)
- Indices 1-9 mapped to row IDs '2'-'10'
- Index 10 was out of bounds

## Solution

Changed `useTableSelection` to use row IDs directly as keys instead of converting to indices:

### Before (Broken)
```typescript
const rowSelectionState = useMemo(() => {
  const state: Record<string, boolean> = {}
  tableState.selection.forEach((id) => {
    const index = data.findIndex(row => getRowId(row) === id)
    if (index !== -1) {
      state[index] = true  // ❌ Index-based
    }
  })
  return state
}, [tableState.selection, data, getRowId])

// Handler also used indices
const selectedIds = new Set<string>()
Object.keys(newSelection).forEach((indexStr) => {
  const index = parseInt(indexStr, 10)
  if (newSelection[indexStr] && currentData[index]) {
    selectedIds.add(rowIdGetter(currentData[index]))  // ❌ Converting index back to ID
  }
})
```

### After (Fixed)
```typescript
const rowSelectionState = useMemo(() => {
  const state: Record<string, boolean> = {}
  tableState.selection.forEach((id) => {
    state[id] = true  // ✅ ID-based, matches TanStack expectations
  })
  return state
}, [tableState.selection, data, getRowId])

// Handler also uses IDs directly
const selectedIds = new Set<string>()
Object.keys(newSelection).forEach((rowId) => {
  if (newSelection[rowId]) {
    selectedIds.add(rowId)  // ✅ Direct ID usage
  }
})
```

## Files Changed

1. **`hooks/useTableSelection.ts`**
   - Changed `rowSelectionState` to use row IDs as keys instead of indices
   - Changed `handleRowSelectionChange` to work with row IDs directly
   - Removed unnecessary index-to-ID conversion

2. **`hooks/useTableColumns.tsx`**
   - Cleaned up header checkbox implementation
   - Removed debug logging

## Testing

The fix was verified by adding debug logging that showed:
- **Before**: Indices 1-10 were being used, with index 0 missing (row ID '1' skipped)
- **After**: All row IDs '1'-'10' are properly included in selection

## Result

✅ Header checkbox now works correctly:
- Clicking it selects ALL rows (including the first one)
- The checkbox visual state properly reflects the selection state
- Clicking it again deselects ALL rows
- Works with any row ID format (strings, numbers, UUIDs, etc.)

## Lessons Learned

When using TanStack Table with a custom `getRowId` function:
- Selection state keys should match the row IDs returned by `getRowId`
- Don't convert between indices and IDs unless necessary
- TanStack Table internally uses the row IDs as keys for selection tracking

## Related Documentation

- TanStack Table v8 Row Selection: https://tanstack.com/table/v8/docs/api/features/row-selection
- `getRowId` API: Used to specify custom row identifiers
- `getToggleAllPageRowsSelectedHandler()`: Returns the proper change handler for the header checkbox
