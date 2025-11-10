export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
export type Currency = 'USD' | 'EUR' | 'GBP'

export interface Money {
  amountCents: number
  currency: Currency
}

export interface GenericOffer<TBlock = OfferBlock, TItem = OfferItem> {
  id: string
  title: string
  description?: string
  status: OfferStatus
  currency: Currency
  version: number

  blocks: TBlock[]

  subtotalCents: number
  taxCents: number
  discountCents: number
  totalCents: number

  validUntil?: string
  createdAt: string
  createdBy: string
  updatedAt?: string
  sentAt?: string
  sentBy?: string
  viewedAt?: string

  metadata?: Record<string, any>
  attachments?: OfferAttachment[]

  allowsStructuredEdit: boolean
}

export interface OfferBlock<TItem = OfferItem> {
  id: string
  offerId: string
  name: string
  description?: string
  position: number

  items: TItem[]

  subtotalCents: number

  metadata?: Record<string, any>
}

export interface OfferItem {
  id: string
  blockId: string

  itemType: string
  itemName: string
  itemDescription?: string

  referenceId?: string

  quantity: number
  unitPriceCents: number
  lineItemTotal: number

  isOptional: boolean
  taxRateBps: number

  position: number
  metadata?: Record<string, any>
}

export interface OfferAttachment {
  id: string
  offerId: string
  filename: string
  url: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
  uploadedBy: string
}

export interface OfferAdjustment {
  id: string
  offerId: string

  requestedBy: string
  requestedByType: 'customer' | 'caterer' | 'staff'
  requestedAt: string

  adjustmentType: 'price_change' | 'quantity_change' | 'item_addition' | 'item_removal' | 'special_instruction' | 'date_change'
  targetEntity: 'offer' | 'block' | 'item'
  targetEntityId: string

  changeDescription: string
  proposedChange: Record<string, any>
  priceImpactCents: number

  status: 'pending' | 'approved' | 'rejected'

  comments: AdjustmentComment[]
}

export interface AdjustmentComment {
  id: string
  adjustmentId: string
  authorId: string
  authorType: 'customer' | 'caterer' | 'staff'
  message: string
  createdAt: string
  attachments?: string[]
}

export type Offer = GenericOffer
