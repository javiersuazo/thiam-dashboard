'use client'

import { useState } from 'react'
import { AdvancedTable } from '@/components/shared/tables/AdvancedTable'
import { api } from '@/lib/api'
import { useBulkDeleteMenuItems, useBatchUpdateMenuItems } from '@/lib/api/menuItems.hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import type { RowSelectionState } from '@tanstack/react-table'
import type { components } from '@/lib/api'

type MenuItem = components['schemas']['response.MenuItem']

interface MenuItemTableProps {
  catererId: string
}

interface DeleteConfirmState {
  open: boolean
  type: 'single' | 'bulk'
  ids: string[]
  name?: string
  count?: number
}

export function MenuItemTable({ catererId }: MenuItemTableProps) {
  const t = useTranslations('inventory.menuItems')
  const locale = useLocale()
  const queryClient = useQueryClient()

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [sorting, setSorting] = useState([{ id: 'name', desc: false }])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [editedRows, setEditedRows] = useState<Record<string, Partial<MenuItem>>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    type: 'single',
    ids: [],
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['menu-items', catererId, pagination, sorting, columnFilters, globalFilter],
    queryFn: async () => {
      const isActiveFilter = columnFilters.find((f) => f.id === 'isActive')?.value

      const { data: response, error } = await api.GET('/v1/caterers/{catererId}/menu-items', {
        params: {
          path: { catererId },
          query: {
            limit: pagination.pageSize,
            page: pagination.pageIndex + 1,
            sort_by: (sorting[0]?.id as 'name' | 'priceCents' | 'createdAt' | 'updatedAt') || 'name',
            sort_order: sorting[0]?.desc ? 'desc' : 'asc',
            search: globalFilter || undefined,
            visibility: (columnFilters.find((f) => f.id === 'visibility')?.value as string) || undefined,
            is_active: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined,
          },
        },
      })

      if (error) throw error

      return {
        data: response?.data || [],
        meta: {
          page: response?.page || 1,
          pageSize: response?.pageSize || 20,
          total: response?.total || 0,
          totalPages: response?.totalPages || 0,
        },
      }
    },
    enabled: !!catererId,
    placeholderData: (previousData) => previousData,
  })

  const bulkDeleteMutation = useBulkDeleteMenuItems(catererId, {
    onSuccess: (result) => {
      setRowSelection({})
      toast.success(t('deleteSuccess', { count: result.deleted }))
    },
    onError: () => {
      toast.error(t('deleteFailed'))
    },
  })

  const batchUpdateMutation = useBatchUpdateMenuItems(catererId, {
    onSuccess: (result) => {
      setEditedRows({})
      toast.success(t('bulkSaveSuccess', { count: result.updated }))
    },
    onError: () => {
      toast.error(t('bulkSaveFailed'))
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

  const formatDate = (dateString: string, format?: string) => {
    const date = new Date(dateString)
    if (format === 'datetime') {
      return date.toLocaleString()
    }
    return date.toLocaleDateString()
  }

  console.log('📋 MenuItemTable Debug:', {
    hasData: !!data,
    dataLength: data?.data?.length,
    metaTotalPages: data?.meta?.totalPages,
    isLoading,
    isFetching,
    catererId,
  })

  const handleCellEdit = (rowId: string, columnId: string, value: unknown) => {
    setEditedRows(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [columnId]: value,
      },
    }))
  }

  const handleSaveAll = async () => {
    const cleanedUpdates = Object.entries(editedRows).reduce((acc, [rowId, changes]) => {
      const cleanedChanges = Object.entries(changes).reduce((changeAcc, [key, val]) => {
        if (val !== null && val !== undefined && typeof val !== 'object') {
          changeAcc[key] = val
        } else if (val !== null && val !== undefined && typeof val === 'object' && !Array.isArray(val)) {
          console.warn('⚠️ Skipping object value:', { rowId, key, val })
        } else {
          changeAcc[key] = val
        }
        return changeAcc
      }, {} as Record<string, any>)

      acc[rowId] = cleanedChanges
      return acc
    }, {} as Record<string, any>)

    await batchUpdateMutation.mutateAsync(cleanedUpdates)
  }

  const handleCancelAll = () => {
    setEditedRows({})
    queryClient.resetQueries({ queryKey: ['menu-items', catererId] })
    toast.info(t('changesDiscarded'))
  }

  const handleConfirmDelete = () => {
    bulkDeleteMutation.mutate(deleteConfirm.ids)
    setDeleteConfirm({ open: false, type: 'single', ids: [] })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading menu items...</p>
        </div>
      </div>
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">No menu items found</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Debug: {JSON.stringify({ hasData: !!data, dataLength: data?.data?.length, catererId })}
        </p>
      </div>
    )
  }

  return (
    <>
      <AdvancedTable
        data={data?.data || []}
        schema={data?.meta?.schema}
        getRowId={(row) => row.id!}

        columns={!data?.meta?.schema ? [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'description', header: 'Description' },
          { accessorKey: 'priceCents', header: 'Price' },
          { accessorKey: 'sku', header: 'SKU' },
          { accessorKey: 'visibility', header: 'Visibility' },
          { accessorKey: 'isActive', header: 'Active' },
        ] : undefined}

        schemaOptions={{
          locale,
          formatCurrency,
          formatDate,
          t: (key) => t(`table.${key}`),
          enableRowSelection: true,
          customCells: {
            name: ({ row }) => (
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
            priceCents: ({ row }) => {
              const price = editedRows[row.id]?.priceCents ?? row.original.priceCents
              return (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  {formatCurrency(price, row.original.currency)}
                </span>
              )
            },
          },
          columnOverrides: {
            actions: {
              id: 'actions',
              header: t('table.actions'),
              cell: ({ row }) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm({
                      open: true,
                      type: 'single',
                      ids: [row.original.id!],
                      name: row.original.name,
                    })
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ),
            },
          },
        }}

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
          totalPages: data?.meta?.totalPages || 0,
        }}

        state={{
          controlled: {
            pagination: [pagination, setPagination],
            sorting: [sorting, setSorting],
            filters: [columnFilters, setColumnFilters],
            search: [globalFilter, setGlobalFilter],
            selection: [rowSelection, setRowSelection],
          },
        }}

        editing={{
          enabled: true,
          mode: 'cell',
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
                setDeleteConfirm({
                  open: true,
                  type: 'bulk',
                  ids,
                  count: ids.length,
                })
              },
            },
          ],
        }}

        ui={{
          toolbar: {
            show: true,
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
              editedRows[row.id] ? 'bg-yellow-50 dark:bg-yellow-900/10 shadow-sm border-l-2 border-yellow-400 dark:border-yellow-600' : '',
            highlightSelected: true,
          },
          table: {
            striped: true,
            hoverable: true,
          },
        }}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title={
          deleteConfirm.type === 'single'
            ? t('confirmDelete', { name: deleteConfirm.name })
            : t('confirmBulkDelete', { count: deleteConfirm.count })
        }
        description={
          deleteConfirm.type === 'single'
            ? t('confirmDeleteDescription')
            : t('confirmBulkDeleteDescription', { count: deleteConfirm.count })
        }
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={bulkDeleteMutation.isPending}
      />
    </>
  )
}
