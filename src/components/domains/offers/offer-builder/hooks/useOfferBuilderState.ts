import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { Offer, OfferBlock, OfferBlockItem, MenuItem, Menu, Equipment, ServiceItem } from '../types'

interface UseOfferBuilderStateProps {
  initialOffer?: Offer
  onUpdate?: (offer: Partial<Offer>) => void
}

export function useOfferBuilderState({ initialOffer, onUpdate }: UseOfferBuilderStateProps) {
  const [offer, setOffer] = useState<Offer | null>(initialOffer || null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialOffer?.blocks[0]?.id || null
  )

  const updateOffer = useCallback(
    (updates: Partial<Offer>) => {
      setOffer((prev) => {
        if (!prev) return prev
        const updated = { ...prev, ...updates }
        onUpdate?.(updates)
        return updated
      })
    },
    [onUpdate]
  )

  const addBlock = useCallback(
    (block: Omit<OfferBlock, 'id' | 'offerId'>) => {
      if (!offer) return

      const newBlock: OfferBlock = {
        ...block,
        id: `block-${Date.now()}`,
        offerId: offer.id,
        items: [],
        subtotalCents: 0,
        position: offer.blocks.length,
      }

      updateOffer({
        blocks: [...offer.blocks, newBlock],
      })

      setSelectedBlockId(newBlock.id)
      toast.success(`Added ${newBlock.name}`)

      return newBlock.id
    },
    [offer, updateOffer]
  )

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<OfferBlock>) => {
      if (!offer) return

      const blocks = offer.blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      )

      updateOffer({ blocks })
    },
    [offer, updateOffer]
  )

  const deleteBlock = useCallback(
    (blockId: string) => {
      if (!offer) return

      const blocks = offer.blocks.filter((b) => b.id !== blockId)
      updateOffer({ blocks })

      if (selectedBlockId === blockId) {
        setSelectedBlockId(blocks[0]?.id || null)
      }

      toast.success('Block removed')
    },
    [offer, selectedBlockId, updateOffer]
  )

  const addItemToBlock = useCallback(
    (blockId: string, item: Omit<OfferBlockItem, 'id' | 'blockId' | 'position' | 'lineItemTotal'>) => {
      if (!offer) return

      const blocks = offer.blocks.map((block) => {
        if (block.id !== blockId) return block

        const alreadyExists = block.items.some(
          (i) => i.menuItemId === item.menuItemId || i.menuId === item.menuId
        )

        if (alreadyExists) {
          toast.info('Item already in this block')
          return block
        }

        const newItem: OfferBlockItem = {
          ...item,
          id: `item-${Date.now()}`,
          blockId,
          position: block.items.length,
          lineItemTotal: item.quantity * item.unitPriceCents,
        }

        const updatedItems = [...block.items, newItem]
        const subtotalCents = updatedItems.reduce((sum, i) => sum + i.lineItemTotal, 0)

        toast.success(`Added ${item.itemName}`)

        return {
          ...block,
          items: updatedItems,
          subtotalCents,
        }
      })

      updateOffer({ blocks })
    },
    [offer, updateOffer]
  )

  const updateItem = useCallback(
    (blockId: string, itemId: string, updates: Partial<OfferBlockItem>) => {
      if (!offer) return

      const blocks = offer.blocks.map((block) => {
        if (block.id !== blockId) return block

        const items = block.items.map((item) => {
          if (item.id !== itemId) return item

          const updated = { ...item, ...updates }

          if (updates.quantity !== undefined || updates.unitPriceCents !== undefined) {
            updated.lineItemTotal = updated.quantity * updated.unitPriceCents
          }

          return updated
        })

        const subtotalCents = items.reduce((sum, i) => sum + i.lineItemTotal, 0)

        return { ...block, items, subtotalCents }
      })

      updateOffer({ blocks })
    },
    [offer, updateOffer]
  )

  const deleteItem = useCallback(
    (blockId: string, itemId: string) => {
      if (!offer) return

      const blocks = offer.blocks.map((block) => {
        if (block.id !== blockId) return block

        const items = block.items.filter((i) => i.id !== itemId)
        const subtotalCents = items.reduce((sum, i) => sum + i.lineItemTotal, 0)

        return { ...block, items, subtotalCents }
      })

      updateOffer({ blocks })
      toast.success('Item removed')
    },
    [offer, updateOffer]
  )

  const calculateTotals = useCallback(() => {
    if (!offer) return { subtotalCents: 0, taxCents: 0, totalCents: 0 }

    const subtotalCents = offer.blocks.reduce((sum, block) => sum + block.subtotalCents, 0)

    const taxCents = offer.blocks.reduce((sum, block) => {
      return (
        sum +
        block.items.reduce((itemSum, item) => {
          const taxAmount = Math.round((item.lineItemTotal * item.taxRateBps) / 10000)
          return itemSum + taxAmount
        }, 0)
      )
    }, 0)

    const discountCents = offer.offerLevelDiscount
      ? offer.offerLevelDiscount.type === 'percentage'
        ? Math.round((subtotalCents * offer.offerLevelDiscount.value) / 100)
        : offer.offerLevelDiscount.value
      : 0

    const totalCents = subtotalCents + taxCents - discountCents

    return { subtotalCents, taxCents, discountCents, totalCents }
  }, [offer])

  const getTotalItems = useCallback(() => {
    if (!offer) return 0
    return offer.blocks.reduce((sum, block) => sum + block.items.length, 0)
  }, [offer])

  const reorderItems = useCallback(
    (blockId: string, fromIndex: number, toIndex: number) => {
      if (!offer) return

      const blocks = offer.blocks.map((block) => {
        if (block.id !== blockId) return block

        const items = [...block.items]
        const [movedItem] = items.splice(fromIndex, 1)
        items.splice(toIndex, 0, movedItem)

        const updatedItems = items.map((item, idx) => ({
          ...item,
          position: idx,
        }))

        return {
          ...block,
          items: updatedItems,
        }
      })

      updateOffer({ blocks })
    },
    [offer, updateOffer]
  )

  return {
    offer,
    setOffer,
    selectedBlockId,
    setSelectedBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    addItemToBlock,
    updateItem,
    deleteItem,
    calculateTotals,
    getTotalItems,
    reorderItems,
  }
}
