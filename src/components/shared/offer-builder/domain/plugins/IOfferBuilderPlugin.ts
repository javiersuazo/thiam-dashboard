import type { Offer, OfferBlock, OfferItem } from '../../core/types'
import type { IOfferRepository } from '../../infrastructure/repositories/IOfferRepository'
import type { ICatalogRepository } from '../../infrastructure/repositories/ICatalogRepository'
import type { IAdjustmentRepository } from '../../infrastructure/repositories/IAdjustmentRepository'
import type { IAttachmentRepository } from '../../infrastructure/repositories/IAttachmentRepository'
import type { CatalogItem } from '../../infrastructure/repositories/ICatalogRepository'

export interface ItemTypeConfig {
  type: string
  label: string
  icon: string
  pluralLabel: string
  color?: string
  allowQuantity: boolean
  requiresReference?: boolean
}

export interface BlockFieldConfig {
  field: string
  label: string
  type: 'text' | 'date' | 'time' | 'number' | 'select' | 'textarea'
  required: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  validation?: (value: any) => string | null
}

export interface PricingStrategy {
  calculateItemPrice(item: OfferItem, block: OfferBlock, offer: Offer): number

  calculateBlockSubtotal(block: OfferBlock, offer: Offer): number

  calculateTax(subtotal: number, items: OfferItem[]): number

  calculateDiscount(subtotal: number, offer: Offer): number

  calculateTotal(subtotal: number, tax: number, discount: number): number
}

export interface ValidationRule {
  field: string
  validate: (value: any, context?: any) => string | null
  message?: string
}

export interface OfferValidationRules {
  offer?: ValidationRule[]
  block?: ValidationRule[]
  item?: ValidationRule[]
}

export interface SmartSuggestion {
  suggestQuantity(item: CatalogItem, block: OfferBlock, offer: Offer): number

  suggestItems(block: OfferBlock, offer: Offer, catalog: CatalogItem[]): CatalogItem[]

  suggestBlock(offer: Offer): Partial<OfferBlock>
}

export interface DomainFormatter {
  formatItemName(item: OfferItem): string

  formatBlockName(block: OfferBlock): string

  formatPrice(cents: number, currency: string): string

  formatQuantity(quantity: number, itemType: string): string
}

export interface IOfferBuilderPlugin {
  domain: string

  label: string

  itemTypes: ItemTypeConfig[]

  blockFields: BlockFieldConfig[]

  pricingStrategy: PricingStrategy

  validationRules: OfferValidationRules

  smartSuggestions?: SmartSuggestion

  formatters: DomainFormatter

  offerRepository: IOfferRepository

  catalogRepository: ICatalogRepository

  adjustmentRepository?: IAdjustmentRepository

  attachmentRepository?: IAttachmentRepository

  defaultBlockName: string

  defaultCurrency: string

  taxRateBps: number

  supportsAdjustments: boolean

  supportsAttachments: boolean

  metadata?: Record<string, any>

  getItemTypeConfig(type: string): ItemTypeConfig | undefined

  validateOffer(offer: Offer): string[]

  validateBlock(block: OfferBlock): string[]

  validateItem(item: OfferItem): string[]
}

export abstract class OfferBuilderPlugin implements IOfferBuilderPlugin {
  abstract domain: string
  abstract label: string
  abstract itemTypes: ItemTypeConfig[]
  abstract blockFields: BlockFieldConfig[]
  abstract pricingStrategy: PricingStrategy
  abstract validationRules: OfferValidationRules
  abstract formatters: DomainFormatter
  abstract offerRepository: IOfferRepository
  abstract catalogRepository: ICatalogRepository

  defaultBlockName = 'New Block'
  defaultCurrency = 'USD'
  taxRateBps = 825
  supportsAdjustments = true
  supportsAttachments = true

  getItemTypeConfig(type: string): ItemTypeConfig | undefined {
    return this.itemTypes.find(t => t.type === type)
  }

  validateOffer(offer: Offer): string[] {
    const errors: string[] = []
    if (this.validationRules.offer) {
      for (const rule of this.validationRules.offer) {
        const error = rule.validate(offer)
        if (error) errors.push(error)
      }
    }
    return errors
  }

  validateBlock(block: OfferBlock): string[] {
    const errors: string[] = []
    if (this.validationRules.block) {
      for (const rule of this.validationRules.block) {
        const error = rule.validate(block)
        if (error) errors.push(error)
      }
    }
    return errors
  }

  validateItem(item: OfferItem): string[] {
    const errors: string[] = []
    if (this.validationRules.item) {
      for (const rule of this.validationRules.item) {
        const error = rule.validate(item)
        if (error) errors.push(error)
      }
    }
    return errors
  }
}
