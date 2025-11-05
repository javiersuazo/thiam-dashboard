'use client'

/**
 * Complete i18n Example for AdvancedTable
 *
 * This example demonstrates:
 * 1. Translating static UI labels (buttons, pagination, etc.)
 * 2. Translating column headers
 * 3. Translating dynamic data values from API (categories, statuses)
 * 4. Translating filter options
 * 5. Handling mixed sources (API + hardcoded)
 */

import { useMemo } from 'react'
import { AdvancedTablePlugin, MockDataSource } from '@/components/shared/tables/AdvancedTable'
import { useTableTranslations } from '@/lib/table-i18n'
import type { ColumnDefinition } from '@/components/shared/tables/AdvancedTable/core/interfaces'

interface Product {
  id: string
  name: string
  category: string // API returns key like "electronics"
  status: string // API returns key like "active"
  price: number
  stock: number
  rating: number
  createdAt: string
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro 15',
    category: 'electronics',
    status: 'active',
    price: 1299,
    stock: 45,
    rating: 4.5,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Cotton T-Shirt',
    category: 'clothing',
    status: 'active',
    price: 29,
    stock: 120,
    rating: 4.2,
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'Organic Coffee Beans',
    category: 'food',
    status: 'pending',
    price: 15,
    stock: 200,
    rating: 4.8,
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'Wireless Headphones',
    category: 'electronics',
    status: 'inactive',
    price: 199,
    stock: 0,
    rating: 4.3,
    createdAt: '2024-03-10'
  },
  {
    id: '5',
    name: 'Yoga Mat Premium',
    category: 'sports',
    status: 'active',
    price: 45,
    stock: 78,
    rating: 4.6,
    createdAt: '2024-02-15'
  }
]

export function I18nTableExample() {
  const { translateColumn, translateValue, getTableLabels, t } = useTableTranslations()

  // Define raw columns with translation keys
  const rawColumns: ColumnDefinition<Product>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        headerTranslationKey: 'products.columns.id',
        type: 'text',
        width: 80
      },
      {
        key: 'name',
        header: 'Product Name',
        headerTranslationKey: 'products.columns.name',
        type: 'text',
        width: 200
      },
      {
        key: 'category',
        header: 'Category',
        headerTranslationKey: 'products.columns.category',
        type: 'select',
        valueTranslationKey: 'categories', // Namespace for translating values
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
        // Custom renderer to translate the value
        cell: ({ value }) => translateValue(value, 'categories')
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
          const colorClass = colorMap[value] || colorMap.active

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
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
        width: 120
      },
      {
        key: 'stock',
        header: 'Stock',
        headerTranslationKey: 'products.columns.stock',
        type: 'number',
        width: 100
      },
      {
        key: 'rating',
        header: 'Rating',
        headerTranslationKey: 'products.columns.rating',
        type: 'number',
        width: 100,
        cell: ({ value }) => (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{value}</span>
          </div>
        )
      },
      {
        key: 'createdAt',
        header: 'Created Date',
        headerTranslationKey: 'products.columns.createdAt',
        type: 'date',
        width: 150
      }
    ],
    [translateValue]
  )

  // Translate all columns
  const columns = useMemo(() => {
    return rawColumns.map(translateColumn)
  }, [rawColumns, translateColumn])

  // Create data source
  const dataSource = useMemo(() => {
    return new MockDataSource({
      data: mockProducts,
      getRowId: (row) => row.id
    })
  }, [])

  // Get translated UI labels
  const labels = getTableLabels

  const schemaProvider = useMemo(
    () => ({
      getColumns: () => columns,
      getColumn: (key: string) => columns.find((col) => col.key === key),
      getFieldType: (field: string) => {
        const column = columns.find((col) => col.key === field)
        return column?.type || 'text'
      }
    }),
    [columns]
  )

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          ℹ️ i18n Example
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>✅ All UI labels are translated (pagination, buttons, filters)</li>
          <li>✅ Column headers use translation keys</li>
          <li>✅ Category and Status values are translated</li>
          <li>✅ Filter dropdown options are translated</li>
          <li>✅ Works with next-intl - change language to see translations</li>
        </ul>
      </div>

      <AdvancedTablePlugin
        dataSource={dataSource}
        schemaProvider={schemaProvider}
        labels={labels}
        features={{
          sorting: true,
          filtering: true,
          globalSearch: true,
          pagination: {
            pageSize: 10,
            pageSizeOptions: [5, 10, 20, 50]
          },
          rowSelection: true,
          columnVisibility: true,
          export: true
        }}
        exportFileName="products"
      />
    </div>
  )
}
