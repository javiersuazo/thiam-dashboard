'use client'

/**
 * Layered Architecture Example
 *
 * This example demonstrates proper layered architecture with:
 * 1. Repository Layer - Data access abstraction
 * 2. Transformation Layer - DTO ↔ Domain Model conversion
 * 3. Data Source Layer - Adapter to IDataSource interface
 * 4. Presentation Layer - Table component
 *
 * Following SOLID and DDD principles
 */

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

/**
 * API DTO - What the backend sends
 */
interface ProductApiDTO {
  product_id: string
  product_name: string
  category_key: string
  status_key: string
  unit_price: number
  inventory_count: number
  average_rating: number
  created_at: string
  updated_at: string
}

/**
 * Domain Model - What the table works with
 */
interface Product {
  id: string
  name: string
  category: string
  status: string
  price: number
  stock: number
  rating: number
  createdAt: string
  updatedAt: string
}

/**
 * Data Transformer - Converts between API DTOs and Domain Models
 *
 * This layer protects your application from API changes
 * If backend changes field names, you only update the transformer
 */
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
    if (domain.createdAt !== undefined) dto.created_at = domain.createdAt
    if (domain.updatedAt !== undefined) dto.updated_at = domain.updatedAt

    return dto
  }
}

export function LayeredArchitectureExample() {
  const { translateColumn, translateValue, getTableLabels } = useTableTranslations()

  const rawColumns: ColumnDefinition<Product>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        headerTranslationKey: 'products.columns.id',
        type: 'text',
        width: 80,
        sortable: true
      },
      {
        key: 'name',
        header: 'Product Name',
        headerTranslationKey: 'products.columns.name',
        type: 'text',
        width: 200,
        sortable: true,
        filterable: true
      },
      {
        key: 'category',
        header: 'Category',
        headerTranslationKey: 'products.columns.category',
        type: 'select',
        valueTranslationKey: 'categories',
        sortable: true,
        filterable: true,
        options: [
          { value: 'electronics', label: 'Electronics', translationKey: 'categories.electronics' },
          { value: 'clothing', label: 'Clothing', translationKey: 'categories.clothing' },
          { value: 'food', label: 'Food', translationKey: 'categories.food' },
          { value: 'books', label: 'Books', translationKey: 'categories.books' },
          { value: 'toys', label: 'Toys', translationKey: 'categories.toys' },
          { value: 'sports', label: 'Sports', translationKey: 'categories.sports' },
          { value: 'home', label: 'Home', translationKey: 'categories.home' },
          { value: 'beauty', label: 'Beauty', translationKey: 'categories.beauty' }
        ],
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
        sortable: true,
        filterable: true,
        options: [
          { value: 'active', label: 'Active', translationKey: 'statuses.active' },
          { value: 'inactive', label: 'Inactive', translationKey: 'statuses.inactive' },
          { value: 'pending', label: 'Pending', translationKey: 'statuses.pending' },
          { value: 'archived', label: 'Archived', translationKey: 'statuses.archived' },
          { value: 'draft', label: 'Draft', translationKey: 'statuses.draft' }
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
        filterable: true
      },
      {
        key: 'stock',
        header: 'Stock',
        headerTranslationKey: 'products.columns.stock',
        type: 'number',
        width: 100,
        sortable: true,
        filterable: true
      },
      {
        key: 'rating',
        header: 'Rating',
        headerTranslationKey: 'products.columns.rating',
        type: 'number',
        width: 100,
        sortable: true,
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
        width: 150,
        sortable: true,
        filterable: true
      }
    ],
    [translateValue]
  )

  const columns = useMemo(() => {
    return rawColumns.map(translateColumn)
  }, [rawColumns, translateColumn])

  /**
   * Setup Layered Architecture:
   *
   * 1. Create Transformer
   * 2. Create Repository (handles API communication)
   * 3. Wrap Repository in DataSource adapter
   * 4. Pass DataSource to Table
   */
  const dataSource = useMemo(() => {
    const transformer = new ProductTransformer()

    const repository = new ApiRepository<Product, ProductApiDTO>({
      endpoint: '/products',
      apiClient: api as any,
      transformer,
      idField: 'id'
    })

    return new RepositoryDataSource(repository)
  }, [])

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
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">
          🏗️ Layered Architecture
        </h3>
        <ul className="text-xs text-green-800 dark:text-green-300 space-y-1">
          <li>✅ <strong>Repository Layer</strong> - ApiRepository handles API communication</li>
          <li>✅ <strong>Transformation Layer</strong> - ProductTransformer converts API DTO ↔ Domain Model</li>
          <li>✅ <strong>Data Source Layer</strong> - RepositoryDataSource adapts to IDataSource</li>
          <li>✅ <strong>Presentation Layer</strong> - Table component uses domain models</li>
          <li>✅ <strong>Protection</strong> - API changes only affect transformer, not table</li>
          <li>✅ <strong>Testability</strong> - Each layer can be tested independently</li>
        </ul>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
          Architecture Flow:
        </h4>
        <pre className="text-xs text-blue-800 dark:text-blue-300 font-mono">
{`┌──────────────────────────────┐
│  Table Component (View)      │ ← Works with Product domain model
├──────────────────────────────┤
│  RepositoryDataSource        │ ← Adapts IRepository to IDataSource
├──────────────────────────────┤
│  ApiRepository               │ ← Handles API calls + logging
├──────────────────────────────┤
│  ProductTransformer          │ ← Converts ProductApiDTO ↔ Product
├──────────────────────────────┤
│  openapi-fetch               │ ← Type-safe HTTP client
└──────────────────────────────┘`}
        </pre>
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
