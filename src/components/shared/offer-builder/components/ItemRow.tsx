import React, { useState } from 'react'
import type { OfferItem } from '../core/types'
import type { ItemTypeConfig } from '../domain/plugins/IOfferBuilderPlugin'

interface ItemRowProps {
  item: OfferItem
  itemTypeConfig: ItemTypeConfig
  formatPrice: (cents: number, currency: string) => string
  formatQuantity: (quantity: number, itemType: string) => string
  currency: string
  onUpdateQuantity: (quantity: number) => Promise<void>
  onUpdatePrice: (priceCents: number) => Promise<void>
  onDelete: () => Promise<void>
  onComment?: () => void
}

export const ItemRow: React.FC<ItemRowProps> = React.memo(({
  item,
  itemTypeConfig,
  formatPrice,
  formatQuantity,
  currency,
  onUpdateQuantity,
  onUpdatePrice,
  onDelete,
  onComment
}) => {
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [tempQuantity, setTempQuantity] = useState(item.quantity.toString())
  const [tempPrice, setTempPrice] = useState((item.unitPriceCents / 100).toFixed(2))

  const handleQuantitySubmit = async () => {
    const newQuantity = parseInt(tempQuantity)
    if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity !== item.quantity) {
      await onUpdateQuantity(newQuantity)
    }
    setIsEditingQuantity(false)
  }

  const handlePriceSubmit = async () => {
    const newPriceCents = Math.round(parseFloat(tempPrice) * 100)
    if (!isNaN(newPriceCents) && newPriceCents >= 0 && newPriceCents !== item.unitPriceCents) {
      await onUpdatePrice(newPriceCents)
    }
    setIsEditingPrice(false)
  }

  const handleDelete = () => {
    if (confirm(`Delete ${item.itemName}?`)) {
      onDelete()
    }
  }

  return (
    <div className="group flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
        {itemTypeConfig.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {item.itemName}
        </div>
        {item.itemDescription && (
          <div className="text-sm text-gray-500 truncate">
            {item.itemDescription}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {itemTypeConfig.allowQuantity && (
          <div className="flex items-center gap-2">
            {isEditingQuantity ? (
              <input
                type="number"
                value={tempQuantity}
                onChange={(e) => setTempQuantity(e.target.value)}
                onBlur={handleQuantitySubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuantitySubmit()
                  if (e.key === 'Escape') {
                    setTempQuantity(item.quantity.toString())
                    setIsEditingQuantity(false)
                  }
                }}
                className="w-16 px-2 py-1 text-sm border border-brand-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
                min="1"
              />
            ) : (
              <button
                onClick={() => setIsEditingQuantity(true)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium"
              >
                {formatQuantity(item.quantity, item.itemType)}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {isEditingPrice ? (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                onBlur={handlePriceSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePriceSubmit()
                  if (e.key === 'Escape') {
                    setTempPrice((item.unitPriceCents / 100).toFixed(2))
                    setIsEditingPrice(false)
                  }
                }}
                className="w-20 px-2 py-1 text-sm border border-brand-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
                step="0.01"
                min="0"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsEditingPrice(true)}
              className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400"
            >
              {formatPrice(item.lineItemTotal, currency)}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onComment && (
            <button
              onClick={onComment}
              className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
              title="Add comment"
              aria-label="Add comment"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
            title="Delete item"
            aria-label="Delete item"
          >
            <svg
              className="w-4 h-4"
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

ItemRow.displayName = 'ItemRow'
