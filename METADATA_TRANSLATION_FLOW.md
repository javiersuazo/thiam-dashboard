# Metadata Translation Flow

## Yes, Translations Come in Metadata!

The translations are included in the **metadata (`meta`)** field that the backend sends along with the actual data.

## Complete API Response Structure

```json
{
  "data": [
    {
      "id": "123",
      "name": "Tomato",
      "category": "vegetables",    // ← Just the key (language-agnostic)
      "occasion": "breakfast",     // ← Just the key
      "currentStock": 50.5,
      // ... other fields
    }
    // ... more ingredients
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "schema": {                    // ← THIS is where translations come from
      "entity": "ingredient",
      "displayName": "Ingredients",
      "columns": [
        {
          "key": "category",
          "type": "select",         // ← Indicates it's a dropdown field
          "label": "Category",
          "editable": true,
          "filterable": true,
          "sortable": true,
          "options": [              // ← Options with translations
            {
              "value": "vegetables",
              "label": "Vegetables",
              "translations": {      // ← TRANSLATIONS HERE
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
            // ... more categories
          ]
        },
        {
          "key": "occasion",
          "type": "select",
          "label": "Occasion",
          "editable": true,
          "filterable": true,
          "options": [              // ← Occasion options
            {
              "value": "breakfast",
              "label": "Breakfast",
              "translations": {      // ← TRANSLATIONS HERE
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
            }
            // ... more occasions
          ]
        },
        {
          "key": "name",
          "type": "text",           // ← Not a select, no translations needed
          "label": "Name",
          "editable": true,
          "sortable": true
        }
        // ... more columns
      ]
    }
  }
}
```

## How the Frontend Uses This

### 1. Data Extraction

```typescript
// In IngredientTable.tsx
const { data } = useQuery({
  queryFn: async () => {
    const { data, error } = await api.GET('/v1/accounts/{accountId}/ingredients')

    return {
      data: data?.data || [],        // ← The actual ingredients
      meta: data?.meta,               // ← The schema with translations
    }
  }
})
```

### 2. Schema Passed to Table

```typescript
<AdvancedTable
  data={data?.data || []}            // ← Ingredient records
  schema={data?.meta?.schema}        // ← Schema with translations
  schemaOptions={{
    locale,                          // ← Current app locale
  }}
/>
```

### 3. Column Builder Reads Translations

```typescript
// In columnBuilder.tsx
function buildColumnsFromSchema(parsedSchema, options) {
  const locale = options?.locale || 'en'

  // For each column in the schema
  parsedSchema.columns.map(column => {
    if (column.type === 'select') {
      // Build edit options with translations
      editOptions: column.options?.map(opt => ({
        label: opt.translations?.[locale] || opt.label,  // ← Use translation!
        value: opt.value,
      }))

      // Build filter options with translations
      filterOptions: column.options?.map(opt => ({
        label: opt.translations?.[locale] || opt.label,  // ← Use translation!
        value: opt.value,
      }))
    }
  })
}
```

### 4. Cell Renderer Uses Translations

```typescript
// In columnBuilder.tsx - createCellRenderer
case 'select':
  const option = column.options?.find(opt => opt.value === value)
  const displayLabel = option?.translations?.[locale] || option?.label || value
  return <span>{displayLabel}</span>  // ← Shows translated label!
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Backend API Response                                        │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   data: [{ category: "vegetables" }],  ← Keys only         │
│   meta: {                                                   │
│     schema: {                                               │
│       columns: [{                                           │
│         key: "category",                                    │
│         options: [{                                         │
│           value: "vegetables",                              │
│           translations: {             ← Translations!       │
│             en: "Vegetables",                               │
│             es: "Verduras"                                  │
│           }                                                 │
│         }]                                                  │
│       }]                                                    │
│     }                                                       │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ React Query Cache                                           │
├─────────────────────────────────────────────────────────────┤
│ Stores both data AND meta                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ AdvancedTable Component                                     │
├─────────────────────────────────────────────────────────────┤
│ data={data?.data}         ← Ingredient records             │
│ schema={data?.meta?.schema}  ← Schema with translations    │
│ schemaOptions={{ locale }}   ← Current language            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Column Builder                                              │
├─────────────────────────────────────────────────────────────┤
│ Reads: schema.columns[].options[].translations[locale]     │
│ Builds: Table columns with translated labels               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Table Display                                               │
├─────────────────────────────────────────────────────────────┤
│ Cell shows: "Verduras" (Spanish)                           │
│ Dropdown shows: "Verduras", "Carne", "Lácteos"            │
│ Filter shows: "Verduras", "Carne", "Lácteos"              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ User Edits                                                  │
├─────────────────────────────────────────────────────────────┤
│ User selects: "Carne" from dropdown                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Auto-Translation (configAdapter)                            │
├─────────────────────────────────────────────────────────────┤
│ Converts: "Carne" → "meat"                                 │
│ Uses: getApiValue(value, column.options)                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ API Request                                                 │
├─────────────────────────────────────────────────────────────┤
│ PATCH /ingredients/batch-update                             │
│ Body: { "123": { "category": "meat" } }  ← Key, not label  │
└─────────────────────────────────────────────────────────────┘
```

## Key Points

1. **Data** contains only keys: `{ category: "vegetables" }`
2. **Meta.schema** contains the translations: `{ translations: { es: "Verduras" } }`
3. **Frontend** joins them together to display the correct translation
4. **On edit**, frontend converts the label back to key before sending to API

## Why This Design?

### Advantages

1. **Single source of truth**: Translations defined once in backend schema
2. **Dynamic**: Change translations without frontend deployment
3. **Efficient**: Data records don't duplicate translation strings
4. **Scalable**: Add new languages by updating schema only
5. **Consistent**: All select fields use the same pattern

### Example Size Comparison

**Without metadata approach** (translations in every record):
```json
{
  "data": [
    {
      "id": "1",
      "category": "vegetables",
      "categoryLabel": {          // ← Duplicate for every record!
        "en": "Vegetables",
        "es": "Verduras",
        "de": "Gemüse"
      }
    },
    {
      "id": "2",
      "category": "meat",
      "categoryLabel": {          // ← Duplicate again!
        "en": "Meat",
        "es": "Carne",
        "de": "Fleisch"
      }
    }
    // ... 1000 more records = translations duplicated 1000 times!
  ]
}
```

**With metadata approach** (current):
```json
{
  "data": [
    { "id": "1", "category": "vegetables" },  // ← Just keys
    { "id": "2", "category": "meat" },
    // ... 1000 more records = no duplication!
  ],
  "meta": {
    "schema": {
      "columns": [{
        "key": "category",
        "options": [
          {
            "value": "vegetables",
            "translations": {      // ← Defined once!
              "en": "Vegetables",
              "es": "Verduras",
              "de": "Gemüse"
            }
          },
          {
            "value": "meat",
            "translations": {      // ← Defined once!
              "en": "Meat",
              "es": "Carne",
              "de": "Fleisch"
            }
          }
        ]
      }]
    }
  }
}
```

The metadata approach saves **massive amounts of bandwidth** and is **much more efficient**.

## Summary

✅ **Translations come in `meta.schema.columns[].options[].translations`**
✅ **Data records contain only keys** (e.g., "vegetables", "breakfast")
✅ **Frontend joins data + metadata** to show translated labels
✅ **On edit, converts labels back to keys** before sending to API

This is a **standard pattern** for efficient API design with internationalization!
