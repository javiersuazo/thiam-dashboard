import type { OfferAttachment, AttachmentType } from '../../core/extended-types'

export interface UploadAttachmentDTO {
  offerId: string
  file: File
  description?: string
  attachmentType: AttachmentType
  linkedBlockId?: string
  linkedItemId?: string
  linkedAdjustmentId?: string
  attachedBy: string
}

export interface AttachmentMetadata {
  offerId: string
  fileName: string
  fileSize: number
  mimeType: string
  description?: string
  attachmentType: AttachmentType
  linkedBlockId?: string
  linkedItemId?: string
  linkedAdjustmentId?: string
  attachedBy: string
}

export interface UpdateAttachmentDTO {
  description?: string
  attachmentType?: AttachmentType
  linkedBlockId?: string
  linkedItemId?: string
  linkedAdjustmentId?: string
}

export interface IAttachmentRepository {
  upload(data: UploadAttachmentDTO): Promise<OfferAttachment>

  createFromUrl(metadata: AttachmentMetadata & { fileUrl: string; thumbnailUrl?: string }): Promise<OfferAttachment>

  getById(id: string): Promise<OfferAttachment>

  getByOfferId(offerId: string): Promise<OfferAttachment[]>

  getByBlockId(blockId: string): Promise<OfferAttachment[]>

  getByItemId(itemId: string): Promise<OfferAttachment[]>

  getByAdjustmentId(adjustmentId: string): Promise<OfferAttachment[]>

  update(id: string, data: UpdateAttachmentDTO): Promise<OfferAttachment>

  delete(id: string): Promise<void>

  getDownloadUrl(id: string): Promise<string>
}
