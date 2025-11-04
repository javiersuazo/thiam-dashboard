'use client'

import type { OfferBlockItem } from '../../types'

interface ItemCardProps {
  item: OfferBlockItem
  onUpdate: (updates: Partial<OfferBlockItem>) => void
  onDelete: () => void
  isDraggable?: boolean
}

export function ItemCard({ item, onUpdate, onDelete, isDraggable = true }: ItemCardProps) {
  return (
    <div
      draggable={isDraggable}
      className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-move border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-4">
        {isDraggable && (
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 10-.001 4.001A2 2 0 007 2zm0 6a2 2 0 10-.001 4.001A2 2 0 007 8zm0 6a2 2 0 10-.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10-.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10-.001 4.001A2 2 0 0013 14z" />
          </svg>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{item.itemName}</div>
          {item.itemDescription && (
            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.itemDescription}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => onUpdate({ quantity: Number(e.target.value) })}
            min={1}
            className="w-16 px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
          <span className="text-xs text-gray-500">×</span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
            <input
              type="number"
              value={(item.unitPriceCents / 100).toFixed(2)}
              onChange={(e) => onUpdate({ unitPriceCents: Math.round(Number(e.target.value) * 100) })}
              step={0.01}
              className="w-24 px-2 py-1.5 pl-5 text-sm text-right border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <span className="text-sm font-bold min-w-[80px] text-right">
            ${(item.lineItemTotal / 100).toFixed(2)}
          </span>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-full text-gray-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
