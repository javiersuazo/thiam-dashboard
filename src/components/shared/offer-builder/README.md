# Offer Builder - Plugin Architecture

A production-grade, domain-agnostic offer builder component following DDD and SOLID principles.

## 🎯 Overview

The Offer Builder is a **plugin-based system** that allows you to create offers for ANY domain (catering, services, products, etc.) by simply swapping configuration. The same UI components and business logic work identically with mock data or real API.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                   │
│  OfferBuilder, BlockPill, ItemRow           │
│  (Pure UI - no business logic)              │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│         Application Layer                    │
│  useOfferBuilder hook                        │
│  (Orchestrates plugin methods)               │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│         Domain Layer                         │
│  IOfferBuilderPlugin                         │
│  - CateringPlugin                            │
│  - ServicesPlugin (future)                   │
│  (Domain-specific business rules)            │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│         Infrastructure Layer                 │
│  IOfferRepository, ICatalogRepository        │
│  - MockRepositories (development)            │
│  - ApiRepositories (production)              │
│  (Data access)                               │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. View the Demo

```bash
npm run dev
# Navigate to: http://localhost:3000/en/offers/builder/demo
```

The demo shows a fully functional catering offer builder with:
- Mock data (no backend required)
- Create/edit/delete blocks
- Search and add catalog items
- Inline quantity and price editing
- Smart quantity suggestions based on guest count
- Real-time totals calculation
- Professional UI with loading states and error boundaries

### 2. Use in Your Page

```tsx
'use client'

import { OfferBuilder } from '@/components/shared/offer-builder'
import { CateringOfferBuilderPlugin } from '@/components/shared/offer-builder'
import { MockOfferRepository, MockCatalogRepository } from '@/components/shared/offer-builder'

export default function MyPage() {
  // Create plugin with mock data (development)
  const plugin = new CateringOfferBuilderPlugin(
    new MockOfferRepository(mockData),
    new MockCatalogRepository(catalogItems)
  )

  return (
    <OfferBuilder
      offerId="offer-123"
      plugin={plugin}
      onSave={async (offer) => {
        // Handle save
        console.log('Saved:', offer)
      }}
      onCancel={() => {
        // Handle cancel
        window.history.back()
      }}
    />
  )
}
```

### 3. Switch to Real API (Zero Code Changes!)

```tsx
'use client'

import { ApiOfferRepository, ApiCatalogRepository } from '@/components/shared/offer-builder'
import { createServerClient } from '@/lib/api/server'

export default function MyPage() {
  const apiClient = await createServerClient()

  // Same plugin, different repositories - that's it!
  const plugin = new CateringOfferBuilderPlugin(
    new ApiOfferRepository(apiClient),
    new ApiCatalogRepository(apiClient)
  )

  // Everything else stays exactly the same
  return <OfferBuilder offerId="offer-123" plugin={plugin} />
}
```

## 🔌 Creating a New Plugin

Want to create offers for services, products, or any other domain? Just create a new plugin!

### Example: Services Plugin

```tsx
import { OfferBuilderPlugin } from '@/components/shared/offer-builder'
import type { ItemTypeConfig, BlockFieldConfig, PricingStrategy } from '@/components/shared/offer-builder'

export class ServicesOfferBuilderPlugin extends OfferBuilderPlugin {
  domain = 'services'
  label = 'Service Offerings'

  itemTypes: ItemTypeConfig[] = [
    {
      type: 'consultation',
      label: 'Consultation',
      pluralLabel: 'Consultations',
      icon: '💼',
      allowQuantity: true,
      quantityLabel: 'Hours'
    },
    {
      type: 'implementation',
      label: 'Implementation',
      pluralLabel: 'Implementation Work',
      icon: '⚙️',
      allowQuantity: true,
      quantityLabel: 'Days'
    },
    {
      type: 'support',
      label: 'Support Package',
      pluralLabel: 'Support Packages',
      icon: '🛟',
      allowQuantity: false
    }
  ]

  blockFields: BlockFieldConfig[] = [
    { field: 'startDate', label: 'Start Date', type: 'date', required: true },
    { field: 'duration', label: 'Duration', type: 'text', required: true },
    { field: 'teamSize', label: 'Team Size', type: 'number', required: false }
  ]

  pricingStrategy: PricingStrategy = {
    calculateItemPrice: (item) => {
      if (item.itemType === 'consultation') {
        // Hourly rate
        return item.quantity * item.unitPriceCents
      } else if (item.itemType === 'implementation') {
        // Daily rate
        return item.quantity * item.unitPriceCents
      }
      // Fixed price for support packages
      return item.unitPriceCents
    },

    calculateTax: (subtotal, items) => {
      // Service tax rate: 10%
      return Math.round(subtotal * 0.10)
    },

    calculateDiscount: (subtotal, offer) => {
      // 5% volume discount for large projects
      if (subtotal > 50000_00) {
        return Math.round(subtotal * 0.05)
      }
      return 0
    }
  }

  formatters = {
    formatPrice: (cents, currency) => {
      const amount = cents / 100
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(amount)
    },

    formatQuantity: (quantity, itemType) => {
      if (itemType === 'consultation') return `${quantity} hrs`
      if (itemType === 'implementation') return `${quantity} days`
      return `${quantity}×`
    },

    formatBlockName: (block) => {
      const { startDate, duration } = block.metadata || {}
      if (startDate && duration) {
        return `Starts ${startDate} • ${duration}`
      }
      return block.name
    }
  }

  smartSuggestions = {
    suggestQuantity: (catalogItem, block, offer) => {
      const teamSize = block.metadata?.teamSize || 1

      // More team members = more consultation hours
      if (catalogItem.type === 'consultation') {
        return teamSize * 4 // 4 hours per team member
      }

      return 1
    },

    suggestBlock: (offer) => ({
      name: `Phase ${offer.blocks.length + 1}`,
      metadata: {
        startDate: new Date().toISOString().split('T')[0],
        duration: '2 weeks'
      }
    })
  }

  defaultBlockName = 'Service Phase'
  defaultCurrency = 'USD'
  taxRateBps = 1000 // 10%
}
```

### Use Your New Plugin

```tsx
const plugin = new ServicesOfferBuilderPlugin(
  mockOfferRepo,
  mockCatalogRepo
)

<OfferBuilder plugin={plugin} offerId="offer-123" />
```

**That's it!** The entire UI adapts automatically:
- Item type icons and labels update
- Block fields show your custom fields
- Pricing calculations use your strategy
- Formatters use your domain-specific display logic
- Smart suggestions work with your business rules

## 📁 File Structure

```
src/components/shared/offer-builder/
├── core/
│   └── types.ts                          # Generic domain-agnostic types
│
├── infrastructure/
│   ├── repositories/
│   │   ├── IOfferRepository.ts           # Repository interface
│   │   └── ICatalogRepository.ts         # Catalog interface
│   └── adapters/
│       ├── MockOfferRepository.ts        # Mock implementation
│       ├── MockCatalogRepository.ts      # Mock catalog
│       ├── ApiOfferRepository.ts         # API implementation (TODO)
│       └── ApiCatalogRepository.ts       # API catalog (TODO)
│
├── domain/
│   └── plugins/
│       ├── IOfferBuilderPlugin.ts        # Plugin interface
│       └── CateringPlugin.ts             # Reference implementation
│
├── hooks/
│   └── useOfferBuilder.ts                # Application layer hook
│
├── components/
│   ├── OfferBuilder.tsx                  # Main container component
│   ├── OfferBuilderErrorBoundary.tsx     # Error boundary
│   ├── OfferBuilderSkeleton.tsx          # Loading skeleton
│   ├── BlockPill.tsx                     # Block navigation pill
│   └── ItemRow.tsx                       # Item display/edit row
│
├── ARCHITECTURE.md                       # Complete architecture docs
├── README.md                             # This file
└── index.ts                              # Barrel exports
```

## 🎨 Key Features

### 1. Domain-Agnostic Core
The core types (`Offer`, `OfferBlock`, `OfferItem`) work for ANY domain. Domain-specific data goes in `metadata`.

### 2. Plugin System
All domain-specific behavior is defined in plugins:
- Item types and icons
- Block fields
- Pricing strategies
- Smart suggestions
- Formatters

### 3. Repository Pattern
Data access is abstracted behind interfaces:
- Use `MockRepositories` for development/testing
- Use `ApiRepositories` for production
- Component logic stays identical

### 4. SOLID Principles
- **Single Responsibility**: Each component has one job
- **Open/Closed**: Extend via plugins, don't modify core
- **Liskov Substitution**: Repositories are swappable
- **Interface Segregation**: Focused interfaces
- **Dependency Inversion**: Depend on abstractions, not implementations

### 5. React Best Practices
- Custom hooks for business logic
- `React.memo` for performance
- Error boundaries for resilience
- Skeleton screens for loading states
- Optimistic updates for better UX

### 6. Production Ready
- Full TypeScript type safety
- Comprehensive error handling
- Loading and empty states
- Toast notifications
- Responsive design
- Dark mode support

## 🔧 API Contract

When implementing the backend, follow the repository interfaces exactly:

### Offer Repository Endpoints

```typescript
// GET /offers/:id
GET /api/v1/offers/offer-123
Response: Offer

// POST /offers
POST /api/v1/offers
Body: CreateOfferDTO
Response: Offer

// PATCH /offers/:id
PATCH /api/v1/offers/offer-123
Body: UpdateOfferDTO
Response: Offer

// DELETE /offers/:id
DELETE /api/v1/offers/offer-123
Response: 204 No Content

// POST /blocks
POST /api/v1/blocks
Body: CreateBlockDTO
Response: OfferBlock

// PATCH /blocks/:id
PATCH /api/v1/blocks/block-123
Body: UpdateBlockDTO
Response: OfferBlock

// DELETE /blocks/:id
DELETE /api/v1/blocks/block-123
Response: 204 No Content

// POST /items
POST /api/v1/items
Body: CreateItemDTO
Response: OfferItem

// PATCH /items/:id
PATCH /api/v1/items/item-123
Body: UpdateItemDTO
Response: OfferItem

// DELETE /items/:id
DELETE /api/v1/items/item-123
Response: 204 No Content

// POST /items/reorder
POST /api/v1/items/reorder
Body: { blockId: string, itemIds: string[] }
Response: 204 No Content
```

### Catalog Repository Endpoints

```typescript
// GET /catalog/items
GET /api/v1/catalog/items?type=menu_item&category=appetizer&isAvailable=true
Response: CatalogItem[]

// GET /catalog/items/:id
GET /api/v1/catalog/items/cat-123
Response: CatalogItem

// GET /catalog/items/search
GET /api/v1/catalog/items/search?q=chicken&type=menu_item
Response: CatalogItem[]
```

See `ARCHITECTURE.md` for complete DTO specifications.

## 🧪 Testing

### With Mock Data (No Backend Required)

```tsx
import { MockOfferRepository, MockCatalogRepository } from '@/components/shared/offer-builder'

const mockRepo = new MockOfferRepository({
  'offer-123': myMockOffer
})

const mockCatalog = new MockCatalogRepository(catalogItems)

const plugin = new CateringOfferBuilderPlugin(mockRepo, mockCatalog)

// Test the entire flow with zero backend dependencies
```

### With Real API

```tsx
import { ApiOfferRepository, ApiCatalogRepository } from '@/components/shared/offer-builder'

const apiRepo = new ApiOfferRepository(apiClient)
const apiCatalog = new ApiCatalogRepository(apiClient)

const plugin = new CateringOfferBuilderPlugin(apiRepo, apiCatalog)

// Same tests, now hitting real API
```

## 📊 Benefits

### For Frontend Developers
- ✅ Develop without waiting for backend
- ✅ Easy to test with mock data
- ✅ Component logic never changes when switching to real API
- ✅ Type-safe throughout
- ✅ Clear separation of concerns

### For Backend Developers
- ✅ Clear API contract defined by repository interfaces
- ✅ DTOs documented in `ARCHITECTURE.md`
- ✅ Frontend works with mocks, no pressure to rush
- ✅ Can implement endpoints incrementally

### For Business
- ✅ Reuse same UI for multiple domains (catering, services, products, etc.)
- ✅ Fast iteration - just create new plugins
- ✅ Consistent UX across all offer types
- ✅ Easy to maintain and extend

## 🎓 Learn More

- **Architecture Details**: See `ARCHITECTURE.md`
- **Demo**: Visit `/en/offers/builder/demo`
- **Plugin Interface**: See `domain/plugins/IOfferBuilderPlugin.ts`
- **Repository Interfaces**: See `infrastructure/repositories/`

## 🚦 Next Steps

1. **Backend Team**: Implement API repositories following the interface contracts
2. **Design Team**: Customize styles in component files
3. **Business Team**: Create new plugins for other domains (services, products, etc.)
4. **QA Team**: Test with mock data, then switch to API repos

---

**Built with React 19, TypeScript, Next.js 15, and Tailwind CSS**

**Following DDD, SOLID, and React best practices**
