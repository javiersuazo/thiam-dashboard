# Occasion Field - Translation Debug Guide

## Issue Description

The "occasion" field is showing the API key (e.g., "breakfast", "lunch") instead of the translated label (e.g., "Breakfast", "Desayuno").

## Root Cause

The backend is likely sending the occasion field without proper `translations` in the options. The frontend is correctly configured to display translations, but falls back to showing the key when translations are not available.

## How the Frontend Handles This

The `columnBuilder.tsx` has a fallback chain for select fields:

```typescript
case 'select':
  const option = column.options?.find(opt => opt.value === value)
  const displayLabel = option?.translations?.[locale] || option?.label || value
  return <span>{displayLabel}</span>
```

**Fallback order**:
1. `option?.translations?.[locale]` - Try translation for current locale
2. `option?.label` - Fallback to label field
3. `value` - Last resort: show the raw key

If you're seeing keys like "breakfast", it means:
- Either `translations` is missing
- Or `label` is missing
- Or both are missing/undefined

## How to Debug

### 1. Check the API Response

Open browser DevTools → Network tab → Find the ingredients request → Check the response:

```json
{
  "data": [...],
  "meta": {
    "schema": {
      "columns": [
        {
          "key": "occasion",
          "type": "select",
          "label": "Occasion",
          "options": [
            // ✅ GOOD: Has translations
            {
              "value": "breakfast",
              "label": "Breakfast",
              "translations": {
                "en": "Breakfast",
                "es": "Desayuno",
                "de": "Frühstück"
              }
            },

            // ❌ BAD: Missing translations (shows key)
            {
              "value": "breakfast",
              "label": "breakfast"  // Label is same as key
            },

            // ❌ BAD: No translations field (shows label or key)
            {
              "value": "breakfast",
              "label": "Breakfast"  // Will show this, but not translated
            }
          ]
        }
      ]
    }
  }
}
```

### 2. Check if Occasion is a Select Type

Verify that the backend is marking occasion as a `select` type field:

```json
{
  "key": "occasion",
  "type": "select",  // ← Must be "select" not "text"
  "options": [...]   // ← Must have options array
}
```

If `type` is "text", it will show the raw value without any translation.

### 3. Verify Locale is Being Passed

Check that the locale is reaching the columnBuilder:

```typescript
// In IngredientTable.tsx
const locale = useLocale()  // Should be 'en', 'es', or 'de'

<AdvancedTable
  schemaOptions={{
    locale,  // ← This must be passed
    // ...
  }}
/>
```

## Expected Backend Response for Occasion

```json
{
  "key": "occasion",
  "type": "select",
  "label": "Occasion",
  "editable": true,
  "filterable": true,
  "sortable": true,
  "options": [
    {
      "value": "breakfast",
      "label": "Breakfast",
      "translations": {
        "en": "Breakfast",
        "es": "Desayuno",
        "de": "Frühstück"
      }
    },
    {
      "value": "lunch",
      "label": "Lunch",
      "translations": {
        "en": "Lunch",
        "es": "Almuerzo",
        "de": "Mittagessen"
      }
    },
    {
      "value": "dinner",
      "label": "Dinner",
      "translations": {
        "en": "Dinner",
        "es": "Cena",
        "de": "Abendessen"
      }
    },
    {
      "value": "snack",
      "label": "Snack",
      "translations": {
        "en": "Snack",
        "es": "Merienda",
        "de": "Snack"
      }
    },
    {
      "value": "brunch",
      "label": "Brunch",
      "translations": {
        "en": "Brunch",
        "es": "Brunch",
        "de": "Brunch"
      }
    },
    {
      "value": "cocktail",
      "label": "Cocktail Hour",
      "translations": {
        "en": "Cocktail Hour",
        "es": "Hora del Cóctel",
        "de": "Cocktailstunde"
      }
    }
  ]
}
```

## Quick Fix (Temporary)

If you need the frontend to show better labels immediately while waiting for backend translations, you can add a custom cell renderer for occasion in `IngredientTable.tsx`:

```typescript
import { useLocale } from 'next-intl'

const occasionTranslations = {
  breakfast: { en: 'Breakfast', es: 'Desayuno', de: 'Frühstück' },
  lunch: { en: 'Lunch', es: 'Almuerzo', de: 'Mittagessen' },
  dinner: { en: 'Dinner', es: 'Cena', de: 'Abendessen' },
  snack: { en: 'Snack', es: 'Merienda', de: 'Snack' },
  brunch: { en: 'Brunch', es: 'Brunch', de: 'Brunch' },
  cocktail: { en: 'Cocktail Hour', es: 'Hora del Cóctel', de: 'Cocktailstunde' },
}

// In schemaOptions.customCells:
customCells: {
  occasion: ({ row }) => {
    const locale = useLocale()
    const occasion = row.original.occasion
    const translated = occasionTranslations[occasion]?.[locale] || occasion
    return <span className="text-sm text-gray-700 dark:text-gray-400">{translated}</span>
  },
  // ... other custom cells
}
```

**Note**: This is a temporary frontend solution. The proper fix is for the backend to include translations in the schema.

## Permanent Solution (Backend)

Update the backend to populate the `translations` field in the occasion options:

```go
// Example: Building occasion options with translations
func buildOccasionOptions() []entity.SelectOption {
    return []entity.SelectOption{
        {
            Value: "breakfast",
            Label: "Breakfast",
            Translations: map[string]string{
                "en": "Breakfast",
                "es": "Desayuno",
                "de": "Frühstück",
            },
        },
        {
            Value: "lunch",
            Label: "Lunch",
            Translations: map[string]string{
                "en": "Lunch",
                "es": "Almuerzo",
                "de": "Mittagessen",
            },
        },
        {
            Value: "dinner",
            Label: "Dinner",
            Translations: map[string]string{
                "en": "Dinner",
                "es": "Cena",
                "de": "Abendessen",
            },
        },
        {
            Value: "snack",
            Label: "Snack",
            Translations: map[string]string{
                "en": "Snack",
                "es": "Merienda",
                "de": "Snack",
            },
        },
        {
            Value: "brunch",
            Label: "Brunch",
            Translations: map[string]string{
                "en": "Brunch",
                "es": "Brunch",
                "de": "Brunch",
            },
        },
        {
            Value: "cocktail",
            Label: "Cocktail Hour",
            Translations: map[string]string{
                "en": "Cocktail Hour",
                "es": "Hora del Cóctel",
                "de": "Cocktailstunde",
            },
        },
    }
}
```

## Testing After Backend Fix

1. Clear browser cache
2. Navigate to `/en/inventory/ingredients` - Should show "Breakfast", "Lunch", etc.
3. Navigate to `/es/inventory/ingredients` - Should show "Desayuno", "Almuerzo", etc.
4. Navigate to `/de/inventory/ingredients` - Should show "Frühstück", "Mittagessen", etc.
5. Edit an occasion field - Dropdown should show translated options
6. Save - API should receive the key (e.g., "breakfast") not the label

## Summary

**Frontend**: ✅ Ready to handle translations
**Backend**: ⏳ Needs to populate `translations` field in occasion options

The frontend code is correctly implemented. The issue is that the backend is not yet sending translations for the occasion field. Once the backend adds the `translations` field to the occasion options (just like we did for category), the translations will display automatically with no additional frontend code needed.
