# Adapter Pattern - Data Layer Isolation

## 🎯 Why We Use Adapters

The adapter pattern creates a **transformation layer** between the backend API and our domain models. This provides:

1. **Backend Independence** - If backend changes field names/formats, we only update the adapter
2. **Domain Integrity** - Components only know about our domain models, never API structures
3. **Null Safety** - Transform backend `null` values to `undefined` for cleaner TypeScript
4. **Data Normalization** - Convert API formats (snake_case, different types) to our standards

---

## 📊 Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Components)                         │
│  - FastMenuBuilder.tsx                                  │
│  - Only knows: MenuItem, MenuBuilder (domain types)     │
│  - Never sees: API response structures                  │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ↓ Uses domain types
┌─────────────────────────────────────────────────────────┐
│  BUSINESS LOGIC LAYER (Hooks)                           │
│  - useMenuBuilderState.ts                               │
│  - Works with: MenuItem[], MenuBuilder                  │
│  - Pure domain logic, no API knowledge                  │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ↓ Uses domain types
┌─────────────────────────────────────────────────────────┐
│  DATA LAYER (React Query Hooks)                         │
│  - useMenuBuilder.ts                                    │
│  - Fetches from backend                                 │
│  - Uses ADAPTERS to transform API ↔ Domain             │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ↓ API types ↓
                              ↓           ↑ Domain types
                              ↓           ↑
┌─────────────────────────────────────────────────────────┐
│  ADAPTER LAYER (Transformers) ⭐ NEW                    │
│  - menuBuilderAdapter.ts                                │
│  - toMenuItem(apiItem) → MenuItem                       │
│  - toMenuBuilder(apiMenu) → MenuBuilder                 │
│  - fromMenuBuilder(menu) → API request                  │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ↓ Uses API types
┌─────────────────────────────────────────────────────────┐
│  API SERVICE LAYER (HTTP Calls)                         │
│  - menuBuilder.service.ts                               │
│  - Raw fetch() calls                                    │
│  - Returns: API response types                          │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ↓ HTTP (JSON)
┌─────────────────────────────────────────────────────────┐
│  BACKEND (Go API)                                        │
│  - Returns: JSON with API structure                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 How Adapters Work

### Example: Fetching Menu Items

**1. Component requests data (domain types):**
```tsx
// FastMenuBuilder.tsx
const { data: availableItems } = useAvailableMenuItems(accountId)
// availableItems: MenuItem[] (domain type)
```

**2. Data layer fetches from API:**
```typescript
// useMenuBuilder.ts (Data Layer)
export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.itemsList(accountId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return MOCK_MENU_ITEMS // Already in domain format
      }

      // ⬇️ Get API response
      const apiItems = await menuBuilderService.getAvailableItems(accountId)

      // ⬇️ Transform API → Domain using adapter
      return menuBuilderAdapter.toMenuItems(apiItems)
    },
  })
}
```

**3. Adapter transforms API response to domain model:**
```typescript
// menuBuilderAdapter.ts (Adapter Layer)
export const menuBuilderAdapter = {
  toMenuItem(apiItem: any): MenuItem {
    return {
      id: apiItem.id,
      name: apiItem.name,
      description: apiItem.description || undefined,  // null → undefined
      category: apiItem.category,
      dietaryTags: apiItem.dietaryTags || undefined,  // null → undefined
      priceCents: apiItem.priceCents,
      currency: apiItem.currency,
      imageUrl: apiItem.imageUrl || undefined,  // null → undefined
      isAvailable: apiItem.isAvailable,
    }
  },

  toMenuItems(apiItems: any[]): MenuItem[] {
    return apiItems.map(item => this.toMenuItem(item))
  }
}
```

**4. API service makes HTTP call:**
```typescript
// menuBuilder.service.ts (API Service)
export const menuBuilderService = {
  async getAvailableItems(accountId: string): Promise<any[]> {
    const { data, error } = await api.GET('/accounts/{accountId}/menu-items', {
      params: { path: { accountId } },
    })
    if (error) throw new Error('Failed to fetch menu items')
    return data  // Returns raw API response
  },
}
```

---

## 🔀 Transformation Examples

### Example 1: API Response → Domain Model

**Backend sends:**
```json
{
  "id": "item_123",
  "name": "Grilled Salmon",
  "description": null,
  "category": "mains",
  "dietaryTags": null,
  "priceCents": 2850,
  "currency": "USD",
  "imageUrl": "https://cdn.example.com/salmon.jpg",
  "isAvailable": true
}
```

**Adapter transforms to:**
```typescript
{
  id: "item_123",
  name: "Grilled Salmon",
  description: undefined,  // ⬅️ null → undefined
  category: "mains",
  dietaryTags: undefined,  // ⬅️ null → undefined
  priceCents: 2850,
  currency: "USD",
  imageUrl: "https://cdn.example.com/salmon.jpg",
  isAvailable: true
}
```

**Component receives clean domain model:**
```tsx
const item: MenuItem = {
  id: "item_123",
  name: "Grilled Salmon",
  // description is undefined (no null checks needed!)
  category: "mains",
  priceCents: 2850,
  currency: "USD",
  imageUrl: "https://cdn.example.com/salmon.jpg",
  isAvailable: true
}

// Now you can safely do:
{item.description && <p>{item.description}</p>}
```

---

### Example 2: Domain Model → API Request

**Component wants to save menu:**
```tsx
const createMutation = useCreateMenu(accountId)

const menu: MenuBuilder = {
  name: "Summer Menu",
  description: undefined,  // Domain uses undefined
  courses: [...],
  isActive: false,
  pricingStrategy: "sum-of-items",
}

createMutation.mutate(menu)
```

**Adapter transforms to API request:**
```typescript
// menuBuilderAdapter.ts
fromMenuBuilder(menu: MenuBuilder): any {
  return {
    name: menu.name,
    description: menu.description || null,  // ⬅️ undefined → null
    courses: menu.courses.map(c => this.fromCourse(c)),
    isActive: menu.isActive,
    pricingStrategy: menu.pricingStrategy || 'sum-of-items',
    fixedPriceCents: menu.fixedPriceCents || null,  // ⬅️ undefined → null
  }
}
```

**Backend receives:**
```json
{
  "name": "Summer Menu",
  "description": null,
  "courses": [...],
  "isActive": false,
  "pricingStrategy": "sum-of-items",
  "fixedPriceCents": null
}
```

---

## 💡 Benefits of This Pattern

### 1. Backend Changes Don't Break Components

**Scenario**: Backend changes `priceCents` to `price_cents`

**Without adapter** ❌:
```typescript
// Every component breaks!
<span>${item.priceCents / 100}</span>  // ❌ undefined
```

**With adapter** ✅:
```typescript
// Fix in ONE place (adapter):
toMenuItem(apiItem: any): MenuItem {
  return {
    ...
    priceCents: apiItem.price_cents,  // ⬅️ Map new field name
  }
}

// Components still work:
<span>${item.priceCents / 100}</span>  // ✅ Works!
```

---

### 2. Null Safety

**Without adapter** ❌:
```typescript
// Components must check null everywhere
{item.description !== null && <p>{item.description}</p>}
{item.dietaryTags !== null && item.dietaryTags.map(...)}
```

**With adapter** ✅:
```typescript
// Adapter converts null → undefined
toMenuItem(apiItem: any): MenuItem {
  return {
    description: apiItem.description || undefined,
    dietaryTags: apiItem.dietaryTags || undefined,
  }
}

// Components use simple checks
{item.description && <p>{item.description}</p>}
{item.dietaryTags?.map(...)}
```

---

### 3. Type Safety

**Without adapter** ❌:
```typescript
// API returns 'any', components have no type safety
const apiResponse = await fetch('/api/items')
const items = await apiResponse.json()  // any[]
items[0].name  // ❌ No autocomplete, no type checking
```

**With adapter** ✅:
```typescript
// Adapter enforces type transformation
toMenuItem(apiItem: any): MenuItem {  // Input: any
  return {                             // Output: MenuItem (typed!)
    id: apiItem.id,
    name: apiItem.name,
    // ... all fields typed
  }
}

// Components get full type safety
const items: MenuItem[] = useAvailableMenuItems()
items[0].name  // ✅ Autocomplete, type checked
```

---

### 4. Data Normalization

**Scenario**: Backend sends prices in different currencies

**With adapter** ✅:
```typescript
toMenuItem(apiItem: any): MenuItem {
  // Normalize all prices to cents in USD
  let priceCents = apiItem.priceCents

  if (apiItem.currency === 'EUR') {
    priceCents = Math.round(priceCents * 1.1)  // Convert EUR → USD
  }

  return {
    ...
    priceCents,
    currency: 'USD',  // Always return USD
  }
}
```

---

## 🧪 Testing Benefits

### Test Adapters Independently

```typescript
// menuBuilderAdapter.test.ts
describe('menuBuilderAdapter', () => {
  it('should convert null to undefined', () => {
    const apiItem = {
      id: '1',
      name: 'Test',
      description: null,  // ⬅️ Backend sends null
      category: 'mains',
      priceCents: 1000,
      currency: 'USD',
      isAvailable: true,
    }

    const domainItem = menuBuilderAdapter.toMenuItem(apiItem)

    expect(domainItem.description).toBeUndefined()  // ⬅️ Converted to undefined
  })

  it('should convert undefined to null for API requests', () => {
    const domainMenu: MenuBuilder = {
      name: 'Test Menu',
      description: undefined,  // ⬅️ Domain uses undefined
      courses: [],
      isActive: false,
      pricingStrategy: 'sum-of-items',
    }

    const apiRequest = menuBuilderAdapter.fromMenuBuilder(domainMenu)

    expect(apiRequest.description).toBeNull()  // ⬅️ Converted to null
  })
})
```

---

## 📁 File Structure

```
src/components/domains/menus/menu-builder/
├── adapters/                           ⭐ NEW
│   └── menuBuilder.adapter.ts          → Transforms API ↔ Domain
├── api/
│   └── menuBuilder.service.ts          → Raw API calls (returns API types)
├── hooks/
│   ├── useMenuBuilder.ts               → Data layer (uses adapters)
│   └── useMenuBuilderState.ts          → Business logic (uses domain types)
├── components/
│   └── FastMenuBuilder.tsx             → Presentation (uses domain types)
└── types.ts                            → Domain types (MenuItem, MenuBuilder)
```

---

## 🔄 Data Flow with Adapters

### Read Flow (GET)

```
1. Component                    → Requests: MenuItem[]
         ↓
2. Data Layer (useMenuBuilder)  → Calls API service
         ↓
3. API Service                  → HTTP GET /menu-items
         ↓
4. Backend                      → Returns: API JSON
         ↓
5. API Service                  → Returns: any[]
         ↓
6. Adapter                      → toMenuItems(apiItems)
         ↓                         Transforms: any[] → MenuItem[]
7. Data Layer                   → Returns: MenuItem[]
         ↓
8. Component                    → Receives: MenuItem[]
```

### Write Flow (POST/PUT)

```
1. Component                    → Sends: MenuBuilder
         ↓
2. Data Layer (useMenuBuilder)  → Receives: MenuBuilder
         ↓
3. Adapter                      → fromMenuBuilder(menu)
         ↓                         Transforms: MenuBuilder → API request
4. API Service                  → HTTP POST /menus
         ↓
5. Backend                      → Returns: API JSON
         ↓
6. API Service                  → Returns: any
         ↓
7. Adapter                      → toMenuBuilder(apiResponse)
         ↓                         Transforms: any → MenuBuilder
8. Data Layer                   → Returns: MenuBuilder
         ↓
9. Component                    → Receives: MenuBuilder
```

---

## 🎯 Key Principles

### 1. Components Never See API Types
```typescript
// ❌ WRONG - Component knows about API structure
function FastMenuBuilder() {
  const { data: apiItems } = useQuery(...)
  const items = apiItems.map(api => ({  // Component doing transformation
    id: api.id,
    name: api.name,
    description: api.description || undefined,
  }))
}

// ✅ RIGHT - Component only sees domain types
function FastMenuBuilder() {
  const { data: items } = useAvailableMenuItems()  // Already MenuItem[]
  // items is already clean domain model
}
```

### 2. Adapters Are Pure Functions
```typescript
// ✅ GOOD - Pure transformation
toMenuItem(apiItem: any): MenuItem {
  return {
    id: apiItem.id,
    name: apiItem.name,
    // ...
  }
}

// ❌ BAD - Side effects in adapter
toMenuItem(apiItem: any): MenuItem {
  toast.success('Transformed item')  // ❌ Side effect
  fetchRelatedData()  // ❌ API call
  return { ... }
}
```

### 3. Data Layer Uses Adapters
```typescript
// ✅ GOOD - Data layer transforms at boundaries
export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryFn: async () => {
      const apiItems = await menuBuilderService.getAvailableItems(accountId)
      return menuBuilderAdapter.toMenuItems(apiItems)  // ⬅️ Transform here
    },
  })
}

// ❌ BAD - Returning raw API response
export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryFn: () => menuBuilderService.getAvailableItems(accountId)  // ❌ No transformation
  })
}
```

---

## 🚀 Migration Impact

### Before (Without Adapters)
```typescript
// Components tightly coupled to API structure
const { data: apiItems } = useQuery(...)
{apiItems.map(item => (
  <div>
    <h3>{item.name}</h3>
    {item.description !== null && <p>{item.description}</p>}
  </div>
))}
```

### After (With Adapters)
```typescript
// Components use clean domain models
const { data: items } = useAvailableMenuItems(accountId)
{items.map(item => (
  <div>
    <h3>{item.name}</h3>
    {item.description && <p>{item.description}</p>}
  </div>
))}
```

### If Backend Changes
```typescript
// Backend changes: priceCents → price_cents

// ❌ Without adapter: Every component breaks
<span>${item.priceCents / 100}</span>  // ❌ undefined

// ✅ With adapter: Fix in ONE place
toMenuItem(apiItem: any): MenuItem {
  return {
    priceCents: apiItem.price_cents,  // ⬅️ One-line fix
  }
}

// All components still work:
<span>${item.priceCents / 100}</span>  // ✅ Works!
```

---

## ✅ Summary

**Adapter Pattern Benefits:**

1. ✅ **Backend Independence** - API changes only affect adapter
2. ✅ **Null Safety** - Convert null → undefined for cleaner TypeScript
3. ✅ **Type Safety** - Enforce domain types throughout app
4. ✅ **Data Normalization** - Transform API formats to our standards
5. ✅ **Testability** - Test transformations independently
6. ✅ **Clean Components** - Components never see API structures
7. ✅ **Single Responsibility** - Each layer has one job

**Remember:** The data layer is **NOT just for fetching**. It's for:
- Fetching from backend ✅
- Transforming API → Domain ✅
- Caching ✅
- Optimistic updates ✅
- Error handling ✅

**Components should ONLY know about domain types, never API types!** 🎯
