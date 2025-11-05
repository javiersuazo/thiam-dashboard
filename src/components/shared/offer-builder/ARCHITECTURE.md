# Offer Builder - Plugin Architecture

## 🎯 Overview

The Offer Builder is a **domain-agnostic, plugin-based system** that can create offers for ANY type of service (catering, consulting, products, etc.) by simply swapping the configuration plugin.

This architecture follows **SOLID principles** and **Domain-Driven Design (DDD)** to achieve complete separation between:
- **UI Components** (zero business logic)
- **Business Logic** (plugin-based domain rules)
- **Data Access** (repository pattern with swappable implementations)

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER                  │
│  React Components (UI Only)                │
│  • OfferBuilder.tsx                        │
│  • BlockCard.tsx, ItemRow.tsx              │
│  No business logic, no API calls           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         APPLICATION LAYER                   │
│  Use Cases & State Management              │
│  • useOfferBuilderState.ts                 │
│  Orchestrates plugin methods               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         DOMAIN LAYER (Plugin-Based)         │
│  Business Logic & Validation               │
│  • IOfferBuilderPlugin (Interface)         │
│  • CateringPlugin (Implementation)         │
│  • ServicesPlugin (Implementation)         │
│  Pure business logic, no infrastructure    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         INFRASTRUCTURE LAYER                │
│  Data Access (Repository Pattern)          │
│  • IOfferRepository (Interface)            │
│  • MockOfferRepository (Dev/Testing)       │
│  • ApiOfferRepository (Production)         │
│  Swappable data sources                    │
└─────────────────────────────────────────────┘
```

## 📦 File Structure

```
src/components/shared/offer-builder/
├── core/
│   └── types.ts                              # Generic offer types
│
├── domain/
│   └── plugins/
│       ├── IOfferBuilderPlugin.ts            # Plugin contract
│       ├── CateringPlugin.ts                 # Catering implementation
│       └── ServicesPlugin.ts                 # Services implementation
│
├── infrastructure/
│   ├── repositories/
│   │   ├── IOfferRepository.ts               # Offer data contract
│   │   └── ICatalogRepository.ts             # Catalog data contract
│   └── adapters/
│       ├── MockOfferRepository.ts            # In-memory mock
│       ├── MockCatalogRepository.ts          # In-memory catalog
│       ├── ApiOfferRepository.ts             # Real API calls
│       └── ApiCatalogRepository.ts           # Real API calls
│
└── components/
    ├── OfferBuilder.tsx                      # Core component
    ├── BlockCard.tsx                         # Block UI
    └── ItemRow.tsx                           # Item UI
```

## 🔌 Plugin System

### Plugin Interface

Each domain (catering, services, products) implements the `IOfferBuilderPlugin` interface:

```typescript
interface IOfferBuilderPlugin {
  // Domain identification
  domain: string
  label: string

  // Configuration
  itemTypes: ItemTypeConfig[]          // What types of items exist
  blockFields: BlockFieldConfig[]      // What fields does a block have

  // Business Logic
  pricingStrategy: PricingStrategy     // How to calculate prices
  validationRules: ValidationRules     // How to validate data
  smartSuggestions?: SmartSuggestion   // Optional AI suggestions
  formatters: DomainFormatter          // How to display data

  // Data Access
  offerRepository: IOfferRepository
  catalogRepository: ICatalogRepository

  // Defaults
  defaultBlockName: string
  defaultCurrency: string
  taxRateBps: number
}
```

### Example: Catering Plugin

```typescript
const cateringPlugin = new CateringOfferBuilderPlugin(
  new ApiOfferRepository(),
  new ApiCatalogRepository()
)

// Item types specific to catering
itemTypes: [
  { type: 'menu_item', icon: '🍽️', label: 'Menu Item' },
  { type: 'equipment', icon: '🔧', label: 'Equipment' },
  { type: 'service', icon: '👔', label: 'Service' },
  { type: 'delivery', icon: '🚚', label: 'Delivery' }
]

// Fields specific to catering events
blockFields: [
  { field: 'date', type: 'date', required: true },
  { field: 'deliveryTime', type: 'time', required: true },
  { field: 'startTime', type: 'time', required: true },
  { field: 'headcount', type: 'number', required: true },
  { field: 'location', type: 'text', required: false }
]

// Catering-specific pricing logic
pricingStrategy: {
  calculateItemPrice: (item) => item.quantity * item.unitPriceCents,
  calculateTax: (subtotal, items) => { /* catering tax rules */ },
  // ...
}
```

### Example: Services Plugin

```typescript
const servicesPlugin = new ServicesOfferBuilderPlugin(
  new ApiOfferRepository(),
  new ApiCatalogRepository()
)

// Item types specific to services
itemTypes: [
  { type: 'hourly_service', icon: '⏰', label: 'Hourly Service' },
  { type: 'fixed_service', icon: '📦', label: 'Fixed Package' },
  { type: 'resource', icon: '👤', label: 'Resource' },
  { type: 'license', icon: '🔑', label: 'License' }
]

// Fields specific to service projects
blockFields: [
  { field: 'startDate', type: 'date', required: true },
  { field: 'duration', type: 'number', required: true },
  { field: 'team', type: 'select', required: true },
  { field: 'deliverables', type: 'textarea', required: false }
]

// Services-specific pricing logic
pricingStrategy: {
  calculateItemPrice: (item) => {
    // Different logic for hourly vs fixed
    if (item.itemType === 'hourly_service') {
      return item.quantity * item.unitPriceCents * hoursPerWeek
    }
    return item.unitPriceCents // Fixed package
  },
  // ...
}
```

## 🗄️ Repository Pattern

### Interface (API Contract)

```typescript
interface IOfferRepository {
  getById(id: string): Promise<Offer>
  create(data: CreateOfferDTO): Promise<Offer>
  update(id: string, data: UpdateOfferDTO): Promise<Offer>
  delete(id: string): Promise<void>

  // Block operations
  createBlock(data: CreateBlockDTO): Promise<OfferBlock>
  updateBlock(blockId: string, data: UpdateBlockDTO): Promise<OfferBlock>
  deleteBlock(blockId: string): Promise<void>

  // Item operations
  createItem(data: CreateItemDTO): Promise<OfferItem>
  updateItem(itemId: string, data: UpdateItemDTO): Promise<OfferItem>
  deleteItem(itemId: string): Promise<void>
  reorderItems(blockId: string, itemIds: string[]): Promise<void>
}
```

### Mock Implementation (Development)

```typescript
class MockOfferRepository implements IOfferRepository {
  private offers = new Map<string, Offer>()

  async getById(id: string): Promise<Offer> {
    // Return from in-memory store
    // Simulates network delay
    await delay(100)
    return this.offers.get(id)
  }

  // All methods work with in-memory data
}
```

### API Implementation (Production)

```typescript
class ApiOfferRepository implements IOfferRepository {
  constructor(private apiClient: ApiClient) {}

  async getById(id: string): Promise<Offer> {
    const response = await this.apiClient.get(`/offers/${id}`)
    return response.data
  }

  async createBlock(data: CreateBlockDTO): Promise<OfferBlock> {
    const response = await this.apiClient.post(`/offers/${data.offerId}/blocks`, data)
    return response.data
  }

  // All methods call real API endpoints
}
```

## 🎨 Usage in Components

### With Mock Data (Development)

```typescript
import { CateringOfferBuilderPlugin } from '@/components/shared/offer-builder/domain/plugins/CateringPlugin'
import { MockOfferRepository } from '@/components/shared/offer-builder/infrastructure/adapters/MockOfferRepository'
import { MockCatalogRepository } from '@/components/shared/offer-builder/infrastructure/adapters/MockCatalogRepository'

const plugin = new CateringOfferBuilderPlugin(
  new MockOfferRepository(MOCK_OFFERS),
  new MockCatalogRepository(MOCK_MENU_ITEMS)
)

<OfferBuilder plugin={plugin} offerId="offer-001" />
```

### With Real API (Production)

```typescript
import { CateringOfferBuilderPlugin } from '@/components/shared/offer-builder/domain/plugins/CateringPlugin'
import { ApiOfferRepository } from '@/components/shared/offer-builder/infrastructure/adapters/ApiOfferRepository'
import { ApiCatalogRepository } from '@/components/shared/offer-builder/infrastructure/adapters/ApiCatalogRepository'

const plugin = new CateringOfferBuilderPlugin(
  new ApiOfferRepository(apiClient),
  new ApiCatalogRepository(apiClient)
)

<OfferBuilder plugin={plugin} offerId="offer-001" />
```

### Different Domain (Services)

```typescript
import { ServicesOfferBuilderPlugin } from '@/components/shared/offer-builder/domain/plugins/ServicesPlugin'

const plugin = new ServicesOfferBuilderPlugin(
  new ApiOfferRepository(apiClient),
  new ApiCatalogRepository(apiClient)
)

<OfferBuilder plugin={plugin} offerId="service-001" />
```

## 🔄 Data Flow

### Creating an Item

```
User clicks "Add Item"
        ↓
UI Component (ItemRow.tsx)
  - Captures user input
  - No validation, no business logic
        ↓
Application Layer (useOfferBuilderState)
  - Calls plugin.validateItem()
  - Calls plugin.pricingStrategy.calculateItemPrice()
        ↓
Domain Plugin (CateringPlugin)
  - Validates using domain rules
  - Calculates price using domain logic
  - Returns validation result
        ↓
Application Layer
  - If valid, calls repository.createItem()
        ↓
Repository (ApiOfferRepository OR MockOfferRepository)
  - Persists data (API call OR in-memory)
  - Returns created item
        ↓
Application Layer
  - Updates local state
  - Triggers re-render
        ↓
UI Component
  - Displays updated item
```

### Key Principles

1. **UI knows nothing about business logic**
   - Components only handle display and user input
   - All logic delegated to plugin

2. **Plugin knows nothing about data storage**
   - Uses repository interface
   - Doesn't care if it's mock or API

3. **Repository knows nothing about business rules**
   - Only handles data persistence
   - No validation, no calculations

## 🛠️ Backend API Requirements

To support this architecture, the backend API should provide these endpoints:

### Offers

```
GET    /api/offers/:id
POST   /api/offers
PUT    /api/offers/:id
DELETE /api/offers/:id
```

### Blocks

```
POST   /api/offers/:offerId/blocks
PUT    /api/blocks/:blockId
DELETE /api/blocks/:blockId
```

### Items

```
POST   /api/blocks/:blockId/items
PUT    /api/items/:itemId
DELETE /api/items/:itemId
PUT    /api/blocks/:blockId/items/reorder
```

### Catalog

```
GET    /api/catalog/items
GET    /api/catalog/items/:id
GET    /api/catalog/items/search?q=...
GET    /api/catalog/items/type/:type
```

### Adjustments

```
GET    /api/offers/:offerId/adjustments
POST   /api/offers/:offerId/adjustments
PUT    /api/adjustments/:adjustmentId
```

## 📋 DTO Examples

### CreateOfferDTO

```json
{
  "title": "Corporate Lunch - June 15",
  "description": "Quarterly meeting catering",
  "currency": "USD",
  "metadata": {
    "eventType": "Corporate Meeting",
    "requestId": "req-123"
  }
}
```

### CreateBlockDTO

```json
{
  "offerId": "offer-001",
  "name": "Lunch Service",
  "description": "Main lunch service for 50 guests",
  "position": 0,
  "metadata": {
    "date": "2025-06-15",
    "startTime": "12:00",
    "endTime": "14:00",
    "headcount": 50,
    "location": "Conference Room A"
  }
}
```

### CreateItemDTO

```json
{
  "blockId": "block-001",
  "itemType": "menu_item",
  "itemName": "Caesar Salad",
  "itemDescription": "With grilled chicken",
  "referenceId": "menu-item-123",
  "quantity": 50,
  "unitPriceCents": 1200,
  "isOptional": false,
  "taxRateBps": 825,
  "position": 0,
  "metadata": {
    "category": "salad",
    "dietaryInfo": ["gluten-free-option"]
  }
}
```

## ✅ Benefits

### For Frontend

1. **Zero coupling** to specific domains
2. **Testable** with mock data (no API needed)
3. **Reusable** across all offer types
4. **Type-safe** with TypeScript
5. **Maintainable** - clear separation of concerns

### For Backend

1. **Clear API contracts** (DTOs)
2. **Domain-agnostic** endpoints
3. **Easy to test** (mock repositories)
4. **Scalable** - add new domains without changing API
5. **Flexible** - metadata field for domain-specific data

### For Business

1. **Fast development** - new offer types in hours, not days
2. **Consistent UX** across all domains
3. **Lower maintenance** cost
4. **Easy A/B testing** - swap plugins
5. **Future-proof** architecture

## 🚀 Next Steps

1. ✅ Core types defined
2. ✅ Repository interfaces created
3. ✅ Plugin interface defined
4. ✅ Catering plugin implemented
5. ✅ Mock repositories implemented
6. ⏳ API repositories (needs backend endpoints)
7. ⏳ Generic OfferBuilder component
8. ⏳ Services plugin (reference implementation)
9. ⏳ Products plugin (reference implementation)
10. ⏳ Backend API development

## 📚 References

- **SOLID Principles**: Single Responsibility, Dependency Inversion, Open/Closed
- **Repository Pattern**: Martin Fowler - Patterns of Enterprise Application Architecture
- **Plugin Architecture**: Robert C. Martin - Clean Architecture
- **DDD**: Eric Evans - Domain-Driven Design
