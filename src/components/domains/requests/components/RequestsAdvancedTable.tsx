'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { AdvancedTable, useServerTable, buildQueryParams } from '@/components/shared/tables/AdvancedTable'
import { api } from '@/lib/api'
import Badge from '@/components/shared/ui/badge/Badge'
import { TrashBinIcon, PencilIcon } from '@/icons'
import type { ServerTableParams } from '@/components/shared/tables/AdvancedTable/useServerTable'

interface Request {
  id: string
  customerName: string
  eventDate: string
  eventType: string
  guestCount: number
  budget: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  createdAt: string
}

export default function RequestsAdvancedTable() {
  const {
    data,
    serverSideConfig,
    pagination,
    setPagination,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    refetch,
  } = useServerTable<Request>({
    queryKey: ['requests', 'list'],
    queryFn: async (params: ServerTableParams) => {
      const queryParams = buildQueryParams(params)

      const { data: response, error } = await api.GET('/requests', {
        params: { query: queryParams },
      })

      if (error) {
        throw new Error('Failed to fetch requests')
      }

      return {
        data: (response as any)?.requests || [],
        total: (response as any)?.total || 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(((response as any)?.total || 0) / params.pageSize),
      }
    },
    initialPageSize: 10,
  })

  const columns = useMemo<ColumnDef<Request>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-800 dark:text-white/90">
              {row.original.customerName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID: {row.original.id.slice(0, 8)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'eventType',
        header: 'Event Type',
        cell: ({ row }) => (
          <span className="text-gray-800 dark:text-gray-400">
            {row.original.eventType}
          </span>
        ),
      },
      {
        accessorKey: 'eventDate',
        header: 'Event Date',
        cell: ({ row }) => (
          <span className="text-gray-800 dark:text-gray-400">
            {new Date(row.original.eventDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'guestCount',
        header: 'Guests',
        cell: ({ row }) => (
          <span className="text-gray-800 dark:text-gray-400">
            {row.original.guestCount}
          </span>
        ),
      },
      {
        accessorKey: 'budget',
        header: 'Budget',
        cell: ({ row }) => (
          <span className="font-medium text-gray-800 dark:text-white/90">
            ${row.original.budget.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const colorMap = {
            pending: 'warning' as const,
            active: 'primary' as const,
            completed: 'success' as const,
            cancelled: 'error' as const,
          }

          return (
            <Badge size="sm" color={colorMap[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
              onClick={() => console.log('Edit', row.original.id)}
            >
              <PencilIcon />
            </button>
            <button
              className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
              onClick={() => console.log('Delete', row.original.id)}
            >
              <TrashBinIcon />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    []
  )

  return (
    <AdvancedTable
      columns={columns}
      data={data}
      enableSorting
      enableFiltering
      enableGlobalFilter
      enablePagination
      enableRowSelection
      enableMultiRowSelection
      serverSide={serverSideConfig}
      searchPlaceholder="Search requests..."
      bulkActions={[
        {
          label: 'Delete',
          variant: 'destructive',
          icon: <TrashBinIcon />,
          onClick: (selectedRows) => {
            console.log('Bulk delete:', selectedRows)
          },
        },
        {
          label: 'Export',
          variant: 'outline',
          onClick: (selectedRows) => {
            console.log('Bulk export:', selectedRows)
          },
        },
      ]}
      onRowClick={(row) => {
        console.log('Row clicked:', row)
      }}
      onStateChange={(state) => {
        if (state.sorting) setSorting(state.sorting)
        if (state.pagination) setPagination(state.pagination)
        if (state.globalFilter !== undefined) setGlobalFilter(state.globalFilter)
      }}
      showSearch
      showPagination
      showExport
      showRowsPerPage
      exportFileName="requests"
    />
  )
}
