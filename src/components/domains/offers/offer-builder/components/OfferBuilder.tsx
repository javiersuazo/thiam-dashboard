'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { Offer, MenuItem, OfferBlock } from '../types'
import { useOfferBuilderState } from '../hooks/useOfferBuilderState'
import { createOfferService, createCatalogService } from '../adapters'
import Button from '@/components/shared/ui/button/Button'
import Input from '@/components/shared/form/input/InputField'
import Badge from '@/components/shared/ui/badge/Badge'
import { AddBlockModal } from './blocks/AddBlockModal'

interface OfferBuilderProps {
  offerId?: string
  requestId?: string
  eventId?: string
  onSave?: (offer: Offer) => void
  onCancel?: () => void
}

export function OfferBuilder({ offerId, onSave, onCancel }: OfferBuilderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [addItemBlockId, setAddItemBlockId] = useState<string | null>(null)
  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const searchInputRef = useRef<HTMLInputElement>(null)

  const offerState = useOfferBuilderState({
    onUpdate: () => {},
  })

  useEffect(() => {
    loadOffer()
    loadCatalog()
  }, [offerId])

  const loadOffer = async () => {
    try {
      if (offerId) {
        const service = createOfferService()
        const offer = await service.getOfferById(offerId)
        offerState.setOffer(offer)
      } else {
        const service = createOfferService()
        const newOffer = await service.createOffer({
          title: 'Untitled Offer',
          catererId: 'caterer-456',
          customerId: 'customer-789',
        })
        offerState.setOffer(newOffer)
      }
    } catch (error) {
      toast.error('Failed to load offer')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCatalog = async () => {
    try {
      const catalogService = createCatalogService()
      const items = await catalogService.getMenuItems('caterer-456')
      setAvailableMenuItems(items)
    } catch (error) {
      toast.error('Failed to load catalog')
    }
  }

  const handleSave = async () => {
    if (!offerState.offer) return
    setIsSaving(true)
    try {
      const service = createOfferService()
      await service.updateOffer(offerState.offer.id, {
        title: offerState.offer.title,
      })
      toast.success('Offer saved')
      onSave?.(offerState.offer)
    } catch (error) {
      toast.error('Failed to save offer')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async () => {
    if (!offerState.offer) return
    if (offerState.offer.blocks.length === 0) {
      toast.error('Add at least one block before sending')
      return
    }
    if (offerState.getTotalItems() === 0) {
      toast.error('Add at least one item before sending')
      return
    }
    setIsSaving(true)
    try {
      const service = createOfferService()
      await service.sendOffer(offerState.offer.id)
      toast.success('Offer sent!')
      onSave?.(offerState.offer)
    } catch (error) {
      toast.error('Failed to send offer')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddItem = (blockId: string) => {
    setAddItemBlockId(blockId)
    setIsAddItemModalOpen(true)
  }

  const handleQuickAdd = (item: MenuItem) => {
    if (offerState.selectedBlockId) {
      offerState.addItemToBlock(offerState.selectedBlockId, {
        itemType: 'menu_item',
        itemName: item.name,
        itemDescription: item.description,
        menuItemId: item.id,
        quantity: 1,
        unitPriceCents: item.priceCents,
        isOptional: false,
        taxRateBps: 825,
      })
      setSearchQuery('')
    } else {
      toast.error('Select a block first')
    }
  }

  const filteredItems = availableMenuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totals = offerState.calculateTotals()

  if (isLoading || !offerState.offer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading offer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Left Sidebar - Block Navigation */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3">BLOCKS</h3>
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => setIsAddBlockModalOpen(true)}
          >
            + Add Block
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {offerState.offer.blocks.map((block, index) => (
            <button
              key={block.id}
              onClick={() => offerState.setSelectedBlockId(block.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition ${
                offerState.selectedBlockId === block.id
                  ? 'bg-brand-50 dark:bg-brand-900/20 border-2 border-brand-500'
                  : 'border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="font-medium text-sm mb-1">{block.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {block.date} • {block.startTime}
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-gray-500">{block.items.length} items</span>
                <span className="font-semibold text-brand-600">
                  ${(block.subtotalCents / 100).toFixed(2)}
                </span>
              </div>
            </button>
          ))}

          {offerState.offer.blocks.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              <p>No blocks yet</p>
              <p className="mt-1">Click above to add one</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pb-16">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center gap-3">
            <Input
              value={offerState.offer.title}
              onChange={(e) =>
                offerState.setOffer({ ...offerState.offer!, title: e.target.value })
              }
              className="text-lg font-semibold border-0 px-2 py-1 focus:ring-1"
              placeholder="Offer Title"
            />
            <Badge color="light" size="sm">
              {offerState.offer.status}
            </Badge>
            <Badge color="light" size="sm">
              v{offerState.offer.version}
            </Badge>
          </div>
        </div>

        {/* Quick Search */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
          <div className="relative">
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search items... (Press /)"
              className="w-full"
            />
            {searchQuery && filteredItems.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-30">
                {filteredItems.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleQuickAdd(item)}
                    className="w-full px-3 py-2 text-left hover:bg-brand-50 dark:hover:bg-brand-900/20 flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </div>
                    <span className="text-brand-600">${(item.priceCents / 100).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Block Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {offerState.selectedBlockId ? (
            (() => {
              const selectedBlock = offerState.offer.blocks.find(
                (b) => b.id === offerState.selectedBlockId
              )
              return selectedBlock ? (
                <OfferBlockCard
                  block={selectedBlock}
                  isSelected={true}
                  onSelect={() => {}}
                  onUpdate={(updates) => offerState.updateBlock(selectedBlock.id, updates)}
                  onDelete={() => offerState.deleteBlock(selectedBlock.id)}
                  onAddItem={() => handleAddItem(selectedBlock.id)}
                  onUpdateItem={(itemId, updates) =>
                    offerState.updateItem(selectedBlock.id, itemId, updates)
                  }
                  onDeleteItem={(itemId) => offerState.deleteItem(selectedBlock.id, itemId)}
                />
              ) : null
            })()
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-3">👈</div>
                <p>Select a block from the sidebar</p>
                <p className="text-sm mt-1">or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
              <span className="ml-2 font-semibold">${(totals.subtotalCents / 100).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Tax:</span>
              <span className="ml-2 font-semibold">${(totals.taxCents / 100).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total:</span>
              <span className="ml-2 font-bold text-lg text-brand-600">
                ${(totals.totalCents / 100).toFixed(2)}
              </span>
            </div>
            <div className="text-gray-400">|</div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{offerState.getTotalItems()} items</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button variant="primary" onClick={handleSend} disabled={isSaving} size="sm">
              {isSaving ? 'Sending...' : 'Send Offer'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddBlockModal
        isOpen={isAddBlockModalOpen}
        onClose={() => setIsAddBlockModalOpen(false)}
        onAdd={(block) => {
          offerState.addBlock(block)
          setIsAddBlockModalOpen(false)
        }}
      />

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => {
          setIsAddItemModalOpen(false)
          setAddItemBlockId(null)
        }}
        availableItems={availableMenuItems}
        onAddItem={(item) => {
          if (addItemBlockId) {
            offerState.addItemToBlock(addItemBlockId, item)
          }
        }}
      />
    </div>
  )
}
