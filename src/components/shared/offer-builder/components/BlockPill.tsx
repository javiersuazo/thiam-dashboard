import React from 'react'
import type { OfferBlock } from '../core/types'
import Badge from '@/components/shared/ui/badge/Badge'

interface BlockPillProps {
  block: OfferBlock
  isSelected: boolean
  position: number
  adjustmentCount?: number
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  formatBlockName: (block: OfferBlock) => string
}

export const BlockPill: React.FC<BlockPillProps> = React.memo(({
  block,
  isSelected,
  position,
  adjustmentCount = 0,
  onClick,
  onEdit,
  onDelete,
  formatBlockName
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this block?')) {
      onDelete()
    }
  }

  return (
    <div
      className={`flex-shrink-0 px-4 sm:px-5 py-3 sm:py-2.5 rounded-full border transition-all group min-h-[44px] cursor-pointer ${
        isSelected
          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onClick}
          className="flex items-center gap-2.5"
          aria-label={`Select ${block.name}`}
        >
          <span
            className={`text-xs font-medium ${
              isSelected
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-gray-500'
            }`}
          >
            Alt+{position + 1}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm whitespace-nowrap">
                {block.name}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {block.items.length}
              </span>
              {adjustmentCount > 0 && (
                <Badge variant="light" color="warning" size="sm" className="rounded-full">
                  {adjustmentCount}
                </Badge>
              )}
            </div>
            <div
              className={`text-xs mt-0.5 ${
                isSelected
                  ? 'text-gray-300 dark:text-gray-600'
                  : 'text-gray-500'
              }`}
            >
              {formatBlockName(block)}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 ml-2 border-l pl-2 border-gray-300 dark:border-gray-600">
          <button
            onClick={handleEdit}
            className={`p-1 rounded-full transition-all ${
              isSelected
                ? 'hover:bg-white/20 dark:hover:bg-black/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Edit block"
            aria-label="Edit block"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className={`p-1 rounded-full transition-all ${
              isSelected
                ? 'hover:bg-red-500/20'
                : 'hover:bg-red-50 dark:hover:bg-red-500/10'
            } text-error-600`}
            title="Delete block"
            aria-label="Delete block"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
})

BlockPill.displayName = 'BlockPill'
