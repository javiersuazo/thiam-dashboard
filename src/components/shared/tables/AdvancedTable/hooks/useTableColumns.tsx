import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Checkbox from '../../../form/input/Checkbox'
import { EditableCell } from '../components/EditableCell'
import type { ColumnDefinition, TableFeatures, CellRenderProps } from '../core/interfaces'

interface UseTableColumnsConfig<TRow> {
  baseColumns: ColumnDefinition[]
  features: TableFeatures
  editableColumns: string[]
  getRowId: (row: TRow) => string
}

export function useTableColumns<TRow>({
  baseColumns,
  features,
  editableColumns,
  getRowId,
}: UseTableColumnsConfig<TRow>) {
  return useMemo(() => {
    const cols: ColumnDef<TRow, any>[] = []

    if (features.rowSelection) {
      cols.push({
        id: 'select',
        header: ({ table }: any) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onChange={(checked) => {
              table.toggleAllPageRowsSelected(checked)
            }}
          />
        ),
        cell: ({ row }: any) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(checked) => {
              row.toggleSelected(checked)
            }}
          />
        ),
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      })
    }

    baseColumns.forEach(col => {
      const isEditable = editableColumns.includes(String(col.key))

      cols.push({
        id: String(col.key),
        accessorKey: String(col.key),
        header: col.header,
        cell: (context: any) => {
          const value = context.getValue()
          const row = context.row.original
          const rowId = getRowId(row)
          const meta = context.table.options.meta as any
          const editedValue = meta?.editedRows?.[rowId]?.[col.key as keyof TRow]
          const displayValue = editedValue !== undefined ? editedValue : value

          if (isEditable && features.inlineEditing) {
            const fieldType = col.type
            let editType: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'datetime' | 'checkbox' = 'text'

            if (fieldType === 'boolean') {
              editType = 'checkbox'
            } else if (fieldType === 'select') {
              editType = 'select'
            } else if (fieldType === 'multi-select') {
              editType = 'multiselect'
            } else if (fieldType === 'number' || fieldType === 'currency') {
              editType = 'number'
            } else if (fieldType === 'date') {
              editType = 'date'
            } else if (fieldType === 'datetime') {
              editType = 'datetime'
            }

            return (
              <EditableCell
                value={displayValue}
                onSave={(newValue) => meta?.handleCellEdit?.(rowId, String(col.key), newValue)}
                type={editType}
                options={col.options}
              />
            )
          }

          if (col.cell) {
            return col.cell({
              value: displayValue,
              row,
              column: col,
              rowIndex: context.row.index,
            })
          }

          if (col.format) return col.format(displayValue)
          if (displayValue === null || displayValue === undefined) return '-'
          return String(displayValue)
        },
        enableSorting: col.sortable !== false && features.sorting !== false,
        enableColumnFilter: col.filterable !== false && features.filtering !== false,
        size: typeof col.width === 'number' ? col.width : undefined,
        minSize: col.minWidth,
        maxSize: col.maxWidth,
      })
    })

    return cols
  }, [baseColumns, features, editableColumns, getRowId])
}
