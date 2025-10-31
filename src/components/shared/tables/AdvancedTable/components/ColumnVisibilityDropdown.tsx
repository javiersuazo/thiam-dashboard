'use client'

import { useState, useEffect } from 'react'
import { Table } from '@tanstack/react-table'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Dropdown } from '../../../ui/dropdown/Dropdown'

interface ColumnVisibilityDropdownProps<TData> {
  table: Table<TData>
}

interface SortableItemProps {
  id: string
  label: string
  isVisible: boolean
  canHide: boolean
  onToggle: () => void
}

function SortableItem({ id, label, isVisible, canHide, onToggle }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
        title="Drag to reorder"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="fill-current"
        >
          <path d="M6 3.5C6 4.32843 5.32843 5 4.5 5C3.67157 5 3 4.32843 3 3.5C3 2.67157 3.67157 2 4.5 2C5.32843 2 6 2.67157 6 3.5Z" />
          <path d="M13 3.5C13 4.32843 12.3284 5 11.5 5C10.6716 5 10 4.32843 10 3.5C10 2.67157 10.6716 2 11.5 2C12.3284 2 13 2.67157 13 3.5Z" />
          <path d="M6 8C6 8.82843 5.32843 9.5 4.5 9.5C3.67157 9.5 3 8.82843 3 8C3 7.17157 3.67157 6.5 4.5 6.5C5.32843 6.5 6 7.17157 6 8Z" />
          <path d="M13 8C13 8.82843 12.3284 9.5 11.5 9.5C10.6716 9.5 10 8.82843 10 8C10 7.17157 10.6716 6.5 11.5 6.5C12.3284 6.5 13 7.17157 13 8Z" />
          <path d="M6 12.5C6 13.3284 5.32843 14 4.5 14C3.67157 14 3 13.3284 3 12.5C3 11.6716 3.67157 11 4.5 11C5.32843 11 6 11.6716 6 12.5Z" />
          <path d="M13 12.5C13 13.3284 12.3284 14 11.5 14C10.6716 14 10 13.3284 10 12.5C10 11.6716 10.6716 11 11.5 11C12.3284 11 13 11.6716 13 12.5Z" />
        </svg>
      </button>
      <label className="flex items-center gap-2 flex-1 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isVisible}
          onChange={onToggle}
          disabled={!canHide}
          className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {label}
        </span>
      </label>
    </div>
  )
}

export function ColumnVisibilityDropdown<TData>({
  table,
}: ColumnVisibilityDropdownProps<TData>) {
  const [isOpen, setIsOpen] = useState(false)
  const [columnOrder, setColumnOrder] = useState<string[]>(
    table.getAllLeafColumns().map(col => col.id)
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  useEffect(() => {
    table.setColumnOrder(columnOrder)
  }, [columnOrder, table])

  const allColumns = table.getAllLeafColumns()
  const orderedColumns = columnOrder
    .map(id => allColumns.find(col => col.id === id))
    .filter(Boolean) as typeof allColumns

  const visibleCount = orderedColumns.filter(col => col.getIsVisible()).length

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-toggle inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <svg
          className="fill-current"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6V4Z"
            fill="currentColor"
          />
          <path
            d="M3 10C3 9.44772 3.44772 9 4 9H10C10.5523 9 11 9.44772 11 10V16C11 16.5523 10.5523 17 10 17H4C3.44772 17 3 16.5523 3 16V10Z"
            fill="currentColor"
          />
          <path
            d="M13 10C13 9.44772 13.4477 9 14 9H16C16.5523 9 17 9.44772 17 10V16C17 16.5523 16.5523 17 16 17H14C13.4477 17 13 16.5523 13 16V10Z"
            fill="currentColor"
          />
        </svg>
        Columns
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({visibleCount}/{orderedColumns.length})
        </span>
      </button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-64">
        <div className="p-2">
          <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Manage Columns
            </h3>
            <button
              onClick={() => {
                orderedColumns.forEach(col => {
                  if (col.getCanHide()) {
                    col.toggleVisibility(true)
                  }
                })
              }}
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
            >
              Show All
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0.5 max-h-80 overflow-y-auto custom-scrollbar">
                {orderedColumns.map((column) => {
                  const header = column.columnDef.header
                  const label = typeof header === 'string'
                    ? header
                    : column.id.charAt(0).toUpperCase() + column.id.slice(1)

                  return (
                    <SortableItem
                      key={column.id}
                      id={column.id}
                      label={label}
                      isVisible={column.getIsVisible()}
                      canHide={column.getCanHide()}
                      onToggle={() => column.toggleVisibility()}
                    />
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 px-3 py-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Drag items to reorder columns
            </p>
          </div>
        </div>
      </Dropdown>
    </div>
  )
}
