'use client'

import type { OfferBlockItem } from '../../types'
import Button from '@/components/shared/ui/button/Button'
import Input from '@/components/shared/form/input/InputField'
import Badge from '@/components/shared/ui/badge/Badge'

interface OfferItemRowProps {
  item: OfferBlockItem
  onUpdate: (updates: Partial<OfferBlockItem>) => void
  onDelete: () => void
}

export function OfferItemRow({ item, onUpdate, onDelete }: OfferItemRowProps) {
  const formatPrice = (cents: number) => (cents / 100).toFixed(2)

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'menu':
        return '🍽️'
      case 'menu_item':
        return '🍕'
      case 'equipment':
        return '⚙️'
      case 'service':
        return '👔'
      case 'delivery':
        return '🚚'
      case 'custom':
        return '✏️'
      default:
        return '📦'
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getItemTypeIcon(item.itemType)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium truncate">{item.itemName}</h4>
            <Badge size="sm" color="light">
              {item.itemType}
            </Badge>
            {item.isOptional && (
              <Badge size="sm" color="warning">
                Optional
              </Badge>
            )}
          </div>

          {item.itemDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {item.itemDescription}
            </p>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Quantity</label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => onUpdate({ quantity: Number(e.target.value) })}
                min={1}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Unit Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  value={(item.unitPriceCents / 100).toFixed(2)}
                  onChange={(e) =>
                    onUpdate({ unitPriceCents: Math.round(Number(e.target.value) * 100) })
                  }
                  step={0.01}
                  min={0}
                  className="h-9 text-sm pl-7"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Tax Rate</label>
              <div className="relative">
                <Input
                  type="number"
                  value={(item.taxRateBps / 100).toFixed(2)}
                  onChange={(e) =>
                    onUpdate({ taxRateBps: Math.round(Number(e.target.value) * 100) })
                  }
                  step={0.01}
                  min={0}
                  max={100}
                  className="h-9 text-sm pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Total</label>
              <div className="h-9 flex items-center font-semibold text-brand-600">
                ${formatPrice(item.lineItemTotal)}
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10"
          onClick={onDelete}
        >
          🗑️
        </Button>
      </div>
    </div>
  )
}
