# Complete Configuration Example

## Full Production-Ready Setup

Here's a complete example showing all layers working together:

```typescript
'use client'

import { useMemo } from 'react'
import { AdvancedTablePlugin } from '@/components/shared/tables/AdvancedTable'
import { useTableTranslations } from '@/lib/table-i18n'
import type { ColumnDefinition } from '@/components/shared/tables/AdvancedTable/core/interfaces'
import {
  ApiRepository,
  RepositoryDataSource,
  type IDataTransformer
} from '@/components/shared/tables/AdvancedTable/core/data-layer'
import { api } from '@/lib/api'
import Badge from '@/components/shared/ui/badge/Badge'

// ============================================================================
// STEP 1: Define Your Domain Models and DTOs
// ============================================================================

/**
 * API DTO - What your backend actually sends
 */
interface ProductApiDTO {
  product_id: string
  product_name: string
  category_key: string
  status_key: string
  unit_price: number
  inventory_count: number
  average_rating: number
  supplier_name: string | null
  created_at: string
  updated_at: string
}

/**
 * Domain Model - What your table works with
 */
interface Product {
  id: string
  name: string
  category: string
  status: string
  price: number
  stock: number
  rating: number
  supplier: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// STEP 2: Create Transformer (Protects Against API Changes)
// ============================================================================

class ProductTransformer implements IDataTransformer<ProductApiDTO, Product> {
  toDomain(dto: ProductApiDTO): Product {
    return {
      id: dto.product_id,
      name: dto.product_name,
      category: dto.category_key,
      status: dto.status_key,
      price: dto.unit_price,
      stock: dto.inventory_count,
      rating: dto.average_rating,
      supplier: dto.supplier_name,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at
    }
  }

  toApi(domain: Partial<Product>): Partial<ProductApiDTO> {
    const dto: Partial<ProductApiDTO> = {}

    if (domain.id !== undefined) dto.product_id = domain.id
    if (domain.name !== undefined) dto.product_name = domain.name
    if (domain.category !== undefined) dto.category_key = domain.category
    if (domain.status !== undefined) dto.status_key = domain.status
    if (domain.price !== undefined) dto.unit_price = domain.price
    if (domain.stock !== undefined) dto.inventory_count = domain.stock
    if (domain.rating !== undefined) dto.average_rating = domain.rating
    if (domain.supplier !== undefined) dto.supplier_name = domain.supplier
    if (domain.createdAt !== undefined) dto.created_at = domain.createdAt
    if (domain.updatedAt !== undefined) dto.updated_at = domain.updatedAt

    return dto
  }
}

// ============================================================================
// STEP 3: Setup Data Layer (Repository + DataSource)
// ============================================================================

function createProductDataSource() {
  // Create transformer
  const transformer = new ProductTransformer()

  // Create repository with API configuration
  const repository = new ApiRepository<Product, ProductApiDTO>({
    endpoint: '/products',
    apiClient: api as any,
    transformer,
    idField: 'id'
  })

  // Wrap in data source adapter
  return new RepositoryDataSource(repository)
}

// ============================================================================
// STEP 4: Define Columns with i18n Support
// ============================================================================

function useProductColumns() {
  const { translateColumn, translateValue } = useTableTranslations()

  const rawColumns: ColumnDefinition<Product>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        headerTranslationKey: 'products.columns.id',
        type: 'text',
        width: 80,
        sortable: true,
        filterable: false,
        editable: false
      },
      {
        key: 'name',
        header: 'Product Name',
        headerTranslationKey: 'products.columns.name',
        type: 'text',
        width: 250,
        sortable: true,
        filterable: true,
        editable: true,
        minWidth: 200,
        align: 'left'
      },
      {
        key: 'category',
        header: 'Category',
        headerTranslationKey: 'products.columns.category',
        type: 'select',
        valueTranslationKey: 'categories',
        width: 150,
        sortable: true,
        filterable: true,
        editable: true,
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
          },
          {
            value: 'books',
            label: 'Books',
            translationKey: 'categories.books'
          },
          {
            value: 'toys',
            label: 'Toys',
            translationKey: 'categories.toys'
          },
          {
            value: 'sports',
            label: 'Sports',
            translationKey: 'categories.sports'
          },
          {
            value: 'home',
            label: 'Home',
            translationKey: 'categories.home'
          },
          {
            value: 'beauty',
            label: 'Beauty',
            translationKey: 'categories.beauty'
          }
        ],
        // Custom cell renderer with styling
        cell: ({ value }) => {
          const translated = translateValue(value, 'categories')
          const colorMap: Record<string, string> = {
            electronics: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            clothing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            food: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            books: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            toys: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
            sports: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            home: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            beauty: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }
          return (
            <Badge variant="outline" className={colorMap[value] || ''}>
              {translated}
            </Badge>
          )
        }
      },
      {
        key: 'status',
        header: 'Status',
        headerTranslationKey: 'products.columns.status',
        type: 'select',
        valueTranslationKey: 'statuses',
        width: 130,
        sortable: true,
        filterable: true,
        editable: true,
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
          },
          {
            value: 'archived',
            label: 'Archived',
            translationKey: 'statuses.archived'
          },
          {
            value: 'draft',
            label: 'Draft',
            translationKey: 'statuses.draft'
          }
        ],
        cell: ({ value }) => {
          const translated = translateValue(value, 'statuses')
          const colorMap: Record<string, string> = {
            active: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
            inactive: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
            pending: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
            archived: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
            draft: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
          }
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || colorMap.active}`}
            >
              {translated}
            </span>
          )
        }
      },
      {
        key: 'price',
        header: 'Price',
        headerTranslationKey: 'products.columns.price',
        type: 'currency',
        width: 120,
        sortable: true,
        filterable: true,
        editable: true,
        align: 'right'
      },
      {
        key: 'stock',
        header: 'Stock',
        headerTranslationKey: 'products.columns.stock',
        type: 'number',
        width: 100,
        sortable: true,
        filterable: true,
        editable: true,
        align: 'right'
      },
      {
        key: 'rating',
        header: 'Rating',
        headerTranslationKey: 'products.columns.rating',
        type: 'number',
        width: 100,
        sortable: true,
        filterable: false,
        editable: false,
        cell: ({ value }) => (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{Number(value).toFixed(1)}</span>
          </div>
        )
      },
      {
        key: 'supplier',
        header: 'Supplier',
        headerTranslationKey: 'products.columns.supplier',
        type: 'text',
        width: 150,
        sortable: true,
        filterable: true,
        editable: true
      },
      {
        key: 'createdAt',
        header: 'Created Date',
        headerTranslationKey: 'products.columns.createdAt',
        type: 'date',
        width: 150,
        sortable: true,
        filterable: true,
        editable: false
      }
    ],
    [translateValue]
  )

  // Translate all columns
  return useMemo(() => {
    return rawColumns.map(translateColumn)
  }, [rawColumns, translateColumn])
}

// ============================================================================
// STEP 5: Create Schema Provider
// ============================================================================

function createSchemaProvider(columns: ColumnDefinition<Product>[]) {
  return {
    getColumns: () => columns,
    getColumn: (key: string) => columns.find((col) => col.key === key),
    getFieldType: (field: string) => {
      const column = columns.find((col) => col.key === field)
      return column?.type || 'text'
    }
  }
}

// ============================================================================
// STEP 6: Complete Component with All Features
// ============================================================================

export function CompleteProductTable() {
  const { getTableLabels } = useTableTranslations()

  // Setup columns
  const columns = useProductColumns()

  // Setup data source
  const dataSource = useMemo(() => createProductDataSource(), [])

  // Setup schema provider
  const schemaProvider = useMemo(() => createSchemaProvider(columns), [columns])

  // Get translated UI labels
  const labels = getTableLabels()

  // Cell edit handler
  const handleCellEdit = async (rowId: string, columnId: string, value: any) => {
    console.log('Cell edited:', { rowId, columnId, value })
    // Update via API
    // await dataSource.update(rowId, { [columnId]: value })
  }

  // Row save handler
  const handleSaveRow = async (rowId: string, changes: Partial<Product>) => {
    console.log('Saving row:', { rowId, changes })
    try {
      await dataSource.update(rowId, changes)
      console.log('Row saved successfully')
    } catch (error) {
      console.error('Failed to save row:', error)
    }
  }

  // Bulk save handler
  const handleSaveAll = async (changes: Record<string, Partial<Product>>) => {
    console.log('Saving all changes:', changes)
    try {
      await dataSource.batchUpdate(changes)
      console.log('All changes saved successfully')
    } catch (error) {
      console.error('Failed to save all changes:', error)
    }
  }

  // Row click handler
  const handleRowClick = (row: Product) => {
    console.log('Row clicked:', row)
    // Navigate to detail page or open modal
    // router.push(`/products/${row.id}`)
  }

  // Bulk actions
  const bulkActions = [
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: <TrashIcon />,
      variant: 'destructive' as const,
      onClick: async (selectedIds: string[]) => {
        if (confirm(`Delete ${selectedIds.length} products?`)) {
          await dataSource.bulkDelete(selectedIds)
        }
      }
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: <DownloadIcon />,
      variant: 'default' as const,
      onClick: (selectedIds: string[]) => {
        console.log('Exporting:', selectedIds)
        // Export logic
      }
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your product catalog
          </p>
        </div>
      </div>

      <AdvancedTablePlugin
        // Data & Schema
        dataSource={dataSource}
        schemaProvider={schemaProvider}
        getRowId={(row) => row.id}

        // Features Configuration
        features={{
          // Sorting
          sorting: true,

          // Filtering
          filtering: true,

          // Global Search
          globalSearch: true,

          // Pagination
          pagination: {
            pageSize: 20,
            pageSizeOptions: [10, 20, 50, 100]
          },

          // Row Selection
          rowSelection: {
            multiple: true,
            enableSelectAll: true
          },

          // Column Visibility
          columnVisibility: true,

          // Export
          export: true,

          // Inline Editing
          inlineEditing: {
            enabled: true,
            mode: 'cell' // or 'row'
          }
        }}

        // i18n Labels
        labels={labels}

        // Editable Columns
        editableColumns={['name', 'category', 'status', 'price', 'stock', 'supplier']}

        // Edit Handlers
        onCellEdit={handleCellEdit}
        onSaveRow={handleSaveRow}
        onSaveAll={handleSaveAll}
        onCancelAll={() => console.log('All edits cancelled')}

        // Bulk Actions
        bulkActions={bulkActions}

        // Interactions
        onRowClick={handleRowClick}
        getRowClassName={(row) =>
          row.stock === 0 ? 'bg-red-50 dark:bg-red-900/10' : ''
        }

        // UI Customization
        searchPlaceholder="Search products..."
        exportFileName="products"
        className="border rounded-lg"
        emptyState={
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
            <button className="mt-4">Add Product</button>
          </div>
        }
      />
    </div>
  )
}
```

## What API Calls Look Like

### Initial Load
```http
GET /products?page=1&limit=20
```

### With Filters
```http
GET /products?page=1&limit=20&category=electronics&status=active
```

### With Search & Sorting
```http
GET /products?page=1&limit=20&q=laptop&sort_by=price&sort_order=desc
```

### Update Product
```http
PATCH /products/123
Content-Type: application/json

{
  "product_name": "Updated Name",
  "unit_price": 1499
}
```

### Bulk Delete
```http
POST /products/bulk-delete
Content-Type: application/json

{
  "ids": ["123", "456", "789"]
}
```

## Configuration Summary

### Required Props
- `dataSource` - Data source implementation
- `schemaProvider` - Column definitions

### Optional Props
- `features` - Enable/disable table features
- `labels` - i18n translated labels
- `editableColumns` - Which columns can be edited
- `bulkActions` - Custom bulk actions
- `onCellEdit` - Cell edit callback
- `onSaveRow` - Row save callback
- `onSaveAll` - Bulk save callback
- `onRowClick` - Row click handler
- `getRowClassName` - Custom row styling
- `searchPlaceholder` - Search input placeholder
- `exportFileName` - Export file name
- `className` - Table wrapper CSS classes
- `emptyState` - Custom empty state component

This is the complete, production-ready configuration! 🎉
