import { OfferBuilderPlugin } from './IOfferBuilderPlugin'
import type {
  ItemTypeConfig,
  BlockFieldConfig,
  PricingStrategy,
  OfferValidationRules,
  DomainFormatter,
  SmartSuggestion
} from './IOfferBuilderPlugin'
import type { Offer, OfferBlock, OfferItem } from '../../core/types'
import type { IOfferRepository } from '../../infrastructure/repositories/IOfferRepository'
import type { ICatalogRepository, CatalogItem } from '../../infrastructure/repositories/ICatalogRepository'

export class CateringOfferBuilderPlugin extends OfferBuilderPlugin {
  domain = 'catering'
  label = 'Catering Services'

  itemTypes: ItemTypeConfig[] = [
    {
      type: 'menu_item',
      label: 'Menu Item',
      pluralLabel: 'Menu Items',
      icon: '🍽️',
      color: 'blue',
      allowQuantity: true,
      requiresReference: true
    },
    {
      type: 'equipment',
      label: 'Equipment',
      pluralLabel: 'Equipment & Rentals',
      icon: '🔧',
      color: 'gray',
      allowQuantity: true,
      requiresReference: false
    },
    {
      type: 'service',
      label: 'Service',
      pluralLabel: 'Service & Staff',
      icon: '👔',
      color: 'purple',
      allowQuantity: true,
      requiresReference: false
    },
    {
      type: 'delivery',
      label: 'Delivery',
      pluralLabel: 'Delivery & Setup',
      icon: '🚚',
      color: 'green',
      allowQuantity: false,
      requiresReference: false
    }
  ]

  blockFields: BlockFieldConfig[] = [
    {
      field: 'name',
      label: 'Service Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Breakfast Service'
    },
    {
      field: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Additional details about this service...'
    },
    {
      field: 'date',
      label: 'Event Date',
      type: 'date',
      required: true
    },
    {
      field: 'deliveryTime',
      label: 'Delivery Time',
      type: 'time',
      required: true
    },
    {
      field: 'startTime',
      label: 'Service Start',
      type: 'time',
      required: true
    },
    {
      field: 'endTime',
      label: 'Service End',
      type: 'time',
      required: true
    },
    {
      field: 'pickupTime',
      label: 'Pickup Time',
      type: 'time',
      required: false
    },
    {
      field: 'headcount',
      label: 'Guest Count',
      type: 'number',
      required: true,
      validation: (value) => {
        if (value < 1) return 'Guest count must be at least 1'
        if (value > 10000) return 'Guest count seems unreasonably high'
        return null
      }
    },
    {
      field: 'location',
      label: 'Location',
      type: 'text',
      required: false,
      placeholder: 'e.g., Main Conference Room'
    }
  ]

  pricingStrategy: PricingStrategy = {
    calculateItemPrice: (item: OfferItem) => {
      return item.quantity * item.unitPriceCents
    },

    calculateBlockSubtotal: (block: OfferBlock) => {
      return block.items.reduce((sum, item) => sum + item.lineItemTotal, 0)
    },

    calculateTax: (subtotal: number, items: OfferItem[]) => {
      return items.reduce((taxSum, item) => {
        const taxRate = item.taxRateBps || 0
        return taxSum + Math.round(item.lineItemTotal * taxRate / 10000)
      }, 0)
    },

    calculateDiscount: (subtotal: number, offer: Offer) => {
      return offer.discountCents || 0
    },

    calculateTotal: (subtotal: number, tax: number, discount: number) => {
      return subtotal + tax - discount
    }
  }

  validationRules: OfferValidationRules = {
    offer: [
      {
        field: 'title',
        validate: (offer: Offer) => {
          if (!offer.title || offer.title.trim().length === 0) {
            return 'Offer title is required'
          }
          if (offer.title.length > 200) {
            return 'Offer title is too long'
          }
          return null
        }
      },
      {
        field: 'blocks',
        validate: (offer: Offer) => {
          if (offer.blocks.length === 0) {
            return 'Offer must have at least one service block'
          }
          return null
        }
      }
    ],
    block: [
      {
        field: 'name',
        validate: (block: OfferBlock) => {
          if (!block.name || block.name.trim().length === 0) {
            return 'Service name is required'
          }
          return null
        }
      },
      {
        field: 'date',
        validate: (block: any) => {
          if (!block.metadata?.date) {
            return 'Event date is required'
          }
          return null
        }
      },
      {
        field: 'headcount',
        validate: (block: any) => {
          const headcount = block.metadata?.headcount
          if (!headcount || headcount < 1) {
            return 'Guest count must be at least 1'
          }
          return null
        }
      }
    ],
    item: [
      {
        field: 'quantity',
        validate: (item: OfferItem) => {
          if (item.quantity < 0) {
            return 'Quantity cannot be negative'
          }
          return null
        }
      },
      {
        field: 'price',
        validate: (item: OfferItem) => {
          if (item.unitPriceCents < 0) {
            return 'Price cannot be negative'
          }
          return null
        }
      }
    ]
  }

  smartSuggestions: SmartSuggestion = {
    suggestQuantity: (catalogItem: CatalogItem, block: any, offer: Offer) => {
      const headcount = block.metadata?.headcount || 1
      const itemType = catalogItem.type

      switch (itemType) {
        case 'menu_item': {
          const category = catalogItem.category?.toLowerCase() || ''
          if (category.includes('beverage') || category.includes('drink')) {
            return Math.ceil(headcount * 1.2)
          }
          if (category.includes('appetizer') || category.includes('side')) {
            return Math.ceil(headcount * 0.6)
          }
          if (category.includes('dessert')) {
            return Math.ceil(headcount * 0.8)
          }
          return headcount
        }

        case 'equipment':
          return Math.ceil(headcount / 25)

        case 'service':
          return Math.max(2, Math.ceil(headcount / 25))

        case 'delivery':
          return 1

        default:
          return 1
      }
    },

    suggestItems: (block: any, offer: Offer, catalog: CatalogItem[]) => {
      const eventType = offer.metadata?.eventType?.toLowerCase() || ''
      const timeOfDay = this.getTimeOfDay(block.metadata?.startTime)

      return catalog.filter(item => {
        const itemCategory = item.category?.toLowerCase() || ''
        const itemTags = item.tags?.map(t => t.toLowerCase()) || []

        if (timeOfDay === 'breakfast' && itemCategory.includes('breakfast')) {
          return true
        }
        if (timeOfDay === 'lunch' && itemCategory.includes('lunch')) {
          return true
        }
        if (timeOfDay === 'dinner' && itemCategory.includes('dinner')) {
          return true
        }

        if (eventType.includes('corporate') && itemTags.includes('corporate')) {
          return true
        }
        if (eventType.includes('wedding') && itemTags.includes('wedding')) {
          return true
        }

        return false
      }).slice(0, 4)
    },

    suggestBlock: (offer: Offer) => {
      const blockCount = offer.blocks.length
      const defaultTime = this.getDefaultTimeForBlock(blockCount)

      return {
        name: `Service ${blockCount + 1}`,
        metadata: {
          startTime: defaultTime.start,
          endTime: defaultTime.end,
          deliveryTime: defaultTime.delivery
        }
      }
    }
  }

  formatters: DomainFormatter = {
    formatItemName: (item: OfferItem) => {
      return item.itemName
    },

    formatBlockName: (block: OfferBlock) => {
      const date = (block.metadata as any)?.date
      const startTime = (block.metadata as any)?.startTime
      if (date && startTime) {
        return `${block.name} - ${date} at ${startTime}`
      }
      return block.name
    },

    formatPrice: (cents: number, currency: string) => {
      const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'
      return `${symbol}${(cents / 100).toFixed(2)}`
    },

    formatQuantity: (quantity: number, itemType: string) => {
      if (itemType === 'delivery') {
        return 'Included'
      }
      return `× ${quantity}`
    }
  }

  constructor(
    public offerRepository: IOfferRepository,
    public catalogRepository: ICatalogRepository
  ) {
    super()
  }

  private getTimeOfDay(time?: string): string {
    if (!time) return 'unknown'
    const hour = parseInt(time.split(':')[0])
    if (hour < 11) return 'breakfast'
    if (hour < 16) return 'lunch'
    return 'dinner'
  }

  private getDefaultTimeForBlock(blockIndex: number): { start: string; end: string; delivery: string } {
    const times = [
      { start: '08:00', end: '10:00', delivery: '07:30' },
      { start: '12:00', end: '14:00', delivery: '11:30' },
      { start: '18:00', end: '21:00', delivery: '17:30' }
    ]
    return times[blockIndex % times.length]
  }
}
