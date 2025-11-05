import type { Offer, OfferBlock, OfferItem, OfferAdjustment } from '../../core/types'

export interface CreateOfferDTO {
  title: string
  description?: string
  currency?: string
  metadata?: Record<string, any>
}

export interface UpdateOfferDTO {
  title?: string
  description?: string
  validUntil?: string
  metadata?: Record<string, any>
}

export interface CreateBlockDTO {
  offerId: string
  name: string
  description?: string
  position?: number
  metadata?: Record<string, any>
}

export interface UpdateBlockDTO {
  name?: string
  description?: string
  position?: number
  metadata?: Record<string, any>
}

export interface CreateItemDTO {
  blockId: string
  itemType: string
  itemName: string
  itemDescription?: string
  referenceId?: string
  quantity: number
  unitPriceCents: number
  isOptional?: boolean
  taxRateBps?: number
  position?: number
  metadata?: Record<string, any>
}

export interface UpdateItemDTO {
  itemName?: string
  itemDescription?: string
  quantity?: number
  unitPriceCents?: number
  isOptional?: boolean
  position?: number
  metadata?: Record<string, any>
}

export interface IOfferRepository {
  getById(id: string): Promise<Offer>

  create(data: CreateOfferDTO): Promise<Offer>

  update(id: string, data: UpdateOfferDTO): Promise<Offer>

  delete(id: string): Promise<void>

  createBlock(data: CreateBlockDTO): Promise<OfferBlock>

  updateBlock(blockId: string, data: UpdateBlockDTO): Promise<OfferBlock>

  deleteBlock(blockId: string): Promise<void>

  createItem(data: CreateItemDTO): Promise<OfferItem>

  updateItem(itemId: string, data: UpdateItemDTO): Promise<OfferItem>

  deleteItem(itemId: string): Promise<void>

  reorderItems(blockId: string, itemIds: string[]): Promise<void>

  getAdjustments(offerId: string): Promise<OfferAdjustment[]>

  createAdjustment(adjustment: Partial<OfferAdjustment>): Promise<OfferAdjustment>

  updateAdjustment(adjustmentId: string, data: Partial<OfferAdjustment>): Promise<OfferAdjustment>
}
