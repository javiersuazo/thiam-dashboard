import type { Offer, OfferBlock, OfferItem } from './types'

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

export type DiscountType = 'percentage' | 'fixed'

export interface Discount {
  type: DiscountType
  value: number
  reason?: string
  code?: string
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

export interface ExtendedOfferItem extends OfferItem {
  customizations?: Record<string, unknown>
  specialInstructions?: string
  discount?: Discount
  menuId?: string
  menuItemId?: string
  equipmentId?: string
  serviceItemId?: string
}

export interface ExtendedOfferBlock extends Omit<OfferBlock, 'items'> {
  items: ExtendedOfferItem[]
  startTime?: string
  endTime?: string
  pickupTime?: string
  dietaryRequirements?: Record<string, unknown>
  specialInstructions?: string
  discount?: Discount
}

export interface ExtendedOffer extends Omit<Offer, 'blocks' | 'attachments'> {
  blocks: ExtendedOfferBlock[]
  discount?: Discount
  attachments?: OfferAttachment[]
  adjustments?: OfferAdjustment[]
  notes?: string
  updatedBy?: string
}

export interface OfferVersion {
  id: string
  offerId: string
  version: number
  offerSnapshot: ExtendedOffer
  changeLog: string
  changedFields: string[]
  createdAt: string
  createdBy: string
  triggeredByAdjustmentId?: string
}
