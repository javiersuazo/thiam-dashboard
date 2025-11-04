'use client'

import { useState } from 'react'
import type { MenuItem, OfferBlockItem } from '../../types'
import Button from '@/components/shared/ui/button/Button'
import Input from '@/components/shared/form/input/InputField'
import Badge from '@/components/shared/ui/badge/Badge'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  availableItems: MenuItem[]
  onAddItem: (item: Omit<OfferBlockItem, 'id' | 'blockId' | 'position' | 'lineItemTotal'>) => void
}

export function AddItemModal({ isOpen, onClose, availableItems, onAddItem }: AddItemModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [quantity, setQuantity] = useState(1)

  const categories = ['all', ...Array.from(new Set(availableItems.map((i) => i.category)))]

  const filteredItems = availableItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

    return matchesSearch && matchesCategory && item.isAvailable
  })

  const handleAddItem = (menuItem: MenuItem) => {
    onAddItem({
      itemType: 'menu_item',
      itemName: menuItem.name,
      itemDescription: menuItem.description,
      menuItemId: menuItem.id,
      quantity,
      unitPriceCents: menuItem.priceCents,
      isOptional: false,
      taxRateBps: 825, // 8.25% default tax
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Add Items</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Browse and add items to your offer block
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Qty:</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={1}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No items found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer border border-gray-200 dark:border-gray-700"
                  onClick={() => handleAddItem(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <Badge size="sm" color="light">
                      {item.category}
                    </Badge>
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {item.dietaryTags && item.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.dietaryTags.map((tag) => (
                        <Badge key={tag} size="sm" color="success">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-brand-600">
                      ${(item.priceCents / 100).toFixed(2)}
                    </span>
                    <Button variant="primary" size="sm" onClick={() => handleAddItem(item)}>
                      + Add {quantity > 1 ? `(×${quantity})` : ''}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredItems.length} items available
          </span>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
