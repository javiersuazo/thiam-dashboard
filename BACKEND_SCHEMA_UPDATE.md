# Backend Schema Update - Translation Support

## Summary

Successfully updated the backend OpenAPI schema and regenerated frontend TypeScript types to support locale-based translations in select fields.

## Changes Made

### 1. Backend OpenAPI Schema

**File**: `/Users/javiersuazo/thiago/thiam-api/docs/openapi.yaml`

**Updated**: `entity.SelectOption` schema (line 10517)

**Before**:
```yaml
entity.SelectOption:
  properties:
    color:
      type: string
    icon:
      type: string
    label:
      type: string
    value:
      type: string
  type: object
```

**After**:
```yaml
entity.SelectOption:
  properties:
    color:
      type: string
    icon:
      type: string
    label:
      type: string
    translations:
      additionalProperties:
        type: string
      description: Map of locale codes to translated labels
      example:
        en: Vegetables
        es: Verduras
        de: Gemüse
      type: object
    value:
      type: string
  type: object
```

### 2. Frontend TypeScript Types

**File**: `src/lib/api/generated/schema.ts`

**Command Run**: `npm run api:update` (converts Swagger → OpenAPI → TypeScript)

**Result**: SelectOption type now includes translations field:
```typescript
"entity.SelectOption": {
  color?: string;
  icon?: string;
  label?: string;
  translations?: {
    [key: string]: string;
  };
  value?: string;
}
```

## What This Enables

The frontend table system can now:

1. **Read translations from backend**: When the backend provides options like:
   ```json
   {
     "value": "vegetables",
     "label": "Vegetables",
     "translations": {
       "en": "Vegetables",
       "es": "Verduras",
       "de": "Gemüse"
     }
   }
   ```

2. **Display correct locale**: Based on the app's current locale setting
   - English users see: "Vegetables"
   - Spanish users see: "Verduras"
   - German users see: "Gemüse"

3. **Maintain API keys**: All edits still send language-agnostic keys ("vegetables") to the backend

## Backend Implementation Next Steps

The backend needs to populate the `translations` field when building schema responses. For ingredient categories, this would look like:

```go
// Example: Building category options with translations
func buildCategoryOptions() []entity.SelectOption {
    return []entity.SelectOption{
        {
            Value: "vegetables",
            Label: "Vegetables", // Can keep as English default
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
    }
}
```

## Testing

To verify the implementation works:

1. **Backend**: Ensure the ingredients endpoint returns options with translations:
   ```bash
   curl http://localhost:8080/v1/accounts/{accountId}/ingredients | jq '.meta.schema.columns[] | select(.key == "category")'
   ```

2. **Frontend**: Check that the table displays translated labels:
   - Change app locale to Spanish (`/es/...`)
   - Verify category column shows "Verduras", "Carne", etc.
   - Edit a category and save
   - Verify API receives the key ("vegetables") not the label ("Verduras")

## Files Modified

### Backend
- `/Users/javiersuazo/thiago/thiam-api/docs/openapi.yaml` - Added translations field to SelectOption

### Frontend
- `src/lib/api/generated/schema.ts` - Regenerated with translations field (auto-generated)
- `src/lib/tables/schema/columnBuilder.tsx` - Already updated to use translations[locale]
- `src/components/domains/inventory/ingredients/IngredientTable.tsx` - Already passing locale

## No Breaking Changes

This update is backward compatible:

- The `translations` field is optional (`translations?:`)
- If not provided, the system falls back to the `label` field
- Existing schemas without translations continue to work

## Documentation

See comprehensive implementation details in:
- `src/lib/tables/schema/LOCALE_TRANSLATION_IMPLEMENTATION.md`
- `src/lib/tables/schema/TRANSLATION_GUIDE.md`

## Status

✅ OpenAPI schema updated
✅ TypeScript types regenerated
✅ Frontend code ready
⏳ Backend needs to populate translations field in schema responses
