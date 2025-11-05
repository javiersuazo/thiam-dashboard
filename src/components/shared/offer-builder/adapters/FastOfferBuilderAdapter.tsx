'use client'

import React from 'react'
import { FastOfferBuilder } from '@/components/domains/offers/offer-builder/components/FastOfferBuilder'
import type { IOfferBuilderPlugin } from '../domain/plugins/IOfferBuilderPlugin'
import type { Offer as PluginOffer, OfferBlock as PluginBlock, OfferItem as PluginItem, CatalogItem } from '../core/types'
import type { Offer as LegacyOffer, MenuItem, OfferBlock as LegacyBlock, OfferBlockItem, OfferAdjustment } from '@/components/domains/offers/offer-builder/types'

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
      } catch (error) {
        console.error('Failed to load offer data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [offerId, plugin])

  if (isLoading || !pluginOffer) {
    return <div>Loading...</div>
  }

  const legacyOffer = convertPluginOfferToLegacy(pluginOffer)
  const legacyItems = convertCatalogItemsToLegacy(catalogItems)

  const handleSave = async (updatedLegacyOffer: LegacyOffer) => {
    const updatedPluginOffer = convertLegacyOfferToPlugin(updatedLegacyOffer, pluginOffer)

    for (const block of updatedPluginOffer.blocks) {
      await plugin.offerRepository.updateBlock(block.id, {
        name: block.name,
        metadata: block.metadata
      })

      for (const item of block.items) {
        await plugin.offerRepository.updateItem(item.id, {
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents
        })
      }
    }

    if (onSave) {
      await onSave(updatedPluginOffer)
    }
  }

  return (
    <FastOfferBuilder
      offer={legacyOffer}
      availableItems={legacyItems}
      request={request}
      initialAdjustments={initialAdjustments}
      onSave={handleSave}
      onCancel={onCancel}
    />
  )
}

function convertPluginOfferToLegacy(pluginOffer: PluginOffer): LegacyOffer {
  return {
    id: pluginOffer.id,
    requestId: pluginOffer.metadata?.requestId || '',
    catererId: pluginOffer.metadata?.catererId || '',
    status: pluginOffer.status as any,
    totalCents: pluginOffer.totalCents,
    createdAt: pluginOffer.metadata?.createdAt || new Date().toISOString(),
    updatedAt: pluginOffer.metadata?.updatedAt || new Date().toISOString(),
    blocks: pluginOffer.blocks.map(convertPluginBlockToLegacy)
  }
}

function convertPluginBlockToLegacy(pluginBlock: PluginBlock): LegacyBlock {
  return {
    id: pluginBlock.id,
    offerId: pluginBlock.offerId,
    date: pluginBlock.metadata?.date || '',
    deliveryTime: pluginBlock.metadata?.deliveryTime || '',
    headcount: pluginBlock.metadata?.headcount || 0,
    location: pluginBlock.metadata?.location || '',
    notes: pluginBlock.metadata?.notes || '',
    items: pluginBlock.items.map(convertPluginItemToLegacy),
    subtotalCents: pluginBlock.subtotalCents,
    createdAt: pluginBlock.metadata?.createdAt || new Date().toISOString()
  }
}

function convertPluginItemToLegacy(pluginItem: PluginItem): OfferBlockItem {
  return {
    id: pluginItem.id,
    blockId: pluginItem.blockId,
    itemType: pluginItem.itemType,
    itemId: pluginItem.metadata?.itemId || '',
    itemName: pluginItem.itemName,
    itemDescription: pluginItem.itemDescription,
    quantity: pluginItem.quantity,
    unitPriceCents: pluginItem.unitPriceCents,
    totalCents: pluginItem.lineItemTotal,
    isOptional: pluginItem.isOptional || false,
    position: pluginItem.position || 0,
    createdAt: pluginItem.metadata?.createdAt || new Date().toISOString()
  }
}

function convertCatalogItemsToLegacy(catalogItems: CatalogItem[]): MenuItem[] {
  return catalogItems.map(item => ({
    id: item.id,
    catererId: item.metadata?.catererId || '',
    name: item.name,
    description: item.description,
    itemType: item.type as any,
    priceCents: item.priceCents,
    isAvailable: item.isAvailable,
    dietaryInfo: item.metadata?.dietaryInfo || [],
    allergens: item.metadata?.allergens || [],
    createdAt: item.metadata?.createdAt || new Date().toISOString(),
    updatedAt: item.metadata?.updatedAt || new Date().toISOString()
  }))
}

function convertLegacyOfferToPlugin(legacyOffer: LegacyOffer, originalPluginOffer: PluginOffer): PluginOffer {
  return {
    ...originalPluginOffer,
    status: legacyOffer.status as any,
    blocks: legacyOffer.blocks.map(block => convertLegacyBlockToPlugin(block, originalPluginOffer.id)),
    totalCents: legacyOffer.totalCents,
    metadata: {
      ...originalPluginOffer.metadata,
      updatedAt: new Date().toISOString()
    }
  }
}

function convertLegacyBlockToPlugin(legacyBlock: LegacyBlock, offerId: string): PluginBlock {
  return {
    id: legacyBlock.id,
    offerId,
    name: legacyBlock.location || `Block ${legacyBlock.id}`,
    items: legacyBlock.items.map(convertLegacyItemToPlugin),
    subtotalCents: legacyBlock.subtotalCents,
    metadata: {
      date: legacyBlock.date,
      deliveryTime: legacyBlock.deliveryTime,
      headcount: legacyBlock.headcount,
      location: legacyBlock.location,
      notes: legacyBlock.notes,
      createdAt: legacyBlock.createdAt
    }
  }
}

function convertLegacyItemToPlugin(legacyItem: OfferBlockItem): PluginItem {
  return {
    id: legacyItem.id,
    blockId: legacyItem.blockId,
    itemType: legacyItem.itemType,
    itemName: legacyItem.itemName,
    itemDescription: legacyItem.itemDescription,
    quantity: legacyItem.quantity,
    unitPriceCents: legacyItem.unitPriceCents,
    lineItemTotal: legacyItem.totalCents,
    isOptional: legacyItem.isOptional,
    taxRateBps: 825,
    position: legacyItem.position,
    metadata: {
      itemId: legacyItem.itemId,
      createdAt: legacyItem.createdAt
    }
  }
}
