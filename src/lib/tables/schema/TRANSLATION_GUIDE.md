# Translation Guide for Schema-Driven Tables

## Overview

The schema-driven table system automatically handles translation between **API keys** (backend values) and **display labels** (localized text shown to users) for select/enum fields.

## The Problem

When working with internationalized applications:

**Backend** → Stores keys (language-agnostic): `"vegetables"`, `"meat"`, `"dairy"`
**Frontend** → Shows translated labels: `"Vegetales"`, `"Carne"`, `"Lácteos"` (Spanish)

**Challenge**: How to maintain this mapping throughout the entire edit cycle?

## The Solution

### 1. **API Schema Provides Both**

The backend sends both the key and translated label in the schema:

```json
{
  "key": "category",
  "type": "select",
  "options": [
    { "value": "vegetables", "label": "Vegetales" },
    { "value": "meat", "label": "Carne" },
    { "value": "dairy", "label": "Lácteos" }
  ]
}
```

And the actual data uses keys:
```json
{
  "id": "123",
  "name": "Tomato",
  "category": "vegetables"  // ← Key (not label)
}
```

### 2. **Display: Keys → Labels**

The `columnBuilder` automatically renders the translated label:

```tsx
// Automatic in createCellRenderer()
case 'select':
  const option = column.options?.find(opt => opt.value === value)
  return <span>{option?.label || value}</span>
  // Shows: "Vegetales" (not "vegetables")
```

### 3. **Edit: Labels → Keys**

When user edits and saves, we convert back to keys using `getApiValue()`:

```tsx
import { getApiValue } from '@/lib/tables/schema'

const handleCellEdit = (rowId: string, columnId: string, value: unknown) => {
  const column = schema.columns.find(col => col.key === columnId)
  const apiValue = column?.type === 'select' && column.options
    ? getApiValue(value, column.options)  // "Vegetales" → "vegetables"
    : value

  setEditedRows(prev => ({
    ...prev,
    [rowId]: { [columnId]: apiValue }  // ✅ Stores key, not label
  }))
}
```

### 4. **Save: Send Keys to API**

```tsx
const handleSaveAll = async () => {
  // editedRows already contains keys (not labels)
  await batchUpdateMutation.mutateAsync(editedRows)
  // API receives: { category: "vegetables" } ✅
}
```

## Translation Helpers API

### `getDisplayLabel(value, options)`

Converts API key to display label.

```tsx
import { getDisplayLabel } from '@/lib/tables/schema'

getDisplayLabel("vegetables", options)  // → "Vegetales"
getDisplayLabel("unknown", options)     // → "unknown" (fallback)
getDisplayLabel(null, options)          // → ""
```

### `getApiValue(valueOrLabel, options)`

Converts display label (or key) back to API key.

```tsx
import { getApiValue } from '@/lib/tables/schema'

getApiValue("Vegetales", options)   // → "vegetables"
getApiValue("vegetables", options)  // → "vegetables" (already a key)
getApiValue("unknown", options)     // → "unknown" (passthrough)
```

**Smart Matching**: Checks both `value` and `label` fields, so it works whether you pass the key or the label.

### `translateMultiple(values, options)`

Translate an array of values (useful for multiselect).

```tsx
import { translateMultiple } from '@/lib/tables/schema'

translateMultiple(["vegetables", "meat"], options)
// → ["Vegetales", "Carne"]
```

### `reverseTranslateMultiple(labels, options)`

Reverse translate an array of labels back to keys.

```tsx
import { reverseTranslateMultiple } from '@/lib/tables/schema'

reverseTranslateMultiple(["Vegetales", "Carne"], options)
// → ["vegetables", "meat"]
```

### `getColumnOptions(schema, columnId)`

Get options for a specific column from schema.

```tsx
import { getColumnOptions } from '@/lib/tables/schema'

const options = getColumnOptions(parsedSchema, "category")
// → [{ value: "vegetables", label: "Vegetales" }, ...]
```

## Usage Pattern

### Minimal Setup (Recommended)

```tsx
import { AdvancedTable } from '@/components/shared/tables/AdvancedTable'
import { getApiValue } from '@/lib/tables/schema'

export function MyTable({ accountId }: Props) {
  const { data } = useQuery({ /* ... */ })
  const [editedRows, setEditedRows] = useState({})

  const handleCellEdit = (rowId: string, columnId: string, value: unknown) => {
    // 1. Find column in schema
    const column = data?.meta?.schema?.columns?.find(col => col.key === columnId)

    // 2. Convert to API value if it's a select field
    const apiValue = column?.type === 'select' && column.options
      ? getApiValue(value, column.options)
      : value

    // 3. Store API value
    setEditedRows(prev => ({
      ...prev,
      [rowId]: { ...prev[rowId], [columnId]: apiValue }
    }))
  }

  return (
    <AdvancedTable
      data={data?.data || []}
      schema={data?.meta?.schema}  // ✅ Pass schema
      editing={{
        enabled: true,
        onEdit: handleCellEdit,  // ✅ Use translation-aware handler
      }}
    />
  )
}
```

### Advanced: createTranslationAwareCellEdit

For complex scenarios, wrap your handler:

```tsx
import { createTranslationAwareCellEdit, parseSchema } from '@/lib/tables/schema'

const parsedSchema = data?.meta?.schema ? parseSchema(data.meta.schema) : undefined

const handleCellEdit = createTranslationAwareCellEdit(
  parsedSchema,
  (rowId, columnId, apiValue) => {
    // apiValue is already converted to key
    setEditedRows(prev => ({
      ...prev,
      [rowId]: { [columnId]: apiValue }
    }))
  }
)
```

## How It Works: Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. API Response                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Data: { category: "vegetables" }                                │
│ Schema: [{ value: "vegetables", label: "Vegetales" }]           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Display (columnBuilder.tsx)                                  │
├─────────────────────────────────────────────────────────────────┤
│ createCellRenderer() finds option by value                      │
│ Shows: "Vegetales" to user                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. User Edits                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Select dropdown shows: "Vegetales", "Carne", "Lácteos"         │
│ User selects: "Carne"                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Translation (handleCellEdit)                                 │
├─────────────────────────────────────────────────────────────────┤
│ getApiValue("Carne", options) → "meat"                          │
│ Store: { category: "meat" }                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Save to API                                                  │
├─────────────────────────────────────────────────────────────────┤
│ PATCH /ingredients/batch-update                                 │
│ Body: { "123": { "category": "meat" } }  ✅ Key, not label      │
└─────────────────────────────────────────────────────────────────┘
```

## Best Practices

### ✅ DO

- **Always use keys in API requests** - Never send translated labels to the backend
- **Let the schema handle display** - Don't manually translate in components
- **Use getApiValue() before saving** - Ensure you're sending keys, not labels
- **Trust the schema options** - They contain the correct key↔label mappings

### ❌ DON'T

- **Don't store labels in editedRows** - Always store API keys
- **Don't manually translate** - Use the helper functions
- **Don't assume value format** - Always use getApiValue() for selects
- **Don't skip translation** - Even if language is English, use the system

## Troubleshooting

### Problem: API receives label instead of key

```tsx
// ❌ BAD - sends "Vegetales" to API
setEditedRows(prev => ({
  ...prev,
  [rowId]: { [columnId]: value }  // value might be label!
}))

// ✅ GOOD - converts to "vegetables"
const apiValue = getApiValue(value, column.options)
setEditedRows(prev => ({
  ...prev,
  [rowId]: { [columnId]: apiValue }
}))
```

### Problem: Display shows key instead of label

Check that schema options are properly formatted:
```tsx
// Schema should have both value and label:
options: [
  { value: "vegetables", label: "Vegetales" },  // ✅
  // NOT: { value: "vegetables" }  // ❌ Missing label
]
```

### Problem: Filter sends label to API

Make sure filter values are converted:
```tsx
const categoryFilter = columnFilters.find(f => f.id === 'category')?.value
const column = schema.columns.find(col => col.key === 'category')

const apiFilterValue = column?.options
  ? getApiValue(categoryFilter, column.options)
  : categoryFilter

// Use apiFilterValue in API request
```

## Real Example: Ingredient Category

```tsx
// 1. Backend returns
{
  id: "123",
  name: "Tomato",
  category: "vegetables"  // ← Key
}

// 2. Schema provides translations
schema: {
  columns: [{
    key: "category",
    type: "select",
    options: [
      { value: "vegetables", label: "Vegetales" },  // Spanish
      { value: "meat", label: "Carne" },
      { value: "dairy", label: "Lácteos" }
    ]
  }]
}

// 3. User sees: "Vegetales" in table
// 4. User edits, selects: "Carne"
// 5. handleCellEdit converts: "Carne" → "meat"
// 6. API receives: { category: "meat" } ✅
```

## Summary

The translation system is **automatic and transparent**:

1. **Schema** provides key↔label mappings
2. **Display** shows labels to users (handled by columnBuilder)
3. **Edit** accepts labels from user (from dropdowns)
4. **Translation** converts labels → keys (your responsibility with getApiValue)
5. **API** receives keys (language-agnostic)

**Key takeaway**: Always use `getApiValue()` when handling select field edits before storing in state.
