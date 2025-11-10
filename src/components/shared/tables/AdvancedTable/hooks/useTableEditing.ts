import { useState, useCallback } from 'react'

export interface UseTableEditingResult<TRow> {
  editedRows: Record<string, Partial<TRow>>
  hasEdits: boolean
  handleCellEdit: (rowId: string, columnId: string, value: any) => Promise<void>
  handleSaveRowEdits: (rowId: string) => Promise<void>
  handleCancelRowEdits: (rowId: string) => void
  handleSaveAllEdits: () => Promise<void>
  handleCancelAllEdits: () => void
  isRowEdited: (rowId: string) => boolean
}

export interface UseTableEditingOptions<TRow> {
  onCellEdit?: (rowId: string, columnId: string, value: any) => void | Promise<void>
  onSaveRow?: (rowId: string, changes: Partial<TRow>) => void | Promise<void>
  onCancelRow?: (rowId: string) => void
  onSaveAll?: (allChanges: Record<string, Partial<TRow>>) => void | Promise<void>
  onCancelAll?: () => void
}

export function useTableEditing<TRow>(
  options: UseTableEditingOptions<TRow> = {}
): UseTableEditingResult<TRow> {
  const {
    onCellEdit,
    onSaveRow,
    onCancelRow,
    onSaveAll,
    onCancelAll,
  } = options

  const [editedRows, setEditedRows] = useState<Record<string, Partial<TRow>>>({})

  const handleCellEdit = useCallback(async (rowId: string, columnId: string, value: any) => {
    setEditedRows(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [columnId]: value
      }
    }))

    if (onCellEdit) {
      await onCellEdit(rowId, columnId, value)
    }
  }, [onCellEdit])

  const handleSaveRowEdits = useCallback(async (rowId: string) => {
    const changes = editedRows[rowId]
    if (!changes) return

    if (onSaveRow) {
      await onSaveRow(rowId, changes)
    }

    setEditedRows(prev => {
      const newState = { ...prev }
      delete newState[rowId]
      return newState
    })
  }, [editedRows, onSaveRow])

  const handleCancelRowEdits = useCallback((rowId: string) => {
    if (onCancelRow) {
      onCancelRow(rowId)
    }

    setEditedRows(prev => {
      const newState = { ...prev }
      delete newState[rowId]
      return newState
    })
  }, [onCancelRow])

  const handleSaveAllEdits = useCallback(async () => {
    if (onSaveAll) {
      await onSaveAll(editedRows)
    }

    setEditedRows({})
  }, [editedRows, onSaveAll])

  const handleCancelAllEdits = useCallback(() => {
    if (onCancelAll) {
      onCancelAll()
    }

    setEditedRows({})
  }, [onCancelAll])

  const isRowEdited = useCallback((rowId: string) => {
    return !!editedRows[rowId]
  }, [editedRows])

  return {
    editedRows,
    hasEdits: Object.keys(editedRows).length > 0,
    handleCellEdit,
    handleSaveRowEdits,
    handleCancelRowEdits,
    handleSaveAllEdits,
    handleCancelAllEdits,
    isRowEdited,
  }
}
