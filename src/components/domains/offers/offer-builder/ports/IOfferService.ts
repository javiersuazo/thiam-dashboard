import type {
  Offer,
  OfferBlock,
  OfferBlockItem,
  OfferStatus,
} from '../types'

export interface GetOffersParams {
  requestId?: string
  eventId?: string
  catererId?: string
  customerId?: string
  status?: OfferStatus[]
  limit?: number
  offset?: number
}

export interface CreateOfferDto {
  title: string
  description?: string
  requestId?: string
  eventId?: string
  catererId: string
  customerId: string
  validUntil?: string
  invitationMessage?: string
  notes?: string
}

export interface UpdateOfferDto {
  title?: string
  description?: string
  validUntil?: string
  invitationMessage?: string
  notes?: string
}

export interface IOfferService {
  getOffers(params: GetOffersParams): Promise<Offer[]>
  getOfferById(offerId: string): Promise<Offer>
  createOffer(dto: CreateOfferDto): Promise<Offer>
  updateOffer(offerId: string, dto: UpdateOfferDto): Promise<Offer>
  deleteOffer(offerId: string): Promise<void>
  sendOffer(offerId: string): Promise<Offer>

  addBlock(offerId: string, block: Omit<OfferBlock, 'id' | 'offerId'>): Promise<OfferBlock>
  updateBlock(offerId: string, blockId: string, updates: Partial<OfferBlock>): Promise<OfferBlock>
  deleteBlock(offerId: string, blockId: string): Promise<void>
  reorderBlocks(offerId: string, blockIds: string[]): Promise<void>

  addItemToBlock(offerId: string, blockId: string, item: Omit<OfferBlockItem, 'id' | 'blockId'>): Promise<OfferBlockItem>
  updateItem(offerId: string, blockId: string, itemId: string, updates: Partial<OfferBlockItem>): Promise<OfferBlockItem>
  deleteItem(offerId: string, blockId: string, itemId: string): Promise<void>
  reorderItems(offerId: string, blockId: string, itemIds: string[]): Promise<void>

  uploadAttachment(offerId: string, file: File, metadata: {
    description?: string
    attachmentType: string
    linkedBlockId?: string
    linkedItemId?: string
  }): Promise<any>
  deleteAttachment(offerId: string, attachmentId: string): Promise<void>
}
