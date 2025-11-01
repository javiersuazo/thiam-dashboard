'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { AdvancedTable } from '@/components/shared/tables/AdvancedTable'
import { api, type components } from '@/lib/api'
import { useBulkDeleteIngredients, useBatchUpdateIngredients } from '@/lib/api/ingredients.hooks'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Ingredient = components['schemas']['response.IngredientResponse']

interface IngredientTableProps {
  accountId: string
}

export function IngredientTable({ accountId }: IngredientTableProps) {
  const t = useTranslations('inventory.ingredients')
  const queryClient = useQueryClient()

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [editedRows, setEditedRows] = useState<Record<string, Partial<Ingredient>>>({})

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['ingredients', accountId, pagination, sorting, columnFilters, globalFilter],
    queryFn: async () => {
      console.log('🔍 Fetching ingredients with params:', {
        accountId,
        pagination,
        sorting,
        columnFilters,
        globalFilter,
      })

      const { data, error } = await api.GET('/v1/accounts/{accountId}/ingredients', {
        params: {
          path: { accountId },
          query: {
            limit: pagination.pageSize,
            page: pagination.pageIndex + 1,
            sort_by: sorting[0]?.id as any,
            sort_order: sorting[0]?.desc ? 'desc' : 'asc',
            search: globalFilter || undefined,
            category: (columnFilters.find(f => f.id === 'category')?.value as string) || undefined,
            status: (columnFilters.find(f => f.id === 'status')?.value as any) || undefined,
          },
        },
      })

      if (error) {
        console.error('❌ Failed to fetch ingredients:', error)
        throw error
      }

      console.log('✅ Ingredients fetched:', {
        count: data?.data?.length || 0,
        total: data?.meta?.total || 0,
      })

      return {
        data: data?.data || [],
        total: data?.meta?.total || 0,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      }
    },
    enabled: !!accountId,
    placeholderData: (previousData) => previousData,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/v1/accounts/{accountId}/ingredients/{id}', {
        params: { path: { accountId, id } },
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', accountId] })
      toast.success(t('deleteSuccess'))
    },
    onError: () => {
      toast.error(t('deleteFailed'))
    },
  })

  const bulkDeleteMutation = useBulkDeleteIngredients(accountId, {
    onSuccess: (data) => {
      console.log(`✅ Bulk Delete - Success: ${data.deleted} items deleted`)
      toast.success(t('deleteSuccess'))
    },
    onError: (error) => {
      console.error('❌ Bulk Delete - Failed:', error)
      toast.error(t('deleteFailed'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ingredient> }) => {
      const { error } = await api.PUT('/v1/accounts/{accountId}/ingredients/{id}', {
        params: { path: { accountId, id } },
        body: updates as any,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients', accountId] })
      toast.success(t('inlineEdit.success'))
    },
    onError: () => {
      toast.error(t('inlineEdit.error'))
    },
  })

  const batchUpdateMutation = useBatchUpdateIngredients(accountId, {
    onSuccess: (data) => {
      console.log(`✅ Batch Update - Success: ${data.updated} items updated`)
      setEditedRows({})
      toast.success(t('bulkSaveSuccess'))
    },
    onError: (error) => {
      console.error('❌ Batch Update - Failed:', error)
      toast.error(t('bulkSaveFailed'))
    },
  })

  const handleCellEdit = (rowId: string, columnId: string, value: any) => {
    console.log('✏️ Cell Edit:', { rowId, columnId, value })
    setEditedRows(prev => {
      const updated = {
        ...prev,
        [rowId]: {
          ...prev[rowId],
          [columnId]: value,
        },
      }
      console.log('📊 Updated editedRows state:', updated)
      return updated
    })
  }

  const handleSaveAll = async () => {
    console.log('💾 Batch Update - Starting for edited rows:', {
      totalEdited: Object.keys(editedRows).length,
      editedData: editedRows,
    })

    console.log('🚀 Sending PATCH /v1/accounts/{accountId}/ingredients/batch-update', {
      updates: editedRows,
    })

    await batchUpdateMutation.mutateAsync(editedRows)
  }

  const handleCancelAll = () => {
    setEditedRows({})
    toast.info(t('changesDiscarded'))
  }

  const formatCurrency = (cents: number | null | undefined, currency?: string) => {
    if (cents === null || cents === undefined) return '—'
    const amount = cents / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  const getStockStatus = (currentStock?: number, reorderLevel?: number) => {
    if (!currentStock || currentStock <= 0) {
      return {
        label: t('stockStatus.outOfStock'),
        className: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
      }
    }
    if (reorderLevel && currentStock <= reorderLevel) {
      return {
        label: t('stockStatus.lowStock'),
        className: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500',
      }
    }
    return {
      label: t('stockStatus.inStock'),
      className: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
    }
  }

  const columns = useMemo<ColumnDef<Ingredient>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: t('table.name'),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {editedRows[row.id]?.name ?? row.original.name}
            </span>
            {row.original.description && (
              <span className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-xs">
                {row.original.description}
              </span>
            )}
          </div>
        ),
        meta: {
          filterType: 'text',
          editType: 'text',
        },
      },
      {
        accessorKey: 'category',
        header: t('table.category'),
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-400 capitalize">
            {editedRows[row.id]?.category ?? row.original.category}
          </span>
        ),
        meta: {
          filterType: 'select',
          editType: 'select',
          filterOptions: [
            { label: t('categories.vegetables'), value: 'vegetables' },
            { label: t('categories.fruits'), value: 'fruits' },
            { label: t('categories.meat'), value: 'meat' },
            { label: t('categories.seafood'), value: 'seafood' },
            { label: t('categories.dairy'), value: 'dairy' },
            { label: t('categories.grains'), value: 'grains' },
            { label: t('categories.bakery'), value: 'bakery' },
            { label: t('categories.spices'), value: 'spices' },
            { label: t('categories.oils'), value: 'oils' },
            { label: t('categories.condiments'), value: 'condiments' },
            { label: t('categories.beverages'), value: 'beverages' },
            { label: t('categories.canned'), value: 'canned' },
            { label: t('categories.frozen'), value: 'frozen' },
            { label: t('categories.supplies'), value: 'supplies' },
            { label: t('categories.other'), value: 'other' },
          ],
          editOptions: [
            { label: t('categories.vegetables'), value: 'vegetables' },
            { label: t('categories.fruits'), value: 'fruits' },
            { label: t('categories.meat'), value: 'meat' },
            { label: t('categories.seafood'), value: 'seafood' },
            { label: t('categories.dairy'), value: 'dairy' },
            { label: t('categories.grains'), value: 'grains' },
            { label: t('categories.bakery'), value: 'bakery' },
            { label: t('categories.spices'), value: 'spices' },
            { label: t('categories.oils'), value: 'oils' },
            { label: t('categories.condiments'), value: 'condiments' },
            { label: t('categories.beverages'), value: 'beverages' },
            { label: t('categories.canned'), value: 'canned' },
            { label: t('categories.frozen'), value: 'frozen' },
            { label: t('categories.supplies'), value: 'supplies' },
            { label: t('categories.other'), value: 'other' },
          ],
        },
      },
      {
        accessorKey: 'currentStock',
        header: t('table.stock'),
        cell: ({ row }) => {
          const stock = editedRows[row.id]?.currentStock ?? row.original.currentStock
          return (
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">
                {stock?.toFixed(2) || '0.00'}
              </span>
              {row.original.reorderLevel && (
                <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">
                  ({t('table.reorderLevel')}: {row.original.reorderLevel})
                </span>
              )}
            </div>
          )
        },
        meta: {
          editType: 'number',
        },
      },
      {
        accessorKey: 'unit',
        header: t('table.unit'),
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-400 uppercase">
            {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: 'costPerUnitCents',
        header: t('table.costPerUnit'),
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {formatCurrency(
              editedRows[row.id]?.costPerUnitCents ?? row.original.costPerUnitCents,
              row.original.currency
            )}
          </span>
        ),
        meta: {
          editType: 'number',
        },
      },
      {
        accessorKey: 'supplier',
        header: t('table.supplier'),
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {editedRows[row.id]?.supplier ?? row.original.supplier ?? '—'}
          </span>
        ),
        meta: {
          filterType: 'text',
          editType: 'text',
        },
      },
      {
        id: 'stockStatus',
        header: t('table.status'),
        cell: ({ row }) => {
          const status = getStockStatus(row.original.currentStock, row.original.reorderLevel)
          return (
            <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${status.className}`}>
              {status.label}
            </span>
          )
        },
        meta: {
          filterType: 'select',
          filterOptions: [
            { label: t('stockStatus.inStock'), value: 'active' },
            { label: t('stockStatus.lowStock'), value: 'low_stock' },
            { label: t('stockStatus.outOfStock'), value: 'inactive' },
          ],
        },
      },
      {
        accessorKey: 'isActive',
        header: t('table.active'),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.original.isActive}
            disabled
            className="h-4 w-4 rounded border-gray-300 text-blue-600 disabled:opacity-50"
          />
        ),
      },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(t('confirmDelete', { name: row.original.name }))) {
                deleteMutation.mutate(row.original.id!)
              }
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [t, editedRows]
  )

  return (
    <AdvancedTable
      columns={columns}
      data={data?.data || []}
      getRowId={(row) => row.id!}

      features={{
        sorting: true,
        filtering: true,
        globalSearch: true,
        pagination: true,
        rowSelection: true,
        export: true,
      }}

      server={{
        enabled: true,
        isLoading,
        isFetching,
        totalPages: Math.ceil((data?.total || 0) / pagination.pageSize),
      }}

      state={{
        controlled: {
          pagination: [pagination, setPagination],
          sorting: [sorting, setSorting],
          filters: [columnFilters, setColumnFilters],
          search: [globalFilter, setGlobalFilter],
        },
      }}

      editing={{
        enabled: true,
        mode: 'cell',
        columns: ['name', 'category', 'currentStock', 'costPerUnitCents', 'supplier'],
        onEdit: handleCellEdit,
        bulk: {
          enabled: Object.keys(editedRows).length > 0,
          onSaveAll: handleSaveAll,
          onCancelAll: handleCancelAll,
          saveLabel: `${t('saveChanges')} (${Object.keys(editedRows).length})`,
          cancelLabel: t('cancelChanges'),
        },
      }}

      actions={{
        bulk: [
          {
            label: t('actions.delete') + ' Selected',
            variant: 'destructive',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (selectedRows) => {
              const ids = selectedRows.map((row) => row.id!)
              if (confirm(t('confirmBulkDelete', { count: ids.length }))) {
                bulkDeleteMutation.mutate(ids)
              }
            },
          },
        ],
      }}

      ui={{
        toolbar: {
          search: {
            placeholder: t('searchPlaceholder'),
          },
          export: {
            filename: 'ingredients',
          },
        },
        states: {
          empty: (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('emptyState')}</p>
            </div>
          ),
        },
      }}

      styling={{
        row: {
          className: (row) =>
            editedRows[row.id] ? 'bg-yellow-50 dark:bg-yellow-900/10' : '',
          highlightSelected: true,
        },
        table: {
          striped: true,
          hoverable: true,
        },
      }}
    />
  )
}
