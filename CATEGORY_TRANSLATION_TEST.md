# Category Translation - Testing Guide

## Implementation Status

✅ **COMPLETE** - The category field now automatically displays translations based on the app's locale.

## How It Works

### 1. Backend Provides Schema

When fetching ingredients, the backend returns a schema in the meta field:

```json
{
  "data": [
    {
      "id": "123",
      "name": "Tomato",
      "category": "vegetables"  // ← API key (language-agnostic)
    }
  ],
  "meta": {
    "schema": {
      "columns": [
        {
          "key": "category",
          "type": "select",
          "label": "Category",
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
            // ... more options
          ]
        }
      ]
    }
  }
}
```

### 2. Frontend Automatically Translates

The `IngredientTable` component:

```typescript
const locale = useLocale()  // Gets 'en', 'es', or 'de' from app

<AdvancedTable
  schema={data?.meta?.schema}
  schemaOptions={{
    locale,  // Passes locale to columnBuilder
    // ...
  }}
/>
```

The `columnBuilder` automatically:
- Reads `options[].translations[locale]`
- Displays translated label in table cells
- Shows translated options in edit dropdown
- Shows translated options in filter dropdown

### 3. Translation Flow Example

**Spanish User (`/es/...`)**:

1. **Display**: User sees "Verduras" in the category column
2. **Edit**: Dropdown shows "Verduras", "Carne", "Lácteos", etc.
3. **Save**: Auto-translation converts "Carne" → "meat" (API key)
4. **API Call**: Backend receives `{ category: "meat" }` ✅

**English User (`/en/...`)**:

1. **Display**: User sees "Vegetables"
2. **Edit**: Dropdown shows "Vegetables", "Meat", "Dairy", etc.
3. **Save**: Auto-translation converts "Meat" → "meat"
4. **API Call**: Backend receives `{ category: "meat" }` ✅

## Testing Instructions

### 1. Test Display Translation

**English**:
```bash
# Navigate to: http://localhost:3001/en/inventory/ingredients
# Verify category column shows: "Vegetables", "Meat", "Dairy", etc.
```

**Spanish**:
```bash
# Navigate to: http://localhost:3001/es/inventory/ingredients
# Verify category column shows: "Verduras", "Carne", "Lácteos", etc.
```

**German**:
```bash
# Navigate to: http://localhost:3001/de/inventory/ingredients
# Verify category column shows: "Gemüse", "Fleisch", "Milchprodukte", etc.
```

### 2. Test Edit Translation

1. Click on a category cell to edit
2. Verify dropdown shows translated options (not keys)
3. Select a different category
4. Click "Save Changes"
5. Open browser DevTools → Network tab
6. Verify the PATCH request sends the API key (e.g., `"vegetables"`) not the label (e.g., `"Verduras"`)

### 3. Test Filter Translation

1. Click the filter icon on the category column
2. Verify dropdown shows translated options
3. Select a filter value
4. Verify the API request uses the key in the query param

## Backend Requirements Checklist

For this to work, the backend must:

- [ ] Include `translations` field in `SelectOption` schema (✅ OpenAPI updated)
- [ ] Populate `translations` with all supported locales (en, es, de)
- [ ] Return category options in the schema metadata
- [ ] Accept category keys (not labels) in update requests

### Example Backend Response

```go
// Example: Ingredients endpoint response
{
    "data": ingredients,
    "meta": {
        "schema": {
            "columns": []entity.ColumnSchema{
                {
                    Key:  "category",
                    Type: "select",
                    Label: "Category",
                    Options: []entity.SelectOption{
                        {
                            Value: "vegetables",
                            Label: "Vegetables",  // Default English
                            Translations: map[string]string{
                                "en": "Vegetables",
                                "es": "Verduras",
                                "de": "Gemüse",
                            },
                        },
                        {
                            Value: "meat",
                            Label: "Meat",
                            Translations: map[string]string{
                                "en": "Meat",
                                "es": "Carne",
                                "de": "Fleisch",
                            },
                        },
                        // ... more categories
                    },
                },
            },
        },
    },
}
```

## Category Options List

All 15 categories with translations:

| Key        | English          | Spanish         | German           |
|------------|------------------|-----------------|------------------|
| vegetables | Vegetables       | Verduras        | Gemüse           |
| fruits     | Fruits           | Frutas          | Obst             |
| meat       | Meat             | Carne           | Fleisch          |
| seafood    | Seafood          | Mariscos        | Meeresfrüchte    |
| dairy      | Dairy            | Lácteos         | Milchprodukte    |
| grains     | Grains           | Granos          | Getreide         |
| bakery     | Bakery           | Panadería       | Backwaren        |
| spices     | Spices           | Especias        | Gewürze          |
| oils       | Oils             | Aceites         | Öle              |
| condiments | Condiments       | Condimentos     | Würzmittel       |
| beverages  | Beverages        | Bebidas         | Getränke         |
| canned     | Canned Goods     | Enlatados       | Konserven        |
| frozen     | Frozen           | Congelados      | Tiefkühlkost     |
| supplies   | Kitchen Supplies | Suministros     | Küchenbedarf     |
| other      | Other            | Otro            | Sonstiges        |

## Troubleshooting

### Category shows key instead of translation

**Problem**: Category column shows "vegetables" instead of "Verduras"

**Causes**:
1. Backend not sending `translations` in options
2. Backend not sending category as a `select` type field
3. Locale not being passed to AdvancedTable

**Solution**:
- Check network response in DevTools
- Verify `meta.schema.columns` includes category with `type: "select"` and `options[].translations`

### Category edit saves label instead of key

**Problem**: API receives `{ category: "Verduras" }` instead of `{ category: "vegetables" }`

**Cause**: Auto-translation is not working

**Solution**:
- This should NOT happen with the current implementation
- The `configAdapter.ts` already has auto-translation enabled by default
- Check that `schemaOptions.autoTranslate` is not set to `false`

### Category filter not working

**Problem**: Filtering by category doesn't filter results

**Cause**: Filter is sending label to API instead of key

**Solution**:
- The ColumnFilter component should already handle this
- Check that the filter value is being converted by `getApiValue()`

## Files Involved

All the necessary files have been updated:

1. ✅ `src/lib/tables/schema/columnBuilder.tsx` - Uses translations[locale]
2. ✅ `src/components/domains/inventory/ingredients/IngredientTable.tsx` - Passes locale
3. ✅ `src/components/shared/tables/AdvancedTable/configAdapter.ts` - Auto-translation enabled
4. ✅ `thiam-api/docs/openapi.yaml` - SelectOption includes translations field
5. ✅ `src/lib/api/generated/schema.ts` - Types regenerated with translations field

## Summary

**Frontend**: ✅ Complete and ready
**Backend**: ⏳ Needs to populate translations in category options

Once the backend provides the translations in the schema response, the category field will automatically display in the correct language with zero additional frontend code!
