# Locale-Based Translation Implementation

## Summary

The AdvancedTable system now supports automatic translation of select field options based on the app's current locale. This implementation reads the `translations` object from the backend schema and displays the appropriate language to users.

## How It Works

### 1. Backend Schema Structure

The backend provides translations within each option's `translations` field:

```json
{
  "key": "category",
  "type": "select",
  "options": [
    {
      "value": "vegetables",
      "label": "Vegetables",
      "translations": {
        "en": "Vegetables",
        "es": "Verduras",
        "de": "Gemüse"
      }
    },
    {
      "value": "meat",
      "label": "Meat",
      "translations": {
        "en": "Meat",
        "es": "Carne",
        "de": "Fleisch"
      }
    }
  ]
}
```

**Note**: The `label` field is hardcoded to English by the backend. Our implementation uses the `translations` object instead.

### 2. Frontend Implementation

#### Column Builder (`columnBuilder.tsx`)

The `buildColumnsFromSchema` function now:
1. Accepts a `locale` parameter (defaults to 'en')
2. Uses `opt.translations?.[locale]` instead of `opt.label` when building:
   - Edit options (dropdown values for editing)
   - Filter options (dropdown values for filtering)
   - Cell display (what users see in table cells)

**Example**:
```typescript
editOptions: column.options?.map(opt => ({
  label: opt.translations?.[locale] || opt.label || opt.value || '',
  value: opt.value || '',
}))
```

#### Cell Renderer

The `createCellRenderer` function for select fields:
```typescript
case 'select':
  const option = column.options?.find(opt => opt.value === value)
  const displayLabel = option?.translations?.[locale] || option?.label || value
  return <span>{displayLabel}</span>
```

This ensures that:
- Display shows: Spanish "Verduras" when locale is 'es'
- But the underlying value remains: "vegetables" (language-agnostic key)

#### Domain Component (IngredientTable.tsx)

The table component:
1. Gets the current app locale using `useLocale()` from next-intl
2. Passes it to AdvancedTable via `schemaOptions`:

```typescript
const locale = useLocale()

<AdvancedTable
  schemaOptions={{
    locale,
    // ... other options
  }}
/>
```

## Translation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. API Response                                             │
├─────────────────────────────────────────────────────────────┤
│ Data: { category: "vegetables" }                            │
│ Schema: [{                                                  │
│   value: "vegetables",                                      │
│   translations: { en: "Vegetables", es: "Verduras" }        │
│ }]                                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Column Builder                                           │
├─────────────────────────────────────────────────────────────┤
│ locale = 'es' (from app)                                    │
│ Builds options using translations['es']                     │
│ Result: "Verduras" for display                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Display                                                  │
├─────────────────────────────────────────────────────────────┤
│ User sees: "Verduras" in table cells                        │
│ Dropdowns show: "Verduras", "Carne", "Lácteos"            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Edit                                                     │
├─────────────────────────────────────────────────────────────┤
│ User selects: "Carne"                                       │
│ Auto-translation (configAdapter) converts: "Carne" → "meat" │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Save                                                     │
├─────────────────────────────────────────────────────────────┤
│ API receives: { category: "meat" } ✅ Key, not label        │
└─────────────────────────────────────────────────────────────┘
```

## Backend Requirements

### Required: Update OpenAPI Schema

The backend's OpenAPI spec needs to include the `translations` field in the `SelectOption` schema:

```yaml
entity.SelectOption:
  type: object
  properties:
    value:
      type: string
    label:
      type: string
    color:
      type: string
    icon:
      type: string
    translations:
      type: object
      additionalProperties:
        type: string
      description: Map of locale codes to translated labels
      example:
        en: "Vegetables"
        es: "Verduras"
        de: "Gemüse"
```

### After Backend Update

Once the backend OpenAPI spec is updated:

1. Run `npm run api:update` to regenerate TypeScript types
2. The `SelectOption` type will automatically include `translations?: Record<string, string>`
3. No frontend code changes needed - everything is already implemented

## Files Modified

### Core Table System

1. **`src/lib/tables/schema/columnBuilder.tsx`**
   - Added `locale` parameter to `buildColumnsFromSchema` options (line 69)
   - Updated meta information to use `translations[locale]` (lines 188, 200)
   - Modified `createCellRenderer` to accept and use locale (lines 281, 356)
   - Pass locale to createCellRenderer call (line 218)

2. **`src/components/shared/tables/AdvancedTable/configAdapter.ts`**
   - Already has auto-translation wrapper for `onCellEdit` (lines 85-95)
   - Converts display labels back to API keys automatically

3. **`src/components/shared/tables/AdvancedTable/types.ts`**
   - Already has `autoTranslate` option (enabled by default)
   - Already has `locale` in schemaOptions interface

### Domain Implementation

4. **`src/components/domains/inventory/ingredients/IngredientTable.tsx`**
   - Import `useLocale` from next-intl (line 10)
   - Get current locale (line 31)
   - Pass locale to schemaOptions (line 169)

## Usage in Other Tables

To use locale-based translations in any table:

```typescript
import { useLocale } from 'next-intl'

export function MyTable({ accountId }: Props) {
  const locale = useLocale()

  return (
    <AdvancedTable
      schema={data?.meta?.schema}
      schemaOptions={{
        locale,  // ✅ Pass app locale
        // ... other options
      }}
    />
  )
}
```

That's it! The table system handles everything else automatically.

## Fallback Behavior

The implementation has graceful fallbacks:

1. If `translations[locale]` doesn't exist → falls back to `label`
2. If `label` doesn't exist → falls back to `value` (the key)
3. If locale is not provided → defaults to 'en'

This ensures the table always displays something meaningful, even with incomplete data.

## Benefits

1. **Automatic**: No manual translation code in domain components
2. **Centralized**: All translation logic in columnBuilder
3. **Type-safe**: Uses generated types from OpenAPI
4. **Flexible**: Works with any number of locales
5. **Consistent**: Same translation system for display, edit, and filter
6. **Backward compatible**: Works with old schemas that only have `label`

## Next Steps

1. **Backend**: Update OpenAPI spec to include `translations` field in `SelectOption`
2. **Frontend**: Run `npm run api:update` after backend update
3. **Testing**: Verify translations work correctly for all locales (en, es, de)
4. **Rollout**: Apply locale pattern to other tables (menus, orders, etc.)
