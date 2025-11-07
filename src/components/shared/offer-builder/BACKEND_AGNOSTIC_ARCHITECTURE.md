# Backend-Agnostic Architecture

## ✅ All Issues Fixed!

### Fixed Issues
1. ✅ **Can add multiple items** - Removed duplicate check that was blocking item additions
2. ✅ **No headcount field** - Removed from block form modal
3. ✅ **No tax display** - Removed all tax UI elements (still calculated in backend if needed)
4. ✅ **Bottom bar width matches content** - Changed from `max-w-7xl` to `max-w-4xl`
5. ✅ **Inline validation exists** - Forms use required fields and Input/TextArea components with validation

## How Backend-Agnostic Architecture Works

### The Problem We Solved
**Challenge:** Build an offer builder that doesn't need to know about backend implementation details, but can still communicate with any API.

**Solution:** Repository Pattern + Adapter Pattern + Plugin Architecture

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│  FastOfferBuilder (UI Component)                        │
│  - Beautiful UI with all features                       │
│  - Knows NOTHING about backend                          │
│  - Only works with domain types                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  FastOfferBuilderAdapter                                │
│  - Converts between plugin types ↔ UI types             │
│  - Detects CRUD operations                              │
│  - Maps field names if API changes                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  Plugin (Domain Logic)                                  │
│  - Catering-specific business rules                     │
│  - Quantity calculations                                │
│  - Pricing strategies                                   │
│  - Formatters                                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  Repository Interfaces (Contracts)                      │
│  - IOfferRepository                                     │
│  - ICatalogRepository                                   │
│  - IAdjustmentRepository                                │
│  - IAttachmentRepository                                │
└─────────────────────┬───────────────────────────────────┘
                      │
            ┌─────────┴─────────┐
            ↓                   ↓
┌─────────────────────┐  ┌──────────────────────┐
│  MockRepository     │  │  RealAPIRepository   │
│  (Development)      │  │  (Production)        │
│  - In-memory data   │  │  - HTTP calls to API │
│  - No backend       │  │  - JWT auth          │
│  - Fast testing     │  │  - Error handling    │
└─────────────────────┘  └──────────────────────┘
```

---

## Key Principles

### 1. **Component Knows Nothing About Backend**

The FastOfferBuilder component only knows about:
- How to display offers
- How to handle user interactions
- Its own state management

It does NOT know:
- ❌ API endpoints
- ❌ HTTP methods
- ❌ Authentication
- ❌ Backend data structures

### 2. **Repository Pattern = Contract**

Repository interfaces define WHAT operations are possible, not HOW they're implemented:

```typescript
export interface IOfferRepository {
  getById(id: string): Promise<Offer>
  createBlock(data: CreateBlockDTO): Promise<OfferBlock>
  updateBlock(id: string, data: UpdateBlockDTO): Promise<OfferBlock>
  deleteBlock(id: string): Promise<void>
  // ... etc
}
```

**Benefits:**
- ✅ Component doesn't care if data comes from mock, REST API, GraphQL, or gRPC
- ✅ Easy to test with mock data
- ✅ Can swap implementations without touching UI

### 3. **Adapter Handles Type Conversion**

When API changes (e.g., field renamed), only the adapter changes:

**Example:** API renames `deliveryTime` → `scheduledDeliveryTime`

```typescript
// BEFORE
function convertPluginBlockToLegacy(block: PluginBlock): LegacyBlock {
  return {
    deliveryTime: block.metadata?.deliveryTime
  }
}

// AFTER (only adapter changes!)
function convertPluginBlockToLegacy(block: PluginBlock): LegacyBlock {
  return {
    deliveryTime: block.metadata?.scheduledDeliveryTime // ← Only this line
  }
}
```

**Component code never changes!** ✅

---

## Real-World Usage

### Development (Mock Data)
```typescript
const mockRepo = new MockOfferRepository(initialOffers)
const mockCatalog = new MockCatalogRepository(catalogItems)
const plugin = new CateringOfferBuilderPlugin(mockRepo, mockCatalog)

<OfferBuilder
  offerId="demo-001"
  plugin={plugin}
  onSave={handleSave}
/>
```

**Benefits:**
- Works without backend running
- Fast iteration
- Easy testing
- Demo purposes

### Production (Real API)
```typescript
const apiRepo = new ApiOfferRepository({
  baseUrl: process.env.API_URL,
  auth: jwtToken
})
const apiCatalog = new ApiCatalogRepository({
  baseUrl: process.env.API_URL,
  auth: jwtToken
})
const plugin = new CateringOfferBuilderPlugin(apiRepo, apiCatalog)

<OfferBuilder
  offerId="real-offer-123"
  plugin={plugin}
  onSave={handleSave}
/>
```

**Benefits:**
- Same component code
- Real-time data
- Proper auth
- Error handling

---

## How CRUD Works

### Creating a Block

**User Action:** Clicks "+ Add Block" button

**Flow:**
1. **UI** → User fills form, clicks "Add Block"
2. **FastOfferBuilder** → Calls `offerState.addBlock(blockData)`
3. **Adapter** → Detects new block (ID starts with "block-")
4. **Adapter** → Calls `plugin.offerRepository.createBlock(data)`
5. **Repository** → Either:
   - `MockRepository`: Adds to in-memory Map
   - `ApiRepository`: `POST /api/v1/blocks` with auth
6. **Response** → New block with real ID from backend
7. **Adapter** → Converts response → UI types
8. **UI** → Block appears with correct data

**KEY POINT:** UI code never changes whether using mock or real API! ✅

### Updating an Item

**User Action:** Changes quantity inline

**Flow:**
1. **UI** → User edits quantity field
2. **FastOfferBuilder** → Calls `offerState.updateItem(itemId, { quantity: 5 })`
3. **Adapter** → Detects existing item (has real ID, not "item-...")
4. **Adapter** → Calls `plugin.offerRepository.updateItem(itemId, data)`
5. **Repository** → Either:
   - `MockRepository`: Updates Map entry
   - `ApiRepository`: `PATCH /api/v1/items/{id}` with auth
6. **Response** → Updated item
7. **Adapter** → Converts response
8. **UI** → Quantity updates, pricing recalculates

---

## Field Mapping Protection

### Problem
Backend changes field names → UI breaks everywhere

### Solution
Adapter centralizes all field mapping:

```typescript
// adapter/FastOfferBuilderAdapter.tsx
function convertPluginBlockToLegacy(pluginBlock: PluginBlock): LegacyBlock {
  return {
    id: pluginBlock.id,
    name: pluginBlock.name,

    // All field mapping happens HERE
    deliveryTime: pluginBlock.metadata?.deliveryTime,
    startTime: pluginBlock.metadata?.startTime,
    headcount: pluginBlock.metadata?.headcount,
    location: pluginBlock.metadata?.location,
    // ... etc
  }
}
```

**If API changes:**
- ✅ Update adapter mapping (1 place)
- ✅ Component code untouched
- ✅ UI works immediately

---

## Type Safety Throughout

Every layer is fully typed:

```typescript
// 1. Core Types (domain-agnostic)
export interface Offer {
  id: string
  title: string
  blocks: OfferBlock[]
  totalCents: number
}

// 2. Repository DTOs (contracts)
export interface CreateBlockDTO {
  offerId: string
  name: string
  metadata?: Record<string, any>
}

// 3. Plugin Types (domain-specific)
export interface CateringBlock extends OfferBlock {
  metadata: {
    headcount?: number
    dietaryRequirements?: Record<string, any>
  }
}
```

**Benefits:**
- ✅ TypeScript catches errors at compile-time
- ✅ IDE autocomplete everywhere
- ✅ Refactoring is safe
- ✅ API changes show as type errors

---

## Plugin System

Plugins add domain-specific behavior:

```typescript
export class CateringOfferBuilderPlugin extends OfferBuilderPlugin {
  // Catering-specific quantity logic
  smartSuggestions = {
    suggestQuantity(item, block) {
      const headcount = block.metadata?.headcount || 0
      if (item.type === 'menu_item') return headcount
      if (item.type === 'equipment') return Math.ceil(headcount / 50)
      return 1
    }
  }

  // Catering-specific pricing
  pricingStrategy = {
    calculateTotal(subtotal, tax, discount) {
      // Add gratuity for catering
      const gratuity = subtotal * 0.18
      return subtotal + tax - discount + gratuity
    }
  }
}
```

**Benefits:**
- ✅ Same core component works for catering, events, retail, etc.
- ✅ Each domain gets its own logic
- ✅ Easy to create new plugins

---

## Summary

### The Architecture Solves:
1. ✅ **Backend Independence** - Works with any API or mock data
2. ✅ **Field Mapping** - API changes don't break UI
3. ✅ **Type Safety** - Full TypeScript coverage
4. ✅ **Testability** - Easy to test with mocks
5. ✅ **Flexibility** - Swap implementations easily
6. ✅ **Domain Logic** - Plugin system for customization

### What Changes Where:

| Change | Adapter | Plugin | Component |
|--------|---------|--------|-----------|
| API field renamed | ✅ Yes | ❌ No | ❌ No |
| New backend | ❌ No | ✅ Repository | ❌ No |
| Pricing logic | ❌ No | ✅ Yes | ❌ No |
| UI redesign | ❌ No | ❌ No | ✅ Yes |
| Add feature | ✅ Maybe | ✅ Maybe | ✅ Yes |

### The Magic:
**Component code stays the same whether using:**
- Mock data (development)
- REST API (production)
- GraphQL (future)
- gRPC (future)
- Different backend (future)

**This is true backend-agnostic architecture!** 🎉
