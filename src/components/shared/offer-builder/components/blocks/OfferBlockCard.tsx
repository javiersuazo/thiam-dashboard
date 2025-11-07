'use client'

import type { OfferBlock, OfferBlockItem } from '../../types'
import Button from '@/components/shared/ui/button/Button'
import Input from '@/components/shared/form/input/InputField'

interface OfferBlockCardProps {
  block: OfferBlock
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: any) => void
  onDelete: () => void
  onAddItem: () => void
  onUpdateItem: (itemId: string, updates: Partial<OfferBlockItem>) => void
  onDeleteItem: (itemId: string) => void
}

export function OfferBlockCard({
  block,
  onUpdate,
  onDelete,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: OfferBlockCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between mb-2">
          <Input
            value={block.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="font-semibold px-0 border-0 bg-transparent focus:ring-0 text-base"
            placeholder="Block Name"
          />
          <Button variant="outline" size="sm" onClick={onDelete} className="text-error-600">
            Delete
          </Button>
        </div>

        {/* Compact Timing Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <label className="text-gray-500 block mb-1">Delivery</label>
            <Input
              type="time"
              value={block.deliveryTime}
              onChange={(e) => onUpdate({ deliveryTime: e.target.value })}
              className="text-xs h-7"
            />
          </div>
          <div>
            <label className="text-gray-500 block mb-1">Start</label>
            <Input
              type="time"
              value={block.startTime}
              onChange={(e) => onUpdate({ startTime: e.target.value })}
              className="text-xs h-7"
            />
          </div>
          <div>
            <label className="text-gray-500 block mb-1">End</label>
            <Input
              type="time"
              value={block.endTime}
              onChange={(e) => onUpdate({ endTime: e.target.value })}
              className="text-xs h-7"
            />
          </div>
          <div>
            <label className="text-gray-500 block mb-1">Pickup</label>
            <Input
              type="time"
              value={block.pickupTime}
              onChange={(e) => onUpdate({ pickupTime: e.target.value })}
              className="text-xs h-7"
            />
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4">
        {block.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm mb-3">No items yet</p>
            <Button variant="primary" size="sm" onClick={onAddItem}>
              Add Items
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {block.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.itemName}</div>
                  <div className="text-xs text-gray-500">
                    ${(item.unitPriceCents / 100).toFixed(2)} × {item.quantity}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onDeleteItem(item.id)}>
                  Remove
                </Button>
              </div>
            ))}

            <Button variant="outline" size="sm" className="w-full mt-3" onClick={onAddItem}>
              + Add More Items
            </Button>
          </div>
        )}

        {/* Compact Subtotal */}
        {block.items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Block Subtotal:</span>
            <span className="font-semibold text-lg">
              ${(block.subtotalCents / 100).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
