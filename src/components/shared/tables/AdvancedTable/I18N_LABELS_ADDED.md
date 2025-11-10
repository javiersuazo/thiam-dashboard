# i18n Labels Added to Messages Files

## ✅ All Table Labels Now in Translation Files

All labels used by the AdvancedTable have been added to both English and Spanish message files.

### Files Updated

1. **`messages/en.json`** - English translations
2. **`messages/es.json`** - Spanish translations

---

## Table UI Labels (`table.*`)

All table interface labels are now translatable:

| Key | English | Spanish |
|-----|---------|---------|
| `table.show` | Show | Mostrar |
| `table.entries` | entries | entradas |
| `table.showing` | Showing | Mostrando |
| `table.to` | to | a |
| `table.of` | of | de |
| `table.page` | Page | Página |
| `table.exportCSV` | Export CSV | Exportar CSV |
| `table.columns` | Columns | Columnas |
| `table.manageColumns` | Manage Columns | Gestionar Columnas |
| `table.showAll` | Show All | Mostrar Todas |
| `table.apply` | Apply | Aplicar |
| `table.clear` | Clear | Limpiar |
| `table.cancel` | Cancel | Cancelar |
| `table.saveAllChanges` | Save All Changes | Guardar Todos los Cambios |
| `table.filterBy` | Filter by | Filtrar por |
| `table.search` | Search | Buscar |
| `table.searchPlaceholder` | Search... | Buscar... |
| `table.min` | Min | Mín |
| `table.max` | Max | Máx |
| `table.from` | From | Desde |
| `table.all` | All | Todos |
| `table.yes` | Yes | Sí |
| `table.no` | No | No |
| `table.selectValue` | Select value... | Seleccionar valor... |
| `table.selected` | Selected | Seleccionado |
| `table.availableOptions` | Available options | Opciones disponibles |
| `table.dragToReorder` | Drag items to reorder columns | Arrastra elementos para reordenar columnas |
| `table.clearSearch` | Clear search | Limpiar búsqueda |

---

## Product Column Labels (`products.columns.*`)

Column headers for product tables:

| Key | English | Spanish |
|-----|---------|---------|
| `products.columns.id` | ID | ID |
| `products.columns.name` | Product Name | Nombre del Producto |
| `products.columns.category` | Category | Categoría |
| `products.columns.status` | Status | Estado |
| `products.columns.price` | Price | Precio |
| `products.columns.stock` | Stock | Inventario |
| `products.columns.rating` | Rating | Calificación |
| `products.columns.createdAt` | Created Date | Fecha de Creación |

---

## Category Values (`categories.*`)

Translatable category values:

| Key | English | Spanish |
|-----|---------|---------|
| `categories.electronics` | Electronics | Electrónica |
| `categories.clothing` | Clothing | Ropa |
| `categories.food` | Food | Alimentos |
| `categories.books` | Books | Libros |
| `categories.toys` | Toys | Juguetes |
| `categories.sports` | Sports | Deportes |
| `categories.home` | Home | Hogar |
| `categories.beauty` | Beauty | Belleza |

---

## Status Values (`statuses.*`)

Translatable status values:

| Key | English | Spanish |
|-----|---------|---------|
| `statuses.active` | Active | Activo |
| `statuses.inactive` | Inactive | Inactivo |
| `statuses.pending` | Pending | Pendiente |
| `statuses.archived` | Archived | Archivado |
| `statuses.draft` | Draft | Borrador |

---

## How It Works

### 1. Table UI Labels

The `useTableTranslations()` hook automatically fetches all table UI labels:

```typescript
import { useTableTranslations } from '@/lib/table-i18n'

const { getTableLabels } = useTableTranslations()
const labels = getTableLabels()

<AdvancedTablePlugin
  dataSource={dataSource}
  labels={labels}  // ← Automatically translated
/>
```

**Result:**
- English user sees: "Show 10 entries"
- Spanish user sees: "Mostrar 10 entradas"

### 2. Column Headers

Add `headerTranslationKey` to columns:

```typescript
const columns: ColumnDefinition[] = [
  {
    key: 'name',
    header: 'Product Name',  // Fallback
    headerTranslationKey: 'products.columns.name'  // Translation key
  }
]

const translatedColumns = columns.map(translateColumn)
```

**Result:**
- English: "Product Name"
- Spanish: "Nombre del Producto"

### 3. Dynamic Data Values

Add `valueTranslationKey` and use `translateValue()`:

```typescript
const columns: ColumnDefinition[] = [
  {
    key: 'category',
    header: 'Category',
    headerTranslationKey: 'products.columns.category',
    valueTranslationKey: 'categories',  // Namespace for values
    cell: ({ value }) => translateValue(value, 'categories')
  }
]
```

**API returns:** `{ category: "electronics" }`

**Result:**
- English: "Electronics"
- Spanish: "Electrónica"

### 4. Filter Options

Add `translationKey` to each option:

```typescript
const columns: ColumnDefinition[] = [
  {
    key: 'category',
    type: 'select',
    options: [
      {
        value: 'electronics',  // API value
        label: 'Electronics',  // Fallback
        translationKey: 'categories.electronics'  // Translation
      }
    ]
  }
]
```

**Result:**
- English dropdown shows: "Electronics"
- Spanish dropdown shows: "Electrónica"
- API receives: `"electronics"` (always the key, never the label)

---

## Testing Translations

### Switch Language

To test translations, change your browser language or use the language switcher in your app.

### Verify in Browser

1. **Open DevTools Console**
2. **Navigate to `/table-test`**
3. **Observe table labels:**
   - Pagination: "Showing 1 to 10 of 50 entries" (EN) / "Mostrando 1 a 10 de 50 entradas" (ES)
   - Buttons: "Export CSV" (EN) / "Exportar CSV" (ES)
   - Columns: "Category" (EN) / "Categoría" (ES)
   - Values: "Electronics" (EN) / "Electrónica" (ES)

### Verify API Calls

Open **Network tab** and observe:
- Filter by "Electronics" (English UI) → API receives `?category=electronics`
- Filter by "Electrónica" (Spanish UI) → API receives `?category=electronics`

**Same API call regardless of language!** ✅

---

## Adding More Labels

### For New Domains

Add domain-specific translations following the same pattern:

```json
// messages/en.json
{
  "orders": {
    "columns": {
      "orderNumber": "Order Number",
      "customer": "Customer",
      "total": "Total"
    }
  },
  "orderStatuses": {
    "pending": "Pending",
    "confirmed": "Confirmed",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "cancelled": "Cancelled"
  }
}
```

```json
// messages/es.json
{
  "orders": {
    "columns": {
      "orderNumber": "Número de Pedido",
      "customer": "Cliente",
      "total": "Total"
    }
  },
  "orderStatuses": {
    "pending": "Pendiente",
    "confirmed": "Confirmado",
    "shipped": "Enviado",
    "delivered": "Entregado",
    "cancelled": "Cancelado"
  }
}
```

### Usage in Columns

```typescript
const orderColumns: ColumnDefinition[] = [
  {
    key: 'orderNumber',
    header: 'Order Number',
    headerTranslationKey: 'orders.columns.orderNumber'
  },
  {
    key: 'status',
    header: 'Status',
    headerTranslationKey: 'orders.columns.status',
    valueTranslationKey: 'orderStatuses',
    options: [
      { value: 'pending', label: 'Pending', translationKey: 'orderStatuses.pending' },
      { value: 'confirmed', label: 'Confirmed', translationKey: 'orderStatuses.confirmed' }
    ],
    cell: ({ value }) => translateValue(value, 'orderStatuses')
  }
]
```

---

## Summary

✅ **All table UI labels** are now in translation files
✅ **English (en.json)** - 27 table labels + 8 categories + 5 statuses + 8 column labels
✅ **Spanish (es.json)** - Complete Spanish translations for all labels
✅ **Graceful fallbacks** - If translation missing, shows default label
✅ **API consistency** - Always sends/receives keys, not translated labels
✅ **Easy to extend** - Add new domains following the same pattern

The AdvancedTable is now fully internationalized and ready for production use in multiple languages!
