import type { IOfferService, GetOffersParams, CreateOfferDto, UpdateOfferDto } from '../ports'
import type { Offer, OfferBlock, OfferBlockItem } from '../types'
import { MOCK_OFFERS, generateMockOffer, generateMockBlock, generateMockItem } from '../infrastructure/mock/offerBuilder.mock'

export class OfferMockAdapter implements IOfferService {
  private offers: Map<string, Offer> = new Map(MOCK_OFFERS.map((o) => [o.id, o]))

  private delay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getOffers(params: GetOffersParams): Promise<Offer[]> {
    await this.delay()

    let results = Array.from(this.offers.values())

    if (params.requestId) {
      results = results.filter((o) => o.requestId === params.requestId)
    }
    if (params.catererId) {
      results = results.filter((o) => o.catererId === params.catererId)
    }
    if (params.customerId) {
      results = results.filter((o) => o.customerId === params.customerId)
    }
    if (params.status && params.status.length > 0) {
      results = results.filter((o) => params.status!.includes(o.status))
    }

    return results
  }

  async getOfferById(offerId: string): Promise<Offer> {
    await this.delay(200)

    const offer = this.offers.get(offerId)
    if (!offer) {
      throw new Error(`Offer ${offerId} not found`)
    }

    return JSON.parse(JSON.stringify(offer))
  }

  async createOffer(dto: CreateOfferDto): Promise<Offer> {
    await this.delay(400)

    const offer = generateMockOffer({
      title: dto.title,
      description: dto.description,
      requestId: dto.requestId,
      eventId: dto.eventId,
      catererId: dto.catererId,
      customerId: dto.customerId,
      validUntil: dto.validUntil,
      invitationMessage: dto.invitationMessage,
      notes: dto.notes,
    })

    this.offers.set(offer.id, offer)
    return offer
  }

  async updateOffer(offerId: string, dto: UpdateOfferDto): Promise<Offer> {
    await this.delay(300)

    const offer = await this.getOfferById(offerId)
    const updated: Offer = {
      ...offer,
      ...dto,
      updatedAt: new Date().toISOString(),
    }

    this.offers.set(offerId, updated)
    return updated
  }

  async deleteOffer(offerId: string): Promise<void> {
    await this.delay(200)
    this.offers.delete(offerId)
  }

  async sendOffer(offerId: string): Promise<Offer> {
    await this.delay(500)

    const offer = await this.getOfferById(offerId)
    const updated: Offer = {
      ...offer,
      status: 'sent',
      version: offer.version + 1,
      sentAt: new Date().toISOString(),
      sentBy: 'staff',
    }

    this.offers.set(offerId, updated)
    return updated
  }

  async addBlock(offerId: string, blockData: Omit<OfferBlock, 'id' | 'offerId'>): Promise<OfferBlock> {
    await this.delay(300)

    const offer = await this.getOfferById(offerId)
    const block = generateMockBlock(offerId, {
      ...blockData,
      position: offer.blocks.length,
    })

    offer.blocks.push(block)
    this.offers.set(offerId, offer)

    return block
  }

  async updateBlock(offerId: string, blockId: string, updates: Partial<OfferBlock>): Promise<OfferBlock> {
    await this.delay(200)

    const offer = await this.getOfferById(offerId)
    const blockIndex = offer.blocks.findIndex((b) => b.id === blockId)

    if (blockIndex === -1) {
      throw new Error(`Block ${blockId} not found`)
    }

    offer.blocks[blockIndex] = {
      ...offer.blocks[blockIndex],
      ...updates,
    }

    this.offers.set(offerId, offer)
    return offer.blocks[blockIndex]
  }

  async deleteBlock(offerId: string, blockId: string): Promise<void> {
    await this.delay(200)

    const offer = await this.getOfferById(offerId)
    offer.blocks = offer.blocks.filter((b) => b.id !== blockId)
    this.offers.set(offerId, offer)
  }

  async reorderBlocks(offerId: string, blockIds: string[]): Promise<void> {
    await this.delay(200)

    const offer = await this.getOfferById(offerId)
    const reordered = blockIds
      .map((id) => offer.blocks.find((b) => b.id === id))
      .filter((b): b is OfferBlock => b !== undefined)
      .map((b, index) => ({ ...b, position: index }))

    offer.blocks = reordered
    this.offers.set(offerId, offer)
  }

  async addItemToBlock(offerId: string, blockId: string, itemData: Omit<OfferBlockItem, 'id' | 'blockId'>): Promise<OfferBlockItem> {
    await this.delay(300)

    const offer = await this.getOfferById(offerId)
    const block = offer.blocks.find((b) => b.id === blockId)

    if (!block) {
      throw new Error(`Block ${blockId} not found`)
    }

    const item = generateMockItem(blockId, {
      ...itemData,
      position: block.items.length,
    })

    block.items.push(item)
    block.subtotalCents = block.items.reduce((sum, i) => sum + i.lineItemTotal, 0)

    this.offers.set(offerId, offer)
    return item
  }

  async updateItem(offerId: string, blockId: string, itemId: string, updates: Partial<OfferBlockItem>): Promise<OfferBlockItem> {
    await this.delay(200)

    const offer = await this.getOfferById(offerId)
    const block = offer.blocks.find((b) => b.id === blockId)

    if (!block) {
      throw new Error(`Block ${blockId} not found`)
    }

    const itemIndex = block.items.findIndex((i) => i.id === itemId)
    if (itemIndex === -1) {
      throw new Error(`Item ${itemId} not found`)
    }

    const updatedItem = {
      ...block.items[itemIndex],
      ...updates,
    }

    if (updates.quantity !== undefined || updates.unitPriceCents !== undefined) {
      updatedItem.lineItemTotal = updatedItem.quantity * updatedItem.unitPriceCents
    }

    block.items[itemIndex] = updatedItem
    block.subtotalCents = block.items.reduce((sum, i) => sum + i.lineItemTotal, 0)

    this.offers.set(offerId, offer)
    return updatedItem
  }

  async deleteItem(offerId: string, blockId: string, itemId: string): Promise<void> {
    await this.delay(200)

    const offer = await this.getOfferById(offerId)
    const block = offer.blocks.find((b) => b.id === blockId)

    if (!block) {
      throw new Error(`Block ${blockId} not found`)
    }

    block.items = block.items.filter((i) => i.id !== itemId)
    block.subtotalCents = block.items.reduce((sum, i) => sum + i.lineItemTotal, 0)

    this.offers.set(offerId, offer)
  }

  async reorderItems(offerId: string, blockId: string, itemIds: string[]): Promise<void> {
    await this.delay(200)

    const offer = await this.getOfferById(offerId)
    const block = offer.blocks.find((b) => b.id === blockId)

    if (!block) {
      throw new Error(`Block ${blockId} not found`)
    }

    const reordered = itemIds
      .map((id) => block.items.find((i) => i.id === id))
      .filter((i): i is OfferBlockItem => i !== undefined)
      .map((i, index) => ({ ...i, position: index }))

    block.items = reordered
    this.offers.set(offerId, offer)
  }

  async uploadAttachment(offerId: string, file: File, metadata: any): Promise<any> {
    await this.delay(500)

    const attachment = {
      id: `attachment-${Date.now()}`,
      offerId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileUrl: URL.createObjectURL(file),
      attachedBy: 'user-001',
      attachedAt: new Date().toISOString(),
      ...metadata,
    }

    const offer = await this.getOfferById(offerId)
    offer.attachments.push(attachment)
    this.offers.set(offerId, offer)

    return attachment
  }

  async deleteAttachment(offerId: string, attachmentId: string): Promise<void> {
    await this.delay(200)

    const offer = await this.getOfferById(offerId)
    offer.attachments = offer.attachments.filter((a) => a.id !== attachmentId)
    this.offers.set(offerId, offer)
  }
}
