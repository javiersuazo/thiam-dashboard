import { flexRender, type Cell } from '@tanstack/react-table'
import { TableCell } from '../../../ui/table'
import { CheckLineIcon, CloseIcon } from '@/icons'

interface TableDataCellProps<TRow> {
  cell: Cell<TRow, unknown>
  hasChanges: boolean
  rowId: string
  handleSaveRowEdits: (rowId: string) => void
  handleCancelRowEdits: (rowId: string) => void
}

export function TableDataCell<TRow>({
  cell,
  hasChanges,
  rowId,
  handleSaveRowEdits,
  handleCancelRowEdits,
}: TableDataCellProps<TRow>) {
  const isActionsColumn = cell.column.id === 'actions'

  return (
    <TableCell
      className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] text-theme-sm"
      style={{
        width: cell.column.getSize(),
      }}
    >
      {isActionsColumn && hasChanges ? (
        <div className="flex items-center gap-2">
          <button
            className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 active:bg-green-100 dark:active:bg-green-900/30"
            onClick={(e) => {
              e.stopPropagation()
              handleSaveRowEdits(rowId)
            }}
            title="Save changes"
          >
            <CheckLineIcon className="w-5 h-5" />
          </button>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation()
              handleCancelRowEdits(rowId)
            }}
            title="Cancel changes"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        flexRender(cell.column.columnDef.cell, cell.getContext())
      )}
    </TableCell>
  )
}
