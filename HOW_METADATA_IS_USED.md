# How Metadata Translations Are Used in Table Display

## Yes! We Use Metadata When Displaying Records

The metadata translations are used at **render time** to convert keys to translated labels.

## Step-by-Step Flow

### 1. Data Arrives from API

```typescript
// In IngredientTable.tsx
const { data } = useQuery({
  queryFn: async () => {
    const { data, error } = await api.GET('/v1/accounts/{accountId}/ingredients')

    return {
      data: data?.data || [],        // ← Records: [{ category: "vegetables" }]
      meta: data?.meta,               // ← Schema with translations
    }
  }
})
```

### 2. Both Data AND Schema Passed to Table

```typescript
// In IngredientTable.tsx (line 163-165)
<AdvancedTable
  data={data?.data || []}            // ← The ingredient records
  schema={data?.meta?.schema}        // ← The metadata with translations
  schemaOptions={{
    locale,                          // ← Current language (en, es, de)
  }}
/>
```

### 3. Column Builder Processes Schema

```typescript
// In columnBuilder.tsx
export function buildColumnsFromSchema(parsedSchema, options) {
  const locale = options?.locale || 'en'

  // For each column in the schema
  return parsedSchema.columns.map(column => {

    // Create column definition
    const columnDef = {
      accessorKey: column.key,      // e.g., "category"
      header: column.label,         // e.g., "Category"

      // Auto-generate cell renderer
      cell: createCellRenderer(column, { locale })
    }

    return columnDef
  })
}
```

### 4. Cell Renderer Uses Metadata at Render Time

This is the **key part** where translations are actually displayed:

```typescript
// In columnBuilder.tsx - createCellRenderer (lines 354-361)
function createCellRenderer(column, formatters) {
  return ({ row, getValue }) => {
    const value = getValue()  // ← Gets "vegetables" from row data

    switch (column.type) {
      case 'select':
        // Find the option in metadata that matches the value
        const option = column.options?.find(opt => opt.value === value)
        //                     ↑
        //                     This is from METADATA!

        // Get translation for current locale
        const displayLabel = option?.translations?.[formatters?.locale || 'en']
                          || option?.label
                          || value
        //                  ↑
        //                  Uses translation from METADATA!

        return (
          <span className="text-sm text-gray-700 dark:text-gray-400 capitalize">
            {displayLabel}  {/* ← Displays "Verduras" (not "vegetables") */}
          </span>
        )
    }
  }
}
```

## Visual Example

### Data in Memory

**Row data** (from `data?.data`):
```typescript
{
  id: "123",
  name: "Tomato",
  category: "vegetables",  // ← Just the key
  currentStock: 50.5
}
```

**Schema metadata** (from `data?.meta?.schema`):
```typescript
{
  columns: [
    {
      key: "category",
      type: "select",
      options: [
        {
          value: "vegetables",
          translations: {
            en: "Vegetables",
            es: "Verduras",
            de: "Gemüse"
          }
        }
      ]
    }
  ]
}
```

### When Table Renders (Spanish user, locale = 'es')

```
Row: { category: "vegetables" }
       ↓
getValue() returns: "vegetables"
       ↓
Find in metadata: column.options.find(opt => opt.value === "vegetables")
       ↓
Found option: { value: "vegetables", translations: { es: "Verduras" } }
       ↓
Get translation: option.translations["es"]
       ↓
Display in cell: "Verduras" ✅
```

## Where This Happens in the Code

### File: `src/lib/tables/schema/columnBuilder.tsx`

**Line 354-361** - The cell renderer for select fields:
```typescript
case 'select':
  const option = column.options?.find(opt => opt.value === value)
  const displayLabel = option?.translations?.[formatters?.locale || 'en'] || option?.label || value
  return (
    <span className="text-sm text-gray-700 dark:text-gray-400 capitalize">
      {displayLabel}
    </span>
  )
```

This code runs **every time a cell is rendered** in the table.

### For Each Row:

1. **TanStack Table** calls the cell renderer
2. Cell renderer receives the **row data** (e.g., `{ category: "vegetables" }`)
3. Cell renderer has access to **column metadata** (from schema)
4. Cell renderer looks up the value in metadata options
5. Cell renderer extracts the translation for current locale
6. Cell renderer returns the translated JSX

## Performance Note

This is **very efficient** because:

1. Schema is fetched once and cached by React Query
2. Column definitions are built once and memoized
3. Only the cell rendering happens per-row
4. Simple object lookup: `option.translations[locale]`

For 1000 rows, we do 1000 **fast lookups**, not 1000 API calls!

## When Metadata is NOT Used

For non-select fields, metadata is still used but differently:

```typescript
// Text fields - no translation needed
case 'text':
  return <span>{value}</span>  // ← Direct value display

// Currency fields - uses formatCurrency from options
case 'currency':
  return <span>{formatCurrency(value)}</span>

// Date fields - uses formatDate from options
case 'date':
  return <span>{formatDate(value)}</span>
```

## Complete Render Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. API Response Cached in React Query                      │
├─────────────────────────────────────────────────────────────┤
│ data: [{ id: "123", category: "vegetables" }]              │
│ meta: { schema: { columns: [...] } }                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. AdvancedTable Component Renders                         │
├─────────────────────────────────────────────────────────────┤
│ <AdvancedTable                                             │
│   data={data?.data}              ← Row data                │
│   schema={data?.meta?.schema}    ← Metadata               │
│   schemaOptions={{ locale }}     ← Current language        │
│ />                                                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. buildColumnsFromSchema (runs once)                      │
├─────────────────────────────────────────────────────────────┤
│ Processes schema.columns[]                                 │
│ Creates column definitions with cell renderers             │
│ Cell renderers have closure over column.options            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. TanStack Table Renders Rows                             │
├─────────────────────────────────────────────────────────────┤
│ For each row in data:                                      │
│   For each column:                                         │
│     Call cell renderer with row data                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Cell Renderer Executes (per cell, per row)             │
├─────────────────────────────────────────────────────────────┤
│ row.category = "vegetables"                                │
│ column.options = [{ value: "vegetables", translations }]   │
│ locale = "es"                                              │
│                                                            │
│ option = column.options.find(...)  ← Lookup in metadata   │
│ label = option.translations["es"]  ← Get translation       │
│                                                            │
│ return <span>Verduras</span>       ← Render!              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. User Sees Translated Text                               │
├─────────────────────────────────────────────────────────────┤
│ Category column shows: "Verduras"                          │
│ Not: "vegetables"                                          │
└─────────────────────────────────────────────────────────────┘
```

## Code Reference

You can see this in action in your codebase:

1. **Pass metadata to table**: `src/components/domains/inventory/ingredients/IngredientTable.tsx` line 165
   ```typescript
   schema={data?.meta?.schema}
   ```

2. **Build columns from schema**: `src/components/shared/tables/AdvancedTable/configAdapter.ts` line 30-33
   ```typescript
   const parsedSchema = schema ? parseSchema(schema) : null
   const columns = parsedSchema
     ? buildColumnsFromSchema<TData>(parsedSchema, schemaOptions)
     : manualColumns || []
   ```

3. **Create cell renderer**: `src/lib/tables/schema/columnBuilder.tsx` line 218
   ```typescript
   columnDef.cell = createCellRenderer(column, { formatCurrency, formatDate, locale })
   ```

4. **Use translations**: `src/lib/tables/schema/columnBuilder.tsx` line 354-361
   ```typescript
   const option = column.options?.find(opt => opt.value === value)
   const displayLabel = option?.translations?.[formatters?.locale || 'en'] || option?.label || value
   ```

## Summary

✅ **Yes, we use metadata translations when displaying records!**

- Metadata is passed to the table component
- Column builder creates cell renderers that have access to metadata
- Each cell renderer looks up the row value in metadata options
- The translation for the current locale is extracted and displayed
- This happens in real-time during rendering, not pre-processed

**Key insight**: The row data contains **only keys**, but when rendered, we **join with metadata** to show **translated labels**. This is the beauty of the metadata approach! 🎯
