# Quick Start: i18n AdvancedTable

## 🚀 5-Minute Setup

### 1. Add Translation Keys to Your Columns

```typescript
const columns: ColumnDefinition[] = [
  {
    key: 'category',
    header: 'Category',
    headerTranslationKey: 'products.columns.category',  // ← Add this
    type: 'select',
    valueTranslationKey: 'categories',                  // ← Add this
    options: [
      {
        value: 'electronics',
        label: 'Electronics',
        translationKey: 'categories.electronics'        // ← Add this
      }
    ]
  }
]
```

### 2. Use the Translation Hook

```typescript
import { useTableTranslations } from '@/lib/table-i18n'

const { translateColumn, getTableLabels } = useTableTranslations()

const translatedColumns = columns.map(translateColumn)
const labels = getTableLabels()
```

### 3. Pass to Table

```typescript
<AdvancedTablePlugin
  dataSource={dataSource}
  schemaProvider={{ columns: translatedColumns }}
  labels={labels}
/>
```

### 4. Add Translations

```json
// messages/en.json
{
  "products": {
    "columns": {
      "category": "Category"
    }
  },
  "categories": {
    "electronics": "Electronics"
  },
  "table": {
    "show": "Show",
    "entries": "entries",
    "exportCSV": "Export CSV"
  }
}
```

## ✅ Done!

Your table now supports multiple languages. Just add more translation files (es.json, fr.json, etc.) and everything translates automatically!

---

## 📋 Translation Checklist

- [ ] Column headers: `headerTranslationKey`
- [ ] Data values: `valueTranslationKey` + custom cell renderer
- [ ] Filter options: `translationKey` in each option
- [ ] UI labels: pass `labels` prop to table
- [ ] Translation files: add en.json, es.json, etc.

---

## 🎯 Key Principles

1. **API sends keys, not labels**: `{ category: "electronics" }` ✅
2. **Translation keys are hierarchical**: `categories.electronics` ✅
3. **Always provide fallback labels**: `label: "Electronics"` ✅
4. **Filter by key, not label**: Backend gets `"electronics"`, not `"Electrónica"` ✅

---

## 📚 Full Docs

- **Complete Guide**: `I18N_GUIDE.md`
- **Production Ready**: `PRODUCTION_READY_SUMMARY.md`
- **Working Example**: `examples/I18nTableExample.tsx`
