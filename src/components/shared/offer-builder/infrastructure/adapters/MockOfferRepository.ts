import type {
  IOfferRepository,
  CreateOfferDTO,
  UpdateOfferDTO,
  CreateBlockDTO,
  UpdateBlockDTO,
  CreateItemDTO,
  UpdateItemDTO
} from '../repositories/IOfferRepository'
import type { Offer, OfferBlock, OfferItem, OfferAdjustment } from '../../core/types'

export class MockOfferRepository implements IOfferRepository {
  private offers: Map<string, Offer> = new Map()
  private blocks: Map<string, OfferBlock> = new Map()
  private items: Map<string, OfferItem> = new Map()
  private adjustments: Map<string, OfferAdjustment[]> = new Map()

  constructor(initialData?: Offer[] | Record<string, Offer>) {
    if (initialData) {
      const offers = Array.isArray(initialData)
        ? initialData
        : Object.values(initialData)

      for (const offer of offers) {
        this.offers.set(offer.id, offer)
        for (const block of offer.blocks) {
          this.blocks.set(block.id, block)
          for (const item of block.items) {
            this.items.set(item.id, item)
          }
        }
      }
    }
  }

  async getById(id: string): Promise<Offer> {
    await this.delay(100)
    const offer = this.offers.get(id)
    if (!offer) {
      throw new Error(`Offer not found: ${id}`)
    }
    return JSON.parse(JSON.stringify(offer))
  }

  async create(data: CreateOfferDTO): Promise<Offer> {
    await this.delay(200)

    const offer: Offer = {
      id: `offer-${Date.now()}`,
      title: data.title,
      description: data.description,
      status: 'draft',
      currency: (data.currency as any) || 'USD',
      version: 1,
      blocks: [],
      subtotalCents: 0,
      taxCents: 0,
      discountCents: 0,
      totalCents: 0,
      createdAt: new Date().toISOString(),
      createdBy: 'user-001',
      metadata: data.metadata,
      attachments: [],
      allowsStructuredEdit: true
    }

    this.offers.set(offer.id, offer)
    return JSON.parse(JSON.stringify(offer))
  }

  async update(id: string, data: UpdateOfferDTO): Promise<Offer> {
    await this.delay(150)

    const offer = this.offers.get(id)
    if (!offer) {
      throw new Error(`Offer not found: ${id}`)
    }

    const updated: Offer = {
      ...offer,
      ...data,
      updatedAt: new Date().toISOString()
    }

    this.offers.set(id, updated)
    return JSON.parse(JSON.stringify(updated))
  }

  async delete(id: string): Promise<void> {
    await this.delay(100)

    const offer = this.offers.get(id)
    if (!offer) {
      throw new Error(`Offer not found: ${id}`)
    }

    offer.blocks.forEach(block => {
      block.items.forEach(item => {
        this.items.delete(item.id)
      })
      this.blocks.delete(block.id)
    })

    this.offers.delete(id)
  }

  async createBlock(data: CreateBlockDTO): Promise<OfferBlock> {
    await this.delay(150)

    const offer = this.offers.get(data.offerId)
    if (!offer) {
      throw new Error(`Offer not found: ${data.offerId}`)
    }

    const block: OfferBlock = {
      id: `block-${Date.now()}`,
      offerId: data.offerId,
      name: data.name,
      description: data.description,
      position: data.position ?? offer.blocks.length,
      items: [],
      subtotalCents: 0,
      metadata: data.metadata
    }

    this.blocks.set(block.id, block)
    offer.blocks.push(block)
    offer.blocks.sort((a, b) => a.position - b.position)

    return JSON.parse(JSON.stringify(block))
  }

  async updateBlock(blockId: string, data: UpdateBlockDTO): Promise<OfferBlock> {
    await this.delay(100)

    const block = this.blocks.get(blockId)
    if (!block) {
      throw new Error(`Block not found: ${blockId}`)
    }

    const updated: OfferBlock = {
      ...block,
      ...data
    }

    this.blocks.set(blockId, updated)

    const offer = this.offers.get(block.offerId)
    if (offer) {
      const blockIndex = offer.blocks.findIndex(b => b.id === blockId)
      if (blockIndex !== -1) {
        offer.blocks[blockIndex] = updated
      }
    }

    return JSON.parse(JSON.stringify(updated))
  }

  async deleteBlock(blockId: string): Promise<void> {
    await this.delay(100)

    const block = this.blocks.get(blockId)
    if (!block) {
      throw new Error(`Block not found: ${blockId}`)
    }

    block.items.forEach(item => {
      this.items.delete(item.id)
    })

    this.blocks.delete(blockId)

    const offer = this.offers.get(block.offerId)
    if (offer) {
      offer.blocks = offer.blocks.filter(b => b.id !== blockId)
    }
  }

  async createItem(data: CreateItemDTO): Promise<OfferItem> {
    await this.delay(150)

    const block = this.blocks.get(data.blockId)
    if (!block) {
      throw new Error(`Block not found: ${data.blockId}`)
    }

    const lineItemTotal = data.quantity * data.unitPriceCents

    const item: OfferItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      blockId: data.blockId,
      itemType: data.itemType,
      itemName: data.itemName,
      itemDescription: data.itemDescription,
      referenceId: data.referenceId,
      quantity: data.quantity,
      unitPriceCents: data.unitPriceCents,
      lineItemTotal,
      isOptional: data.isOptional ?? false,
      taxRateBps: data.taxRateBps ?? 825,
      position: data.position ?? block.items.length,
      metadata: data.metadata
    }

    this.items.set(item.id, item)
    block.items.push(item)
    block.items.sort((a, b) => a.position - b.position)

    block.subtotalCents = block.items.reduce((sum, i) => sum + i.lineItemTotal, 0)

    return JSON.parse(JSON.stringify(item))
  }

  async updateItem(itemId: string, data: UpdateItemDTO): Promise<OfferItem> {
    await this.delay(100)

    const item = this.items.get(itemId)
    if (!item) {
      throw new Error(`Item not found: ${itemId}`)
    }

    const updated: OfferItem = {
      ...item,
      ...data,
      lineItemTotal: (data.quantity ?? item.quantity) * (data.unitPriceCents ?? item.unitPriceCents)
    }

    this.items.set(itemId, updated)

    const block = this.blocks.get(item.blockId)
    if (block) {
      const itemIndex = block.items.findIndex(i => i.id === itemId)
      if (itemIndex !== -1) {
        block.items[itemIndex] = updated
      }
      block.subtotalCents = block.items.reduce((sum, i) => sum + i.lineItemTotal, 0)
    }

    return JSON.parse(JSON.stringify(updated))
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.delay(100)

    const item = this.items.get(itemId)
    if (!item) {
      throw new Error(`Item not found: ${itemId}`)
    }

    this.items.delete(itemId)

    const block = this.blocks.get(item.blockId)
    if (block) {
      block.items = block.items.filter(i => i.id !== itemId)
      block.subtotalCents = block.items.reduce((sum, i) => sum + i.lineItemTotal, 0)
    }
  }

  async reorderItems(blockId: string, itemIds: string[]): Promise<void> {
    await this.delay(100)

    const block = this.blocks.get(blockId)
    if (!block) {
      throw new Error(`Block not found: ${blockId}`)
    }

    const itemMap = new Map(block.items.map(item => [item.id, item]))
    const reordered: OfferItem[] = []

    itemIds.forEach((id, index) => {
      const item = itemMap.get(id)
      if (item) {
        reordered.push({ ...item, position: index })
      }
    })

    block.items = reordered
  }

  async getAdjustments(offerId: string): Promise<OfferAdjustment[]> {
    await this.delay(50)
    return this.adjustments.get(offerId) || []
  }

  async createAdjustment(adjustment: Partial<OfferAdjustment>): Promise<OfferAdjustment> {
    await this.delay(150)

    const newAdjustment: OfferAdjustment = {
      id: `adj-${Date.now()}`,
      offerId: adjustment.offerId!,
      requestedBy: adjustment.requestedBy!,
      requestedByType: adjustment.requestedByType!,
      requestedAt: new Date().toISOString(),
      adjustmentType: adjustment.adjustmentType!,
      targetEntity: adjustment.targetEntity!,
      targetEntityId: adjustment.targetEntityId!,
      changeDescription: adjustment.changeDescription!,
      proposedChange: adjustment.proposedChange || {},
      priceImpactCents: adjustment.priceImpactCents || 0,
      status: 'pending',
      comments: []
    }

    const existing = this.adjustments.get(newAdjustment.offerId) || []
    existing.push(newAdjustment)
    this.adjustments.set(newAdjustment.offerId, existing)

    return JSON.parse(JSON.stringify(newAdjustment))
  }

  async updateAdjustment(adjustmentId: string, data: Partial<OfferAdjustment>): Promise<OfferAdjustment> {
    await this.delay(100)

    for (const [, adjustments] of Array.from(this.adjustments.entries())) {
      const index = adjustments.findIndex(a => a.id === adjustmentId)
      if (index !== -1) {
        const updated = { ...adjustments[index], ...data }
        adjustments[index] = updated
        return JSON.parse(JSON.stringify(updated))
      }
    }

    throw new Error(`Adjustment not found: ${adjustmentId}`)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
