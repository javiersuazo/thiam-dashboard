'use client'

/**
 * Real API Integration Example
 *
 * This example shows how to connect AdvancedTable to your Go backend API
 * using the type-safe API client from @/lib/api
 */

import { useMemo } from 'react'
import { AdvancedTablePlugin } from '@/components/shared/tables/AdvancedTable'
import { useTableTranslations } from '@/lib/table-i18n'
import type {
  IDataSource,
  DataSourceParams,
  DataSourceResult,
  ColumnDefinition,
} from '@/components/shared/tables/AdvancedTable/core/interfaces'
import { api } from '@/lib/api'
import Badge from '@/components/shared/ui/badge/Badge'

interface Product {
  id: string
  name: string
  category: string // API returns key: "electronics", "clothing", etc.
  status: string // API returns key: "active", "inactive", "pending"
  price: number
  stock: number
  rating: number
  createdAt: string
}

/**
 * DataSource implementation that connects to your Go API
 */
class ProductsAPIDataSource implements IDataSource<Product> {
  async fetch(params: DataSourceParams): Promise<DataSourceResult<Product>> {
    const queryParams: Record<string, any> = {}

    // 1. Pagination
    if (params.pagination) {
      queryParams.page = params.pagination.page
      queryParams.limit = params.pagination.pageSize
    }

    // 2. Sorting
    if (params.sorting && params.sorting.length > 0) {
      const sort = params.sorting[0]
      queryParams.sort_by = sort.field
      queryParams.sort_order = sort.direction
    }

    // 3. Global search
    if (params.search) {
      queryParams.q = params.search
    }

    // 4. Column filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([field, value]) => {
        if (value === undefined || value === null || value === '') return

        if (Array.isArray(value)) {
          // Multi-select: ["active", "pending"] → "active,pending"
          queryParams[field] = value.join(',')
        } else if (typeof value === 'object' && 'min' in value) {
          // Range filter: { min: 100, max: 1000 }
          if (value.min !== undefined) queryParams[`${field}_min`] = value.min
          if (value.max !== undefined) queryParams[`${field}_max`] = value.max
        } else {
          // Single value: "electronics"
          queryParams[field] = value
        }
      })
    }

    console.log('API Call Parameters:', queryParams)

    // Make API call using your type-safe client
    const { data, error } = await api.GET('/products', {
      params: { query: queryParams },
    })

    if (error) {
      console.error('API Error:', error)
      throw new Error(error.message || 'Failed to fetch products')
    }

    // Transform API response to DataSourceResult format
    // Adjust these field names to match your actual API response
    return {
      data: data?.items || data?.data || [],
      total: data?.total || 0,
      page: data?.page || params.pagination?.page || 1,
      pageSize: data?.limit || data?.pageSize || params.pagination?.pageSize || 10,
      totalPages: data?.totalPages || Math.ceil((data?.total || 0) / (data?.limit || 10)),
    }
  }

  async create(data: Partial<Product>): Promise<Product> {
    const { data: product, error } = await api.POST('/products', {
      body: data,
    })

    if (error) {
      throw new Error(error.message || 'Failed to create product')
    }

    return product as Product
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const { data: product, error } = await api.PATCH('/products/{id}', {
      params: { path: { id } },
      body: data,
    })

    if (error) {
      throw new Error(error.message || 'Failed to update product')
    }

    return product as Product
  }

  async delete(id: string): Promise<void> {
    const { error } = await api.DELETE('/products/{id}', {
      params: { path: { id } },
    })

    if (error) {
      throw new Error(error.message || 'Failed to delete product')
    }
  }

  async bulkDelete(ids: string[]) {
    // Option 1: If your API has a bulk delete endpoint
    const { data, error } = await api.POST('/products/bulk-delete', {
      body: { ids },
    })

    if (error) {
      throw new Error(error.message || 'Failed to bulk delete')
    }

    return {
      success: true,
      affected: data?.affected || ids.length,
    }

    // Option 2: If no bulk endpoint, delete one by one
    // const results = await Promise.allSettled(
    //   ids.map(id => this.delete(id))
    // )
    // const errors = results
    //   .filter((r) => r.status === 'rejected')
    //   .map((r, i) => ({ id: ids[i], message: (r as PromiseRejectedResult).reason.message }))
    //
    // return {
    //   success: errors.length === 0,
    //   affected: results.filter(r => r.status === 'fulfilled').length,
    //   errors: errors.length > 0 ? errors : undefined
    // }
  }
}

export function RealAPIExample() {
  const { translateColumn, translateValue, getTableLabels } = useTableTranslations()

  // Define columns with translation support
  const rawColumns: ColumnDefinition<Product>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        headerTranslationKey: 'products.columns.id',
        type: 'text',
        width: 80,
        sortable: true,
      },
      {
        key: 'name',
        header: 'Product Name',
        headerTranslationKey: 'products.columns.name',
        type: 'text',
        width: 200,
        sortable: true,
        filterable: true,
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
          { value: 'beauty', label: 'Beauty', translationKey: 'categories.beauty' },
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
            beauty: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          }
          return (
            <Badge variant="outline" className={colorMap[value] || ''}>
              {translated}
            </Badge>
          )
        },
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
          { value: 'draft', label: 'Draft', translationKey: 'statuses.draft' },
        ],
        cell: ({ value }) => {
          const translated = translateValue(value, 'statuses')
          const colorMap: Record<string, string> = {
            active: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
            inactive: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
            pending: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
            archived: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
            draft: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
          }
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || colorMap.active}`}
            >
              {translated}
            </span>
          )
        },
      },
      {
        key: 'price',
        header: 'Price',
        headerTranslationKey: 'products.columns.price',
        type: 'currency',
        width: 120,
        sortable: true,
        filterable: true,
      },
      {
        key: 'stock',
        header: 'Stock',
        headerTranslationKey: 'products.columns.stock',
        type: 'number',
        width: 100,
        sortable: true,
        filterable: true,
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
        ),
      },
      {
        key: 'createdAt',
        header: 'Created Date',
        headerTranslationKey: 'products.columns.createdAt',
        type: 'date',
        width: 150,
        sortable: true,
        filterable: true,
      },
    ],
    [translateValue]
  )

  // Translate all columns
  const columns = useMemo(() => {
    return rawColumns.map(translateColumn)
  }, [rawColumns, translateColumn])

  // Create API data source
  const dataSource = useMemo(() => new ProductsAPIDataSource(), [])

  // Get translated UI labels
  const labels = getTableLabels

  const schemaProvider = useMemo(
    () => ({
      getColumns: () => columns,
      getColumn: (key: string) => columns.find((col) => col.key === key),
      getFieldType: (field: string) => {
        const column = columns.find((col) => col.key === field)
        return column?.type || 'text'
      },
    }),
    [columns]
  )

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          🌐 Real API Integration
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>✅ Connected to your Go backend API</li>
          <li>✅ Filters send keys (not translated labels) to API</li>
          <li>✅ API receives: ?category=electronics&status=active,pending</li>
          <li>✅ Supports pagination, sorting, filtering, search</li>
          <li>✅ Full i18n support for all displayed values</li>
          <li>✅ Open browser DevTools → Network tab to see API calls</li>
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
            pageSizeOptions: [5, 10, 20, 50],
          },
          rowSelection: true,
          columnVisibility: true,
          export: true,
        }}
        exportFileName="products"
      />
    </div>
  )
}
