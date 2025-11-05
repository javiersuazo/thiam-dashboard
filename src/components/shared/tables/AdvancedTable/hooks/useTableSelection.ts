import { useMemo, useCallback } from 'react'
import type { TableState } from '../core/interfaces'

export interface UseTableSelectionResult {
  rowSelectionState: Record<string, boolean>
  handleRowSelectionChange: (updater: any, data: any[], getRowId: (row: any) => string, setTableState: any) => void
}

export function useTableSelection<TRow>(
  tableState: TableState,
  data: TRow[],
  getRowId: (row: TRow) => string
): UseTableSelectionResult {
  const rowSelectionState = useMemo(() => {
    const state: Record<string, boolean> = {}
    tableState.selection.forEach((id) => {
      const index = data.findIndex(row => getRowId(row) === id)
      if (index !== -1) {
        state[index] = true
      }
    })
    return state
  }, [tableState.selection, data, getRowId])

  const handleRowSelectionChange = useCallback((
    updater: any,
    currentData: TRow[],
    rowIdGetter: (row: TRow) => string,
    setTableState: (updater: (prev: TableState) => TableState) => void
  ) => {
    const currentSelection = rowSelectionState
    const newSelection = typeof updater === 'function'
      ? updater(currentSelection)
      : updater

    const selectedIds = new Set<string>()
    Object.keys(newSelection).forEach((indexStr) => {
      const index = parseInt(indexStr, 10)
      if (newSelection[indexStr] && currentData[index]) {
        selectedIds.add(rowIdGetter(currentData[index]))
      }
    })

    setTableState(prev => ({
      ...prev,
      selection: selectedIds,
    }))
  }, [rowSelectionState])

  return {
    rowSelectionState,
    handleRowSelectionChange,
  }
}
