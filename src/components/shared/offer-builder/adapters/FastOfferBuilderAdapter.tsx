'use client'

import React from 'react'
import { FastOfferBuilder } from '../components/FastOfferBuilder'
import type { IOfferBuilderPlugin } from '../domain/plugins/IOfferBuilderPlugin'
import type { Offer as PluginOffer, OfferBlock as PluginBlock, OfferItem as PluginItem } from '../core/types'
import type { CatalogItem } from '../infrastructure/repositories/ICatalogRepository'
import type {
  Offer as LegacyOffer,
  MenuItem,
  OfferBlock as LegacyBlock,
  OfferBlockItem,
  OfferAdjustment
} from '../types/domain.types'

interface FastOfferBuilderAdapterProps {
  offerId: string
  plugin: IOfferBuilderPlugin
  request?: any
  initialAdjustments?: OfferAdjustment[]
  onSave?: (offer: PluginOffer) => Promise<void>
  onCancel?: () => void
}

export function FastOfferBuilderAdapter({
  offerId,
  plugin,
  request,
  initialAdjustments,
  onSave,
  onCancel
}: FastOfferBuilderAdapterProps) {
  const [pluginOffer, setPluginOffer] = React.useState<PluginOffer | null>(null)
  const [catalogItems, setCatalogItems] = React.useState<CatalogItem[]>([])
  const [adjustments, setAdjustments] = React.useState<OfferAdjustment[]>(initialAdjustments || [])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [offer, items] = await Promise.all([
          plugin.offerRepository.getById(offerId),
          plugin.catalogRepository.getItems()
        ])

        setPluginOffer(offer)
        setCatalogItems(items)

        if (plugin.adjustmentRepository && !initialAdjustments) {
          const loadedAdjustments = await plugin.adjustmentRepository.getByOfferId(offerId)
          setAdjustments(loadedAdjustments)
        }
      } catch (error) {
        console.error('Failed to load offer data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [offerId, plugin, initialAdjustments])

  if (isLoading || !pluginOffer) {
    return <div>Loading...</div>
  }

  const legacyOffer = convertPluginOfferToLegacy(pluginOffer)
  const legacyItems = convertCatalogItemsToLegacy(catalogItems)

  const handleSave = async (updatedLegacyOffer: LegacyOffer) => {
    try {
      const originalBlockIds = new Set(pluginOffer.blocks.map((b: PluginBlock) => b.id))
      const updatedBlockIds = new Set(updatedLegacyOffer.blocks.map(b => b.id))

      for (const legacyBlock of updatedLegacyOffer.blocks) {
        if (legacyBlock.id.startsWith('block-')) {
          const newBlock = await plugin.offerRepository.createBlock({
            offerId: pluginOffer.id,
            name: legacyBlock.name || legacyBlock.location || 'New Block',
            position: legacyBlock.position || 0,
            metadata: {
              date: legacyBlock.date,
              deliveryTime: legacyBlock.deliveryTime,
              startTime: legacyBlock.startTime,
              endTime: legacyBlock.endTime,
              pickupTime: legacyBlock.pickupTime,
              headcount: legacyBlock.headcount,
              location: legacyBlock.location,
              dietaryRequirements: legacyBlock.dietaryRequirements,
              specialInstructions: legacyBlock.specialInstructions
            }
          })

          for (const legacyItem of legacyBlock.items) {
            await plugin.offerRepository.createItem({
              blockId: newBlock.id,
              itemType: legacyItem.itemType,
              itemName: legacyItem.itemName,
              itemDescription: legacyItem.itemDescription,
              quantity: legacyItem.quantity,
              unitPriceCents: legacyItem.unitPriceCents,
              isOptional: legacyItem.isOptional,
              taxRateBps: 825,
              position: legacyItem.position
            })
          }
        } else {
          await plugin.offerRepository.updateBlock(legacyBlock.id, {
            name: legacyBlock.name || legacyBlock.location || legacyBlock.id,
            metadata: {
              date: legacyBlock.date,
              deliveryTime: legacyBlock.deliveryTime,
              startTime: legacyBlock.startTime,
              endTime: legacyBlock.endTime,
              pickupTime: legacyBlock.pickupTime,
              headcount: legacyBlock.headcount,
              location: legacyBlock.location,
              dietaryRequirements: legacyBlock.dietaryRequirements,
              specialInstructions: legacyBlock.specialInstructions
            }
          })

          const originalBlock = pluginOffer.blocks.find(b => b.id === legacyBlock.id)
          const originalItemIds = new Set(originalBlock?.items.map((i: PluginItem) => i.id) || [])
          const updatedItemIds = new Set(legacyBlock.items.map(i => i.id))

          for (const legacyItem of legacyBlock.items) {
            if (legacyItem.id.startsWith('item-')) {
              await plugin.offerRepository.createItem({
                blockId: legacyBlock.id,
                itemType: legacyItem.itemType,
                itemName: legacyItem.itemName,
                itemDescription: legacyItem.itemDescription,
                quantity: legacyItem.quantity,
                unitPriceCents: legacyItem.unitPriceCents,
                isOptional: legacyItem.isOptional,
                taxRateBps: 825,
                position: legacyItem.position
              })
            } else {
              await plugin.offerRepository.updateItem(legacyItem.id, {
                quantity: legacyItem.quantity,
                unitPriceCents: legacyItem.unitPriceCents
              })
            }
          }

          for (const itemId of originalItemIds) {
            if (!updatedItemIds.has(itemId)) {
              await plugin.offerRepository.deleteItem(itemId)
            }
          }
        }
      }

      for (const blockId of originalBlockIds) {
        if (!updatedBlockIds.has(blockId)) {
          await plugin.offerRepository.deleteBlock(blockId)
        }
      }

      const finalOffer = await plugin.offerRepository.getById(offerId)

      if (onSave) {
        await onSave(finalOffer)
      }
    } catch (error) {
      console.error('Failed to save offer:', error)
      throw error
    }
  }

  return (
    <FastOfferBuilder
      offer={legacyOffer}
      availableItems={legacyItems}
      request={request}
      initialAdjustments={adjustments}
      onSave={handleSave}
      onCancel={onCancel}
    />
  )
}

function convertPluginOfferToLegacy(pluginOffer: PluginOffer): LegacyOffer {
  return {
    id: pluginOffer.id,
    title: pluginOffer.title,
    description: pluginOffer.description,
    requestId: pluginOffer.metadata?.requestId,
    catererId: pluginOffer.metadata?.catererId || '',
    customerId: pluginOffer.metadata?.customerId || '',
    blocks: pluginOffer.blocks.map(convertPluginBlockToLegacy),
    currency: pluginOffer.currency,
    subtotalCents: pluginOffer.subtotalCents,
    taxCents: pluginOffer.taxCents,
    discountCents: pluginOffer.discountCents,
    totalCents: pluginOffer.totalCents,
    status: pluginOffer.status,
    version: pluginOffer.version,
    validUntil: pluginOffer.validUntil,
    notes: pluginOffer.metadata?.notes,
    createdAt: pluginOffer.createdAt,
    createdBy: pluginOffer.createdBy,
    updatedAt: pluginOffer.updatedAt,
    sentAt: pluginOffer.sentAt,
    sentBy: pluginOffer.sentBy as 'staff' | 'caterer' | undefined,
    viewedAt: pluginOffer.viewedAt,
    attachments: [],
    allowsStructuredEdit: pluginOffer.allowsStructuredEdit
  }
}

function convertPluginBlockToLegacy(pluginBlock: PluginBlock): LegacyBlock {
  return {
    id: pluginBlock.id,
    offerId: pluginBlock.offerId,
    name: pluginBlock.name,
    description: pluginBlock.description,
    date: pluginBlock.metadata?.date || '',
    deliveryTime: pluginBlock.metadata?.deliveryTime || '',
    startTime: pluginBlock.metadata?.startTime || '',
    endTime: pluginBlock.metadata?.endTime || '',
    pickupTime: pluginBlock.metadata?.pickupTime || '',
    items: pluginBlock.items.map(convertPluginItemToLegacy),
    headcount: pluginBlock.metadata?.headcount,
    location: pluginBlock.metadata?.location,
    dietaryRequirements: pluginBlock.metadata?.dietaryRequirements,
    specialInstructions: pluginBlock.metadata?.specialInstructions,
    subtotalCents: pluginBlock.subtotalCents,
    position: pluginBlock.position || 0
  }
}

function convertPluginItemToLegacy(pluginItem: PluginItem): OfferBlockItem {
  return {
    id: pluginItem.id,
    blockId: pluginItem.blockId,
    itemType: pluginItem.itemType as any,
    itemName: pluginItem.itemName,
    itemDescription: pluginItem.itemDescription,
    quantity: pluginItem.quantity,
    unitPriceCents: pluginItem.unitPriceCents,
    lineItemTotal: pluginItem.lineItemTotal,
    isOptional: pluginItem.isOptional || false,
    taxRateBps: pluginItem.taxRateBps || 825,
    position: pluginItem.position || 0
  }
}

function convertCatalogItemsToLegacy(catalogItems: CatalogItem[]): MenuItem[] {
  return catalogItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category || '',
    type: item.type,
    dietaryTags: item.tags,
    priceCents: item.priceCents,
    currency: 'USD',
    isAvailable: item.isAvailable
  }))
}

