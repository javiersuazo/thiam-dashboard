'use client'

import React, { useState, useCallback } from 'react'
import { useOfferBuilder } from '../hooks/useOfferBuilder'
import type { IOfferBuilderPlugin } from '../domain/plugins/IOfferBuilderPlugin'
import type { Offer } from '../core/types'
import { OfferBuilderErrorBoundary } from './OfferBuilderErrorBoundary'
import { OfferBuilderSkeleton } from './OfferBuilderSkeleton'
import { BlockPill } from './BlockPill'
import { ItemRow } from './ItemRow'
import Button from '@/components/shared/ui/button/Button'
import Input from '@/components/shared/form/input/InputField'
import { toast } from 'sonner'

interface OfferBuilderProps {
  offerId: string
  plugin: IOfferBuilderPlugin
  onSave?: (offer: Offer) => Promise<void>
  onCancel?: () => void
}

const OfferBuilderContent: React.FC<OfferBuilderProps> = ({
  offerId,
  plugin,
  onSave,
  onCancel
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const {
    offer,
    isLoading,
    error,
    selectedBlockId,
    setSelectedBlockId,
    catalogItems,
    isCatalogLoading,
    createBlock,
    updateBlock,
    deleteBlock,
    addItem,
    updateItem,
    deleteItem,
    calculateTotals
  } = useOfferBuilder({
    offerId,
    plugin,
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleSave = useCallback(async () => {
    if (!offer || !onSave) return

    try {
      setIsSaving(true)
      await onSave(offer)
      toast.success('Offer saved successfully')
    } catch (err) {
      toast.error('Failed to save offer')
    } finally {
      setIsSaving(false)
    }
  }, [offer, onSave])

  const handleCreateBlock = useCallback(async () => {
    const blockName = prompt('Enter block name:', plugin.defaultBlockName)
    if (!blockName) return

    try {
      await createBlock(blockName, plugin.smartSuggestions?.suggestBlock(offer!))
      toast.success('Block created')
    } catch (err) {
      toast.error('Failed to create block')
    }
  }, [createBlock, plugin, offer])

  const handleAddItem = useCallback(async (catalogItem: any) => {
    if (!selectedBlockId) {
      toast.error('Please select a block first')
      return
    }

    try {
      await addItem(catalogItem, selectedBlockId)
      toast.success('Item added')
      setSearchQuery('')
    } catch (err) {
      toast.error('Failed to add item')
    }
  }, [selectedBlockId, addItem])

  if (isLoading) {
    return <OfferBuilderSkeleton />
  }

  if (error || !offer) {
    throw error || new Error('Failed to load offer')
  }

  const selectedBlock = offer.blocks.find(b => b.id === selectedBlockId)
  const filteredCatalog = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totals = calculateTotals()

  return (
    <div className="flex h-screen max-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden pb-16">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {offer.title}
            </h2>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {plugin.formatters.formatPrice(totals.totalCents, offer.currency)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={handleCreateBlock}
              className="flex-shrink-0 px-4 py-2.5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white hover:shadow-sm transition-all text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white min-h-[44px]"
            >
              + Add Block
            </button>

            {offer.blocks.map((block, idx) => (
              <BlockPill
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                position={idx}
                onClick={() => setSelectedBlockId(block.id)}
                onEdit={() => {
                  const newName = prompt('Edit block name:', block.name)
                  if (newName) updateBlock(block.id, { name: newName })
                }}
                onDelete={() => deleteBlock(block.id)}
                formatBlockName={plugin.formatters.formatBlockName}
              />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items to add..."
            className="rounded-full"
          />
        </div>

        {searchQuery && filteredCatalog.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Search Results ({filteredCatalog.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredCatalog.slice(0, 6).map(item => {
                const config = plugin.getItemTypeConfig(item.type)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 border border-gray-200 dark:border-gray-600 hover:border-brand-300 dark:hover:border-brand-700 rounded-lg transition-all text-left"
                  >
                    <span className="text-xl">{config?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {plugin.formatters.formatPrice(item.priceCents, offer.currency)}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {selectedBlock ? (
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {selectedBlock.name}
                </h3>

                {selectedBlock.metadata && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {plugin.blockFields
                      .filter(f => (selectedBlock.metadata as any)?.[f.field])
                      .map(field => (
                        <div key={field.field}>
                          <div className="text-xs text-gray-500 mb-1">{field.label}</div>
                          <div className="font-semibold text-sm">
                            {(selectedBlock.metadata as any)[field.field]}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {plugin.itemTypes.map(typeConfig => {
                const itemsOfType = selectedBlock.items.filter(i => i.itemType === typeConfig.type)
                if (itemsOfType.length === 0) return null

                return (
                  <div key={typeConfig.type} className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{typeConfig.icon}</span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                        {typeConfig.pluralLabel}
                      </h4>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {itemsOfType.map(item => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          itemTypeConfig={typeConfig}
                          formatPrice={plugin.formatters.formatPrice}
                          formatQuantity={plugin.formatters.formatQuantity}
                          currency={offer.currency}
                          onUpdateQuantity={async (qty) => {
                            await updateItem(item.id, { quantity: qty })
                          }}
                          onUpdatePrice={async (price) => {
                            await updateItem(item.id, { unitPriceCents: price })
                          }}
                          onDelete={async () => {
                            await deleteItem(item.id)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}

              {selectedBlock.items.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm font-medium text-gray-500">No items yet</p>
                  <p className="text-xs text-gray-400 mt-1">Search above to add items</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-3">👆</div>
                <p>Select a block from above</p>
                <p className="text-sm mt-1">or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 pb-6 px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-3xl px-8 py-5 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="font-bold text-lg">
                  {plugin.formatters.formatPrice(totals.subtotalCents, offer.currency)}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tax
                </span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {plugin.formatters.formatPrice(totals.taxCents, offer.currency)}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </span>
                <span className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                  {plugin.formatters.formatPrice(totals.totalCents, offer.currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              )}
              {onSave && (
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? 'Saving...' : 'Save Offer'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const OfferBuilder: React.FC<OfferBuilderProps> = (props) => {
  return (
    <OfferBuilderErrorBoundary>
      <OfferBuilderContent {...props} />
    </OfferBuilderErrorBoundary>
  )
}
