export type OfferItemType = 'menu' | 'menu_item' | 'equipment' | 'service' | 'delivery' | 'custom'

export type OfferStatus =
  | 'draft'
  | 'invited'
  | 'sent'
  | 'viewed'
  | 'under_review'
  | 'negotiating'
  | 'accepted'
  | 'rejected'
  | 'declined'
  | 'expired'
  | 'cancelled'

export type DiscountType = 'percentage' | 'fixed'

export type AttachmentType =
  | 'offer_document'
  | 'menu_pdf'
  | 'equipment_list'
  | 'contract'
  | 'floor_plan'
  | 'dietary_specs'
  | 'quote'
  | 'photo'
  | 'other'

export interface Discount {
  type: DiscountType
  value: number
  reason?: string
  code?: string
}

export interface OfferBlockItem {
  id: string
  blockId: string
  itemType: OfferItemType
  itemName: string
  itemDescription?: string

  menuId?: string
  menuItemId?: string
  equipmentId?: string
  serviceItemId?: string

  quantity: number
  unitPriceCents: number
  lineItemTotal: number

  customizations?: Record<string, unknown>
  specialInstructions?: string
  isOptional: boolean

  itemLevelDiscount?: Discount
  taxRateBps: number

  position: number
}

export interface OfferBlock {
  id: string
  offerId: string
  name: string
  description?: string

  date: string
  deliveryTime: string
  startTime: string
  endTime: string
  pickupTime: string

  items: OfferBlockItem[]

  headcount?: number
  location?: string
  dietaryRequirements?: Record<string, unknown>
  specialInstructions?: string

  subtotalCents: number
  blockLevelDiscount?: Discount

  position: number
  isCollapsed?: boolean
}

export interface OfferAttachment {
  id: string
  offerId: string
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  thumbnailUrl?: string

  attachedBy: string
  attachedAt: string
  description?: string

  attachmentType: AttachmentType
  linkedBlockId?: string
  linkedItemId?: string
  linkedAdjustmentId?: string
}

export interface Offer {
  id: string
  title: string
  description?: string

  requestId?: string
  eventId?: string
  catererId: string
  customerId: string

  blocks: OfferBlock[]

  currency: string
  subtotalCents: number
  taxCents: number
  discountCents: number
  totalCents: number
  offerLevelDiscount?: Discount

  status: OfferStatus
  version: number
  validUntil?: string
  invitationMessage?: string
  notes?: string

  createdAt: string
  createdBy: string
  updatedAt?: string
  sentAt?: string
  sentBy?: 'staff' | 'caterer'
  viewedAt?: string
  acceptedAt?: string

  attachments: OfferAttachment[]
  allowsStructuredEdit: boolean
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  category: string
  type?: OfferItemType
  dietaryTags?: string[]
  ingredients?: string[]
  priceCents: number
  currency: string
  imageUrl?: string
  isAvailable: boolean
}

export interface Menu {
  id: string
  name: string
  description?: string
  imageUrl?: string
  priceCents: number
  currency: string
  items: MenuItem[]
  isAvailable: boolean
}

export interface Equipment {
  id: string
  name: string
  description?: string
  category: string
  priceCents: number
  currency: string
  imageUrl?: string
  isAvailable: boolean
  quantity?: number
}

export interface ServiceItem {
  id: string
  name: string
  description?: string
  category: string
  priceCents: number
  priceType: 'per_hour' | 'per_person' | 'flat_rate'
  currency: string
  isAvailable: boolean
}

export type AdjustmentType =
  | 'quantity_change'
  | 'item_addition'
  | 'item_removal'
  | 'item_substitution'
  | 'time_change'
  | 'date_change'
  | 'block_addition'
  | 'block_removal'
  | 'pricing_adjustment'
  | 'discount_change'
  | 'special_instruction'

export type AdjustmentStatus = 'pending' | 'approved' | 'rejected' | 'applied'

export interface AdjustmentComment {
  id: string
  adjustmentId: string
  authorId: string
  authorType: 'customer' | 'caterer' | 'staff'
  message: string
  createdAt: string
  attachments?: OfferAttachment[]
}

export interface OfferAdjustment {
  id: string
  offerId: string

  requestedBy: string
  requestedByType: 'customer' | 'caterer' | 'staff'
  requestedAt: string

  adjustmentType: AdjustmentType
  targetEntity: 'block' | 'item' | 'offer'
  targetEntityId: string

  changeDescription: string
  proposedChange: Record<string, unknown>
  priceImpactCents: number

  status: AdjustmentStatus
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string

  comments: AdjustmentComment[]
}

export interface OfferVersion {
  id: string
  offerId: string
  version: number

  offerSnapshot: Offer
  changeLog: string
  changedFields: string[]

  createdAt: string
  createdBy: string
  triggeredByAdjustment?: string
}

export interface VersionDiff {
  oldTotalCents: number
  newTotalCents: number
  oldItemCount: number
  newItemCount: number
  oldBlockCount: number
  newBlockCount: number

  addedBlocks: OfferBlock[]
  removedBlocks: OfferBlock[]
  modifiedBlocks: BlockDiff[]

  addedAttachments: OfferAttachment[]
  removedAttachments: OfferAttachment[]

  changedFields: Record<string, { old: unknown; new: unknown }>
}

export interface BlockDiff {
  blockId: string
  blockName: string
  addedItems: OfferBlockItem[]
  removedItems: OfferBlockItem[]
  modifiedItems: ItemDiff[]
}

export interface ItemDiff {
  itemId: string
  itemName: string
  quantityChange?: number
  oldQuantity?: number
  newQuantity?: number
  priceChange?: number
  oldPrice?: number
  newPrice?: number
}
