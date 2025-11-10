import type { OfferAdjustment, AdjustmentComment, AdjustmentStatus, AdjustmentType } from '../../core/extended-types'

export interface CreateAdjustmentDTO {
  offerId: string
  requestedBy: string
  requestedByType: 'customer' | 'caterer' | 'staff'
  adjustmentType: AdjustmentType
  targetEntity: 'block' | 'item' | 'offer'
  targetEntityId: string
  changeDescription: string
  proposedChange: Record<string, unknown>
  priceImpactCents: number
}

export interface UpdateAdjustmentDTO {
  changeDescription?: string
  proposedChange?: Record<string, unknown>
  priceImpactCents?: number
}

export interface CreateCommentDTO {
  authorId: string
  authorType: 'customer' | 'caterer' | 'staff'
  message: string
  attachmentIds?: string[]
}

export interface ReviewAdjustmentDTO {
  status: AdjustmentStatus
  reviewedBy: string
  reviewNotes?: string
}

export interface IAdjustmentRepository {
  getByOfferId(offerId: string): Promise<OfferAdjustment[]>

  getById(id: string): Promise<OfferAdjustment>

  create(data: CreateAdjustmentDTO): Promise<OfferAdjustment>

  update(id: string, data: UpdateAdjustmentDTO): Promise<OfferAdjustment>

  delete(id: string): Promise<void>

  addComment(adjustmentId: string, comment: CreateCommentDTO): Promise<AdjustmentComment>

  review(id: string, review: ReviewAdjustmentDTO): Promise<OfferAdjustment>

  apply(id: string): Promise<void>
}
