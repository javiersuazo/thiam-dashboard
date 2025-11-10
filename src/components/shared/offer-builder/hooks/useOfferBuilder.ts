import { useState, useCallback, useEffect, useMemo } from 'react'
import type { Offer, OfferBlock, OfferItem } from '../core/types'
import type { IOfferBuilderPlugin } from '../domain/plugins/IOfferBuilderPlugin'
import type { CatalogItem } from '../infrastructure/repositories/ICatalogRepository'

interface UseOfferBuilderProps {
  offerId: string
  plugin: IOfferBuilderPlugin
  onUpdate?: (offer: Offer) => void
  onError?: (error: Error) => void
}

interface UseOfferBuilderReturn {
  offer: Offer | null
  isLoading: boolean
  error: Error | null

  selectedBlockId: string | null
  setSelectedBlockId: (id: string | null) => void

  catalogItems: CatalogItem[]
  isCatalogLoading: boolean

  createBlock: (name: string, metadata?: Record<string, any>) => Promise<void>
  updateBlock: (blockId: string, data: Partial<OfferBlock>) => Promise<void>
  deleteBlock: (blockId: string) => Promise<void>

  addItem: (catalogItem: CatalogItem, blockId: string) => Promise<void>
  updateItem: (itemId: string, data: Partial<OfferItem>) => Promise<void>
  deleteItem: (itemId: string) => Promise<void>

  calculateTotals: () => { subtotalCents: number; taxCents: number; discountCents: number; totalCents: number }

  validateOffer: () => string[]
  validateBlock: (blockId: string) => string[]
  validateItem: (itemId: string) => string[]

  refresh: () => Promise<void>
}

export function useOfferBuilder({
  offerId,
  plugin,
  onUpdate,
  onError
}: UseOfferBuilderProps): UseOfferBuilderReturn {
  const [offer, setOffer] = useState<Offer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)

  const loadOffer = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const loadedOffer = await plugin.offerRepository.getById(offerId)
      setOffer(loadedOffer)

      if (loadedOffer.blocks.length > 0 && !selectedBlockId) {
        setSelectedBlockId(loadedOffer.blocks[0].id)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load offer')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [offerId, plugin.offerRepository, selectedBlockId, onError])

  const loadCatalog = useCallback(async () => {
    try {
      setIsCatalogLoading(true)
      const items = await plugin.catalogRepository.getItems()
      setCatalogItems(items)
    } catch (err) {
      console.error('Failed to load catalog:', err)
    } finally {
      setIsCatalogLoading(false)
    }
  }, [plugin.catalogRepository])

  useEffect(() => {
    loadOffer()
    loadCatalog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId])

  useEffect(() => {
    if (offer && onUpdate) {
      onUpdate(offer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer])

  const createBlock = useCallback(async (name: string, metadata?: Record<string, any>) => {
    if (!offer) return

    try {
      const newBlock = await plugin.offerRepository.createBlock({
        offerId: offer.id,
        name,
        position: offer.blocks.length,
        metadata
      })

      setOffer(prev => {
        if (!prev) return prev
        return {
          ...prev,
          blocks: [...prev.blocks, newBlock]
        }
      })

      setSelectedBlockId(newBlock.id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create block')
      onError?.(error)
      throw error
    }
  }, [offer, plugin.offerRepository, onError])

  const updateBlock = useCallback(async (blockId: string, data: Partial<OfferBlock>) => {
    if (!offer) return

    try {
      const updatedBlock = await plugin.offerRepository.updateBlock(blockId, data)

      setOffer(prev => {
        if (!prev) return prev
        return {
          ...prev,
          blocks: prev.blocks.map(b => b.id === blockId ? updatedBlock : b)
        }
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update block')
      onError?.(error)
      throw error
    }
  }, [offer, plugin.offerRepository, onError])

  const deleteBlock = useCallback(async (blockId: string) => {
    if (!offer) return

    try {
      await plugin.offerRepository.deleteBlock(blockId)

      setOffer(prev => {
        if (!prev) return prev
        const updatedBlocks = prev.blocks.filter(b => b.id !== blockId)

        if (selectedBlockId === blockId && updatedBlocks.length > 0) {
          setSelectedBlockId(updatedBlocks[0].id)
        } else if (updatedBlocks.length === 0) {
          setSelectedBlockId(null)
        }

        return {
          ...prev,
          blocks: updatedBlocks
        }
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete block')
      onError?.(error)
      throw error
    }
  }, [offer, selectedBlockId, plugin.offerRepository, onError])

  const addItem = useCallback(async (catalogItem: CatalogItem, blockId: string) => {
    if (!offer) return

    const block = offer.blocks.find(b => b.id === blockId)
    if (!block) return

    try {
      const quantity = plugin.smartSuggestions?.suggestQuantity(catalogItem, block, offer) ?? 1

      const lineItemTotal = plugin.pricingStrategy.calculateItemPrice(
        {
          id: '',
          blockId,
          itemType: catalogItem.type,
          itemName: catalogItem.name,
          itemDescription: catalogItem.description,
          referenceId: catalogItem.id,
          quantity,
          unitPriceCents: catalogItem.priceCents,
          lineItemTotal: 0,
          isOptional: false,
          taxRateBps: plugin.taxRateBps,
          position: block.items.length
        },
        block,
        offer
      )

      const newItem = await plugin.offerRepository.createItem({
        blockId,
        itemType: catalogItem.type,
        itemName: catalogItem.name,
        itemDescription: catalogItem.description,
        referenceId: catalogItem.id,
        quantity,
        unitPriceCents: catalogItem.priceCents,
        isOptional: false,
        taxRateBps: plugin.taxRateBps,
        position: block.items.length
      })

      setOffer(prev => {
        if (!prev) return prev
        return {
          ...prev,
          blocks: prev.blocks.map(b => {
            if (b.id === blockId) {
              const updatedBlock = {
                ...b,
                items: [...b.items, newItem]
              }
              updatedBlock.subtotalCents = plugin.pricingStrategy.calculateBlockSubtotal(updatedBlock, prev)
              return updatedBlock
            }
            return b
          })
        }
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add item')
      onError?.(error)
      throw error
    }
  }, [offer, plugin, onError])

  const updateItem = useCallback(async (itemId: string, data: Partial<OfferItem>) => {
    if (!offer) return

    try {
      const updatedItem = await plugin.offerRepository.updateItem(itemId, data)

      setOffer(prev => {
        if (!prev) return prev
        return {
          ...prev,
          blocks: prev.blocks.map(block => {
            const itemIndex = block.items.findIndex(i => i.id === itemId)
            if (itemIndex === -1) return block

            const updatedBlock = {
              ...block,
              items: block.items.map(i => i.id === itemId ? updatedItem : i)
            }
            updatedBlock.subtotalCents = plugin.pricingStrategy.calculateBlockSubtotal(updatedBlock, prev)
            return updatedBlock
          })
        }
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update item')
      onError?.(error)
      throw error
    }
  }, [offer, plugin, onError])

  const deleteItem = useCallback(async (itemId: string) => {
    if (!offer) return

    try {
      await plugin.offerRepository.deleteItem(itemId)

      setOffer(prev => {
        if (!prev) return prev
        return {
          ...prev,
          blocks: prev.blocks.map(block => {
            const hasItem = block.items.some(i => i.id === itemId)
            if (!hasItem) return block

            const updatedBlock = {
              ...block,
              items: block.items.filter(i => i.id !== itemId)
            }
            updatedBlock.subtotalCents = plugin.pricingStrategy.calculateBlockSubtotal(updatedBlock, prev)
            return updatedBlock
          })
        }
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete item')
      onError?.(error)
      throw error
    }
  }, [offer, plugin, onError])

  const calculateTotals = useCallback(() => {
    if (!offer) {
      return { subtotalCents: 0, taxCents: 0, discountCents: 0, totalCents: 0 }
    }

    const subtotalCents = plugin.pricingStrategy.calculateBlockSubtotal({ items: offer.blocks.flatMap(b => b.items) } as OfferBlock, offer)
    const taxCents = plugin.pricingStrategy.calculateTax(subtotalCents, offer.blocks.flatMap(b => b.items))
    const discountCents = plugin.pricingStrategy.calculateDiscount(subtotalCents, offer)
    const totalCents = plugin.pricingStrategy.calculateTotal(subtotalCents, taxCents, discountCents)

    return { subtotalCents, taxCents, discountCents, totalCents }
  }, [offer, plugin.pricingStrategy])

  const validateOffer = useCallback(() => {
    if (!offer) return []
    return plugin.validateOffer(offer)
  }, [offer, plugin])

  const validateBlock = useCallback((blockId: string) => {
    if (!offer) return []
    const block = offer.blocks.find(b => b.id === blockId)
    if (!block) return []
    return plugin.validateBlock(block)
  }, [offer, plugin])

  const validateItem = useCallback((itemId: string) => {
    if (!offer) return []
    for (const block of offer.blocks) {
      const item = block.items.find(i => i.id === itemId)
      if (item) {
        return plugin.validateItem(item)
      }
    }
    return []
  }, [offer, plugin])

  const refresh = useCallback(async () => {
    await loadOffer()
    await loadCatalog()
  }, [loadOffer, loadCatalog])

  const selectedBlock = useMemo(() => {
    if (!offer || !selectedBlockId) return null
    return offer.blocks.find(b => b.id === selectedBlockId) || null
  }, [offer, selectedBlockId])

  return {
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

    calculateTotals,

    validateOffer,
    validateBlock,
    validateItem,

    refresh
  }
}
