'use client'

import { useState } from 'react'
import {
  AdvancedTablePlugin,
  MockDataSource,
  LocalStorageDataSource,
  ManualSchemaProvider,
  type ColumnDefinition,
  type CellRenderProps,
} from '@/components/shared/tables/AdvancedTable'
import Badge from '@/components/shared/ui/badge/Badge'
import { TrashBinIcon, PencilIcon, EyeIcon } from '@/icons'
import { Button } from '@/components/shared/ui/button'

interface Product {
  id: string
  name: string
  category: string
  price: number
  inStock: boolean
  rating: number
  launchDate: string
  tags: string[]
}

const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Toys']
const allTags = ['New', 'Popular', 'Sale', 'Featured', 'Limited Edition', 'Bestseller']

function generateProduct(id: number): Product {
  const products = ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Watch', 'Camera', 'Speaker', 'Monitor']
  const name = `${products[id % products.length]} ${id > 8 ? id : ''}`
  const category = categories[id % categories.length]
  const price = 50 + (id % 10) * 100
  const inStock = id % 3 !== 0
  const rating = 3 + (id % 3)
  const launchDate = new Date(2022 + (id % 3), (id % 12), (id % 28) + 1).toISOString().split('T')[0]

  const tagCount = 1 + (id % 3)
  const tags = Array.from({ length: tagCount }, (_, i) =>
    allTags[(id + i) % allTags.length]
  )

  return {
    id: String(id),
    name,
    category,
    price,
    inStock,
    rating,
    launchDate,
    tags,
  }
}

const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => generateProduct(i + 1))

export default function TableTestPage() {
  const productColumns: ColumnDefinition<Product, any>[] = [
    {
      key: 'name',
      header: 'Product Name',
      type: 'text',
      sortable: true,
      filterable: true,
      cell: ({ value }: CellRenderProps<Product, string>) => (
        <span className="font-medium text-gray-800 dark:text-white/90">{value}</span>
      ),
    } as ColumnDefinition<Product, string>,
    {
      key: 'category',
      header: 'Category',
      type: 'select',
      sortable: true,
      filterable: true,
      options: categories.map(cat => ({ label: cat, value: cat })),
      cell: ({ value }: CellRenderProps<Product, string>) => (
        <Badge size="sm" color="default">{value}</Badge>
      ),
    } as ColumnDefinition<Product, string>,
    {
      key: 'price',
      header: 'Price',
      type: 'currency',
      sortable: true,
      filterable: true,
      align: 'right',
      format: (value: number) => `$${value.toFixed(2)}`,
      cell: ({ value }: CellRenderProps<Product, number>) => {
        const price = value as number
        return (
          <span className="font-mono font-semibold text-gray-800 dark:text-white/90">
            ${price.toFixed(2)}
          </span>
        )
      },
    } as ColumnDefinition<Product, number>,
    {
      key: 'inStock',
      header: 'In Stock',
      type: 'boolean',
      sortable: true,
      filterable: true,
      align: 'center',
      cell: ({ value }: CellRenderProps<Product, boolean>) => (
        <Badge size="sm" color={value ? 'success' : 'error'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      ),
    } as ColumnDefinition<Product, boolean>,
    {
      key: 'rating',
      header: 'Rating',
      type: 'number',
      sortable: true,
      filterable: true,
      align: 'center',
      cell: ({ value }: CellRenderProps<Product, number>) => (
        <div className="flex items-center justify-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="font-medium text-gray-800 dark:text-white/90">{value}.0</span>
        </div>
      ),
    } as ColumnDefinition<Product, number>,
    {
      key: 'launchDate',
      header: 'Launch Date',
      type: 'date',
      sortable: true,
      filterable: true,
      cell: ({ value }: CellRenderProps<Product, string>) => (
        <span className="text-gray-800 dark:text-gray-400">
          {new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    } as ColumnDefinition<Product, string>,
    {
      key: 'tags',
      header: 'Tags',
      type: 'multi-select',
      filterable: true,
      options: allTags.map(tag => ({ label: tag, value: tag })),
      cell: ({ value }: CellRenderProps<Product, string[]>) => (
        <div className="flex flex-wrap gap-1">
          {value.map((tag, idx) => (
            <Badge key={idx} size="sm" color="default">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    } as ColumnDefinition<Product, string[]>,
    {
      key: 'actions' as keyof Product,
      header: 'Actions',
      type: 'custom',
      sortable: false,
      filterable: false,
      width: 120,
      cell: ({ row }: CellRenderProps<Product, unknown>) => (
        <div className="flex items-center gap-2">
          <button
            className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-500"
            onClick={(e) => {
              e.stopPropagation()
              alert(`View details for ${row.name}`)
            }}
            title="View"
          >
            <EyeIcon />
          </button>
          <button
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
            onClick={(e) => {
              e.stopPropagation()
              alert(`Edit ${row.name}`)
            }}
            title="Edit"
          >
            <PencilIcon />
          </button>
          <button
            className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete ${row.name}?`)) {
                alert('Deleted!')
              }
            }}
            title="Delete"
          >
            <TrashBinIcon />
          </button>
        </div>
      ),
    } as ColumnDefinition<Product, unknown>,
  ]

  const mockDataSource = new MockDataSource({
    data: mockProducts,
    getRowId: (row) => row.id,
    delay: 500,
  })

  const localStorageDataSource = new LocalStorageDataSource({
    key: 'table-test-products',
    getRowId: (row) => row.id,
    defaultData: mockProducts,
  })

  const schemaProvider = new ManualSchemaProvider(productColumns)

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Advanced Table Plugin - Complete Feature Showcase
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          All features in one place: sorting, filtering, search, pagination, row selection, bulk actions, inline editing, exports, and more
        </p>
      </div>

      <div className="mb-4 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
        <h3 className="font-medium text-brand-900 dark:text-brand-300 mb-2">
          🎯 Complete Feature Set
        </h3>
        <p className="text-sm text-brand-800 dark:text-brand-400 mb-3">
          This example demonstrates EVERY feature available in the plugin architecture:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-brand-800 dark:text-brand-400">
          <li>✓ <strong>Row Selection</strong> - Checkboxes with select all</li>
          <li>✓ <strong>Bulk Actions</strong> - Delete, Edit, Update selected rows</li>
          <li>✓ <strong>Inline Editing</strong> - Text, Select, Checkbox, Multi-Select</li>
          <li>✓ <strong>Sorting</strong> - Click column headers</li>
          <li>✓ <strong>Global Search</strong> - Search across all columns</li>
          <li>✓ <strong>Pagination</strong> - Navigate pages, change size</li>
          <li>✓ <strong>Export</strong> - Download as CSV</li>
          <li>✓ <strong>Column Visibility</strong> - Show/hide columns</li>
          <li>✓ <strong>Action Column</strong> - View/Edit/Delete per row</li>
          <li>✓ <strong>Yellow Highlight</strong> - Edited rows</li>
          <li>✓ <strong>Save/Cancel</strong> - Per row or bulk save</li>
          <li>✓ <strong>Dark Mode</strong> - Full theme support</li>
        </ul>
      </div>

      <AdvancedTablePlugin
        dataSource={mockDataSource}
        schemaProvider={schemaProvider}
        features={{
          sorting: true,
          filtering: true,
          globalSearch: true,
          pagination: {
            pageSize: 10,
            pageSizeOptions: [5, 10, 20, 50],
          },
          rowSelection: {
            multiple: true,
            preserveSelection: false,
          },
          inlineEditing: true,
          columnVisibility: true,
          export: true,
        }}
        editableColumns={['name', 'category', 'price', 'inStock', 'rating', 'tags']}
        onCellEdit={async (rowId, columnId, value) => {
          console.log('Cell edited:', { rowId, columnId, value })
        }}
        onSaveRow={async (rowId, changes) => {
          console.log('Saving row:', { rowId, changes })
          alert(`Saved changes for row ${rowId}:\n${JSON.stringify(changes, null, 2)}`)
        }}
        onCancelRow={(rowId) => {
          console.log('Cancelled edits for row:', rowId)
        }}
        onSaveAll={async (allChanges) => {
          console.log('Saving all changes:', allChanges)
          alert(`Saving ${Object.keys(allChanges).length} edited rows:\n${JSON.stringify(allChanges, null, 2)}`)
        }}
        onCancelAll={() => {
          console.log('Cancelled all edits')
          alert('Cancelled all pending edits')
        }}
        bulkActions={[
          {
            label: 'Delete Selected',
            variant: 'destructive',
            icon: <TrashBinIcon className="w-4 h-4" />,
            onClick: (selectedRows) => {
              if (confirm(`Delete ${selectedRows.length} product(s)?`)) {
                alert(`Deleted ${selectedRows.length} products!\n\nProducts: ${selectedRows.map(p => p.name).join(', ')}`)
              }
            },
          },
          {
            label: 'Mark as Featured',
            variant: 'default',
            onClick: (selectedRows) => {
              alert(`Marked ${selectedRows.length} products as featured!\n\nProducts: ${selectedRows.map(p => p.name).join(', ')}`)
            },
          },
          {
            label: 'Update Stock',
            variant: 'outline',
            onClick: (selectedRows) => {
              alert(`Update stock for ${selectedRows.length} products?\n\nProducts: ${selectedRows.map(p => p.name).join(', ')}`)
            },
          },
          {
            label: 'Export Selected',
            variant: 'outline',
            onClick: (selectedRows) => {
              console.log('Exporting selected rows:', selectedRows)
              alert(`Exporting ${selectedRows.length} products to CSV...`)
            },
          },
        ]}
        getRowId={(row) => row.id}
        onRowClick={(row) => console.log('Row clicked:', row)}
        searchPlaceholder="Search products..."
        exportFileName="products-showcase"
      />

      <div className="mt-8 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Feature Testing Checklist
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Data Operations</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>☐ <strong>Sort:</strong> Click column headers (name, price, rating, etc.)</li>
              <li>☐ <strong>Search:</strong> Type in search box to filter globally</li>
              <li>☐ <strong>Pagination:</strong> Navigate pages, change rows per page</li>
              <li>☐ <strong>Filter:</strong> Use column-specific filters</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Row Actions</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>☐ <strong>Select Row:</strong> Click checkbox on any row</li>
              <li>☐ <strong>Select All:</strong> Click header checkbox</li>
              <li>☐ <strong>View:</strong> Click eye icon in Actions column</li>
              <li>☐ <strong>Edit:</strong> Click pencil icon in Actions column</li>
              <li>☐ <strong>Delete:</strong> Click trash icon in Actions column</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Bulk Operations</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>☐ <strong>Bulk Delete:</strong> Select rows → Click &quot;Delete Selected&quot;</li>
              <li>☐ <strong>Bulk Edit:</strong> Select rows → Click &quot;Mark as Featured&quot;</li>
              <li>☐ <strong>Bulk Update:</strong> Select rows → Click &quot;Update Stock&quot;</li>
              <li>☐ <strong>Bulk Export:</strong> Select rows → Click &quot;Export Selected&quot;</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Inline Editing</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>☐ <strong>Text:</strong> Double-click Name (text input)</li>
              <li>☐ <strong>Select:</strong> Double-click Category (dropdown)</li>
              <li>☐ <strong>Number:</strong> Double-click Price or Rating</li>
              <li>☐ <strong>Checkbox:</strong> Click In Stock (toggle checkbox)</li>
              <li>☐ <strong>Multi-Select:</strong> Double-click Tags (multi-select popup)</li>
              <li>☐ <strong>Yellow Highlight:</strong> Edited rows show background</li>
              <li>☐ <strong>Save/Cancel:</strong> Checkmark/X in actions column</li>
              <li>☐ <strong>Bulk Save:</strong> Edit multiple → toolbar appears</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Export & Display</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>☐ <strong>Export CSV:</strong> Click &quot;Export CSV&quot; button</li>
              <li>☐ <strong>Column Visibility:</strong> Toggle columns on/off</li>
              <li>☐ <strong>Row Click:</strong> Click anywhere on row (check console)</li>
              <li>☐ <strong>Dark Mode:</strong> Toggle theme to test styling</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Plugin Architecture</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>☐ <strong>Data Source:</strong> MockDataSource with 500ms delay</li>
              <li>☐ <strong>Loading States:</strong> Skeleton appears during fetch</li>
              <li>☐ <strong>Schema Provider:</strong> ManualSchemaProvider defines columns</li>
              <li>☐ <strong>Swappable:</strong> Can replace with ApiDataSource or LocalStorage</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Column Types</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>☐ <strong>Text:</strong> Product Name (sortable)</li>
              <li>☐ <strong>Select:</strong> Category (badges)</li>
              <li>☐ <strong>Currency:</strong> Price ($XX.XX format)</li>
              <li>☐ <strong>Boolean:</strong> In Stock (Yes/No badges)</li>
              <li>☐ <strong>Number:</strong> Rating (star display)</li>
              <li>☐ <strong>Date:</strong> Launch Date (formatted)</li>
              <li>☐ <strong>Multi-Select:</strong> Tags (multiple badges)</li>
              <li>☐ <strong>Custom:</strong> Actions (icon buttons)</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2 text-sm">
            💡 Quick Usage Example
          </h4>
          <pre className="text-xs text-yellow-800 dark:text-yellow-400 font-mono overflow-x-auto">
{`// 1. Create your data source (swap anytime!)
const dataSource = new MockDataSource({ data: products })
// const dataSource = new ApiDataSource({ transport, endpoints })
// const dataSource = new LocalStorageDataSource({ key: 'my-data' })

// 2. Define your schema
const schema = new ManualSchemaProvider(columns)

// 3. Render the table - DONE! 🎉
<AdvancedTablePlugin
  dataSource={dataSource}
  schemaProvider={schema}
  features={{ sorting: true, pagination: true, rowSelection: true }}
  bulkActions={[{ label: 'Delete', onClick: (rows) => deleteRows(rows) }]}
/>`}
          </pre>
        </div>
      </div>
    </div>
  )
}
