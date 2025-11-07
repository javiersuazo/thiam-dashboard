// ============================================
// OFFER BUILDER PACKAGE - PUBLIC API
// ============================================
// This is a standalone package that can be used in any project
// Import everything you need from this single entry point

// ============================================
// MAIN COMPONENT (Your entry point!)
// ============================================
export { FastOfferBuilderAdapter as OfferBuilder } from './adapters/FastOfferBuilderAdapter'

// ============================================
// TYPES (What you need to know about)
// ============================================
export type {
  Offer,
  OfferBlock,
  OfferItem,
  OfferStatus,
  Currency,
} from './core/types'

export type {
  CatalogItem,
  CatalogFilters,
} from './infrastructure/repositories/ICatalogRepository'

// ============================================
// EXTENDED TYPES (Advanced features)
// ============================================
export type {
  AdjustmentType,
  AdjustmentStatus,
  AttachmentType,
  DiscountType,
  Discount,
  OfferAttachment,
  AdjustmentComment,
  OfferAdjustment,
  ExtendedOfferItem,
  ExtendedOfferBlock,
  ExtendedOffer,
  OfferVersion,
} from './core/extended-types'

// ============================================
// PLUGIN SYSTEM (Domain-specific behavior)
// ============================================
export type {
  IOfferBuilderPlugin,
  ItemTypeConfig,
  BlockFieldConfig,
  PricingStrategy,
  SmartSuggestion,
  DomainFormatter,
} from './domain/plugins/IOfferBuilderPlugin'

export { OfferBuilderPlugin } from './domain/plugins/IOfferBuilderPlugin'
export { CateringOfferBuilderPlugin } from './domain/plugins/CateringPlugin'

// ============================================
// REPOSITORY INTERFACES (Data contracts)
// ============================================
export type {
  IOfferRepository,
  CreateOfferDTO,
  UpdateOfferDTO,
  CreateBlockDTO,
  UpdateBlockDTO,
  CreateItemDTO,
  UpdateItemDTO,
} from './infrastructure/repositories/IOfferRepository'

export type {
  ICatalogRepository,
} from './infrastructure/repositories/ICatalogRepository'

export type {
  IAdjustmentRepository,
  CreateAdjustmentDTO,
  UpdateAdjustmentDTO,
  CreateCommentDTO,
  ReviewAdjustmentDTO,
} from './infrastructure/repositories/IAdjustmentRepository'

export type {
  IAttachmentRepository,
  UploadAttachmentDTO,
  AttachmentMetadata,
  UpdateAttachmentDTO,
} from './infrastructure/repositories/IAttachmentRepository'

// ============================================
// MOCK ADAPTERS (For development/testing)
// ============================================
export { MockOfferRepository } from './infrastructure/adapters/MockOfferRepository'
export { MockCatalogRepository } from './infrastructure/adapters/MockCatalogRepository'

