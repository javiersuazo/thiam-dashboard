# AdvancedTable Internationalization (i18n) Guide

## Overview

The AdvancedTable supports full internationalization for:
1. **Static UI labels** (buttons, pagination, etc.)
2. **Column headers** (Product Name, Status, etc.)
3. **Dynamic data values** (category names, status labels returned from API)
4. **Filter options** (dropdown values for select filters)

---

## Problem: Translatable API Data

### Common Scenario

Your API returns data with keys that need translation:

```json
{
  "id": "123",
  "name": "Product A",
  "category": "electronics",
  "status": "active"
}
```

But you need to display:
- `electronics` → "Electronics" (EN) / "Electrónica" (ES)
- `active` → "Active" (EN) / "Activo" (ES)

---

## Solution 1: Translation Keys in Column Definitions

### Step 1: Define Columns with Translation Keys

```typescript
import { ColumnDefinition } from '@/components/shared/tables/AdvancedTable'

const columns: ColumnDefinition[] = [
  {
    key: 'name',
    header: 'Product Name',
    headerTranslationKey: 'products.columns.name',
    type: 'text'
  },
  {
    key: 'category',
    header: 'Category',
    headerTranslationKey: 'products.columns.category',
    type: 'select',
    valueTranslationKey: 'categories',  // Translation namespace for values
    options: [
      {
        value: 'electronics',
        label: 'Electronics',
        translationKey: 'categories.electronics'
      },
      {
        value: 'clothing',
        label: 'Clothing',
        translationKey: 'categories.clothing'
      },
      {
        value: 'food',
        label: 'Food',
        translationKey: 'categories.food'
      }
    ]
  },
  {
    key: 'status',
    header: 'Status',
    headerTranslationKey: 'products.columns.status',
    type: 'select',
    valueTranslationKey: 'statuses',
    options: [
      {
        value: 'active',
        label: 'Active',
        translationKey: 'statuses.active'
      },
      {
        value: 'inactive',
        label: 'Inactive',
        translationKey: 'statuses.inactive'
      },
      {
        value: 'pending',
        label: 'Pending',
        translationKey: 'statuses.pending'
      }
    ]
  }
]
```

### Step 2: Translation Files

**English (`en.json`)**:
```json
{
  "products": {
    "columns": {
      "name": "Product Name",
      "category": "Category",
      "status": "Status"
    }
  },
  "categories": {
    "electronics": "Electronics",
    "clothing": "Clothing",
    "food": "Food & Beverages"
  },
  "statuses": {
    "active": "Active",
    "inactive": "Inactive",
    "pending": "Pending Approval"
  },
  "table": {
    "show": "Show",
    "entries": "entries",
    "showing": "Showing",
    "to": "to",
    "of": "of",
    "page": "Page",
    "exportCSV": "Export CSV",
    "columns": "Columns",
    "apply": "Apply",
    "clear": "Clear",
    "cancel": "Cancel"
  }
}
```

**Spanish (`es.json`)**:
```json
{
  "products": {
    "columns": {
      "name": "Nombre del Producto",
      "category": "Categoría",
      "status": "Estado"
    }
  },
  "categories": {
    "electronics": "Electrónica",
    "clothing": "Ropa",
    "food": "Alimentos y Bebidas"
  },
  "statuses": {
    "active": "Activo",
    "inactive": "Inactivo",
    "pending": "Pendiente de Aprobación"
  },
  "table": {
    "show": "Mostrar",
    "entries": "entradas",
    "showing": "Mostrando",
    "to": "a",
    "of": "de",
    "page": "Página",
    "exportCSV": "Exportar CSV",
    "columns": "Columnas",
    "apply": "Aplicar",
    "clear": "Limpiar",
    "cancel": "Cancelar"
  }
}
```

### Step 3: Create Translation Helper

```typescript
// src/lib/table-i18n.ts
import { useTranslations } from 'next-intl'
import { ColumnDefinition, SelectOption, TableLabels } from '@/components/shared/tables/AdvancedTable'

export function useTableTranslations() {
  const t = useTranslations()

  const translateColumn = <TRow,>(column: ColumnDefinition<TRow>): ColumnDefinition<TRow> => {
    return {
      ...column,
      header: column.headerTranslationKey
        ? t(column.headerTranslationKey)
        : column.header,
      options: column.options?.map(option => ({
        ...option,
        label: option.translationKey
          ? t(option.translationKey)
          : option.label
      }))
    }
  }

  const translateValue = (value: any, translationKey?: string): string => {
    if (!value) return ''
    if (!translationKey) return String(value)

    const fullKey = `${translationKey}.${value}`
    return t(fullKey)
  }

  const getTableLabels = (): TableLabels => ({
    show: t('table.show'),
    entries: t('table.entries'),
    showing: t('table.showing'),
    to: t('table.to'),
    of: t('table.of'),
    page: t('table.page'),
    exportCSV: t('table.exportCSV'),
    columns: t('table.columns'),
    manageColumns: t('table.manageColumns'),
    showAll: t('table.showAll'),
    apply: t('table.apply'),
    clear: t('table.clear'),
    cancel: t('table.cancel'),
    saveAllChanges: t('table.saveAllChanges'),
    filterBy: t('table.filterBy'),
    search: t('table.search'),
    searchPlaceholder: t('table.searchPlaceholder'),
    min: t('table.min'),
    max: t('table.max'),
    from: t('table.from'),
    all: t('table.all'),
    yes: t('table.yes'),
    no: t('table.no'),
    selectValue: t('table.selectValue'),
    selected: t('table.selected'),
    availableOptions: t('table.availableOptions'),
    dragToReorder: t('table.dragToReorder'),
    clearSearch: t('table.clearSearch')
  })

  return {
    translateColumn,
    translateValue,
    getTableLabels,
    t
  }
}
```

### Step 4: Use in Component

```typescript
'use client'

import { AdvancedTablePlugin } from '@/components/shared/tables/AdvancedTable'
import { useTableTranslations } from '@/lib/table-i18n'
import { useMemo } from 'react'

export function ProductsTable({ dataSource }) {
  const { translateColumn, translateValue, getTableLabels } = useTableTranslations()

  // Translate columns
  const columns = useMemo(() => {
    return rawColumns.map(translateColumn)
  }, [translateColumn])

  // Custom cell renderer for translated values
  const schemaProvider = {
    getColumns: () => columns.map(col => ({
      ...col,
      // If column has valueTranslationKey, use custom renderer
      cell: col.valueTranslationKey
        ? ({ value }) => translateValue(value, col.valueTranslationKey)
        : col.cell
    }))
  }

  const labels = getTableLabels()

  return (
    <AdvancedTablePlugin
      dataSource={dataSource}
      schemaProvider={schemaProvider}
      labels={labels}
      features={{
        sorting: true,
        filtering: true,
        search: true
      }}
    />
  )
}
```

---

## Solution 2: API Returns Translation Keys

### Scenario: API Response

```json
{
  "id": "123",
  "name": "Product A",
  "categoryKey": "electronics",
  "categoryLabel": "Electronics",
  "statusKey": "active",
  "statusLabel": "Active"
}
```

### Setup

```typescript
const columns: ColumnDefinition[] = [
  {
    key: 'categoryKey',
    header: 'Category',
    headerTranslationKey: 'products.columns.category',
    type: 'select',
    // Custom renderer to translate the key
    cell: ({ row }) => {
      const t = useTranslations()
      return t(`categories.${row.categoryKey}`)
    },
    options: categories.map(cat => ({
      value: cat.key,
      label: cat.label,
      translationKey: `categories.${cat.key}`
    }))
  }
]
```

---

## Solution 3: Filter Options from API

### Scenario: Categories Come from API

```typescript
// Fetch categories from API
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: () => api.GET('/categories')
})

// Build translated options
const categoryOptions = useMemo(() => {
  return categories?.map(cat => ({
    value: cat.id,
    label: cat.name,  // Default label
    translationKey: `categories.${cat.key}`  // For translation
  })) || []
}, [categories])

// Use in column definition
const columns: ColumnDefinition[] = [
  {
    key: 'categoryId',
    header: 'Category',
    headerTranslationKey: 'products.columns.category',
    type: 'select',
    options: categoryOptions,
    valueTranslationKey: 'categories',
    // Display translated name
    cell: ({ value, row }) => {
      const t = useTranslations()
      const category = categories?.find(c => c.id === value)
      return category?.key
        ? t(`categories.${category.key}`)
        : category?.name || value
    }
  }
]
```

---

## Solution 4: Mixed Sources (Some Translated, Some Not)

### Example: User Roles (Fixed) vs Categories (API)

```typescript
// Fixed roles - always translate
const roleOptions = [
  { value: 'admin', label: 'Admin', translationKey: 'roles.admin' },
  { value: 'user', label: 'User', translationKey: 'roles.user' },
  { value: 'guest', label: 'Guest', translationKey: 'roles.guest' }
]

// Dynamic categories - translate if key available
const categoryOptions = apiCategories.map(cat => ({
  value: cat.id,
  label: cat.name,
  translationKey: cat.translationKey ? `categories.${cat.translationKey}` : undefined
}))

// Helper function
function getTranslatedLabel(option: SelectOption, t: TranslationFunction): string {
  return option.translationKey ? t(option.translationKey) : option.label
}
```

---

## Best Practices

### 1. **Consistent Translation Key Structure**

```typescript
// Good - hierarchical and predictable
categories.electronics
categories.clothing
statuses.active
statuses.inactive
products.columns.name
products.columns.category

// Bad - flat and inconsistent
category_electronics
statusActive
productName
```

### 2. **Fallback to Label**

Always provide a fallback label for when translation is missing:

```typescript
const displayValue = translationKey
  ? t(translationKey, { fallback: label })
  : label
```

### 3. **API Contract for Translation**

Document your API to return translation keys:

```typescript
// API Response Schema
interface Category {
  id: string
  name: string           // Default display name
  translationKey?: string // Optional key for i18n
}

// Example
{
  "id": "123",
  "name": "Electronics",
  "translationKey": "electronics"
}
```

### 4. **Server-Side Filtering**

When filtering by translated values, send the **key** to API, not the translated label:

```typescript
// Client filters by "Electrónica" (Spanish)
filters: { category: "electronics" }  // Send key, not label

// API understands the key regardless of client language
```

---

## Complete Example: Real Production Setup

```typescript
'use client'

import { AdvancedTablePlugin, MockDataSource } from '@/components/shared/tables/AdvancedTable'
import { useTableTranslations } from '@/lib/table-i18n'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Product {
  id: string
  name: string
  categoryId: string
  statusKey: 'active' | 'inactive' | 'pending'
  price: number
}

export function ProductsTable() {
  const { translateColumn, translateValue, getTableLabels, t } = useTableTranslations()

  // Fetch dynamic categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.GET('/categories')
      return res.data || []
    }
  })

  // Build category options with translation support
  const categoryOptions = useMemo(() => {
    return categories.map(cat => ({
      value: cat.id,
      label: cat.name,
      translationKey: cat.translationKey ? `categories.${cat.translationKey}` : undefined
    }))
  }, [categories])

  // Fixed status options - always translated
  const statusOptions = [
    { value: 'active', label: 'Active', translationKey: 'statuses.active' },
    { value: 'inactive', label: 'Inactive', translationKey: 'statuses.inactive' },
    { value: 'pending', label: 'Pending', translationKey: 'statuses.pending' }
  ]

  // Define columns
  const rawColumns: ColumnDefinition<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      headerTranslationKey: 'products.columns.name',
      type: 'text'
    },
    {
      key: 'categoryId',
      header: 'Category',
      headerTranslationKey: 'products.columns.category',
      type: 'select',
      options: categoryOptions,
      valueTranslationKey: 'categories',
      cell: ({ value }) => {
        const category = categories.find(c => c.id === value)
        if (!category) return value
        return category.translationKey
          ? t(`categories.${category.translationKey}`)
          : category.name
      }
    },
    {
      key: 'statusKey',
      header: 'Status',
      headerTranslationKey: 'products.columns.status',
      type: 'select',
      options: statusOptions,
      valueTranslationKey: 'statuses',
      cell: ({ value }) => translateValue(value, 'statuses')
    },
    {
      key: 'price',
      header: 'Price',
      headerTranslationKey: 'products.columns.price',
      type: 'currency'
    }
  ]

  // Translate columns
  const columns = useMemo(() => {
    return rawColumns.map(translateColumn)
  }, [rawColumns, translateColumn])

  const schemaProvider = {
    getColumns: () => columns
  }

  return (
    <AdvancedTablePlugin
      dataSource={dataSource}
      schemaProvider={schemaProvider}
      labels={getTableLabels()}
      features={{
        sorting: true,
        filtering: true,
        search: true,
        pagination: true,
        columnVisibility: true,
        export: true
      }}
    />
  )
}
```

---

## Summary: What You Need to Make It Work

### From API:
1. Return translation keys alongside display values (optional but recommended):
   ```json
   {
     "category": "electronics",
     "categoryKey": "electronics",  // For translation lookup
     "categoryName": "Electronics"  // Fallback display
   }
   ```

2. Provide translation key in metadata endpoints:
   ```json
   GET /api/categories
   [
     { "id": "1", "name": "Electronics", "translationKey": "electronics" }
   ]
   ```

### In Your Code:
1. Define translation keys in column definitions
2. Create translation files (en.json, es.json, etc.)
3. Use `useTableTranslations()` hook
4. Map columns and options through translator
5. Pass translated labels to table

### Result:
✅ Fully translated UI
✅ Translated column headers
✅ Translated filter options
✅ Translated data values
✅ Works with any number of languages
✅ Graceful fallback to default labels
