'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { AdvancedTableEnhanced } from '@/components/shared/tables/AdvancedTable/AdvancedTableEnhanced'
import { api, type components } from '@/lib/api'
import { toast } from 'sonner'
import { Trash2, Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Ingredient = components['schemas']['response.IngredientResponse']
type IngredientCategory = components['schemas']['entity.IngredientCategory']
type IngredientUnit = components['schemas']['entity.IngredientUnit']

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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['ingredients', accountId, pagination, sorting, columnFilters, globalFilter],
    queryFn: async () => {
      const { data, error } = await api.GET('/ingredients', {
        params: {
          query: {
            location_id: accountId,
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
            sort_by: sorting[0]?.id as any,
            sort_order: sorting[0]?.desc ? 'desc' : 'asc',
            search: globalFilter || undefined,
            category: (columnFilters.find(f => f.id === 'category')?.value as string) || undefined,
            status: (columnFilters.find(f => f.id === 'status')?.value as any) || undefined,
          },
        },
      })

      if (error) throw error

      return {
        data: data?.ingredients || [],
        total: data?.total || 0,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      }
    },
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/ingredients/{id}', {
        params: { path: { id } },
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients', accountId])
      toast.success(t('deleteSuccess'))
    },
    onError: () => {
      toast.error(t('deleteFailed'))
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id =>
        api.DELETE('/ingredients/{id}', {
          params: { path: { id } },
        })
      ))
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients', accountId])
      toast.success(t('deleteSuccess'))
    },
    onError: () => {
      toast.error(t('deleteFailed'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ingredient> }) => {
      const { error } = await api.PUT('/ingredients/{id}', {
        params: { path: { id } },
        body: updates as any,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients', accountId])
      toast.success(t('inlineEdit.success'))
    },
    onError: () => {
      toast.error(t('inlineEdit.error'))
    },
  })

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

  const handleCellEdit = async (rowId: string, columnId: string, value: any) => {
    if (columnId === 'name' && typeof value === 'string' && value.trim() === '') {
      toast.error(t('inlineEdit.validation.nameRequired'))
      throw new Error('Name is required')
    }

    if ((columnId === 'currentStock' || columnId === 'reorderLevel' || columnId === 'costPerUnitCents') &&
        (value < 0 || isNaN(value))) {
      toast.error(t('inlineEdit.validation.stockPositive'))
      throw new Error('Invalid value')
    }

    updateMutation.mutate({
      id: rowId,
      updates: { [columnId]: value },
    })
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
      },
      {
        accessorKey: 'name',
        header: t('table.name'),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {row.original.name}
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
            {row.original.category}
          </span>
        ),
        meta: {
          filterType: 'select',
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
        },
      },
      {
        accessorKey: 'currentStock',
        header: t('table.stock'),
        cell: ({ row }) => (
          <div>
            <span className="text-sm text-gray-700 dark:text-gray-400">
              {row.original.currentStock?.toFixed(2) || '0.00'}
            </span>
            {row.original.reorderLevel && (
              <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">
                ({t('table.reorderLevel')}: {row.original.reorderLevel})
              </span>
            )}
          </div>
        ),
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
            {formatCurrency(row.original.costPerUnitCents, row.original.currency)}
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
            {row.original.supplier || '—'}
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
            onClick={() => {
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
    [t]
  )

  return (
    <AdvancedTableEnhanced
      columns={columns}
      data={data?.data || []}
      enableSorting
      enableFiltering
      enableGlobalFilter
      enablePagination
      enableRowSelection
      enableMultiRowSelection
      serverSide={{
        enabled: true,
        isLoading,
        isFetching,
        totalPages: Math.ceil((data?.total || 0) / pagination.pageSize),
      }}
      bulkActions={[
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
      ]}
      editableColumns={['name', 'currentStock', 'costPerUnitCents', 'supplier']}
      onCellEdit={handleCellEdit}
      onStateChange={(state) => {
        if (state.sorting) setSorting(state.sorting)
        if (state.columnFilters) setColumnFilters(state.columnFilters)
        if (state.pagination) setPagination(state.pagination)
        if (state.globalFilter !== undefined) setGlobalFilter(state.globalFilter)
      }}
      initialState={{
        sorting,
        columnFilters,
        pagination,
      }}
      searchPlaceholder={t('searchPlaceholder')}
      exportFileName="ingredients"
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('emptyState')}</p>
        </div>
      }
    />
  )
}
