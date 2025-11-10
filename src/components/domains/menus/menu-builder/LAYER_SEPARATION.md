# Layer Separation - Complete Architecture

## 🎯 Clear Layer Boundaries

This codebase follows **strict layer separation** where each layer has a single responsibility and only communicates with adjacent layers.

---

## 📊 Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  🖼️  PRESENTATION LAYER                                     │
│  Files: components/*.tsx                                    │
│  Knows: Domain types (MenuItem, MenuBuilder)               │
│  Responsibility: UI rendering, user interactions            │
└─────────────────────────────┬───────────────────────────────┘
                              │ Uses domain types
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  🧠 BUSINESS LOGIC LAYER                                    │
│  Files: hooks/useMenuBuilderState.ts                        │
│  Knows: Domain types (MenuItem, MenuBuilder, Course)       │
│  Responsibility: State management, calculations, rules      │
└─────────────────────────────┬───────────────────────────────┘
                              │ Uses domain types
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  📦 DATA LAYER                                              │
│  Files: hooks/useMenuBuilder.ts                             │
│  Knows: Domain types + Adapters                            │
│  Responsibility: Fetch, cache, transform data               │
└──────────────────┬────────────────────┬─────────────────────┘
                   │                    │
                   ↓ API types          ↓ Domain types
                   │                    │
┌──────────────────┴────────────────────┴─────────────────────┐
│  🔄 ADAPTER LAYER ⭐                                        │
│  Files: adapters/menuBuilder.adapter.ts                    │
│  Knows: Both API types AND domain types                    │
│  Responsibility: Transform API ↔ Domain                    │
└──────────────────┬──────────────────────────────────────────┘
                   │ Uses API types
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  🌐 API SERVICE LAYER                                       │
│  Files: api/menuBuilder.service.ts                          │
│  Knows: API types, HTTP methods                            │
│  Responsibility: Raw HTTP calls                             │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP (JSON)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ☁️  BACKEND (Go API)                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Layer Details

### 1. 🖼️ Presentation Layer

**Files:**
- `components/FastMenuBuilder.tsx`
- `components/MenuBuilderContainer.tsx`

**What it knows:**
```typescript
import type { MenuItem, MenuBuilder } from '../types'
```

**What it does:**
- Renders UI components
- Handles user interactions (clicks, drags, keyboard)
- Manages UI-only state (modals, search input, view selection)
- Delegates all business logic to hooks

**What it NEVER does:**
- ❌ API calls
- ❌ Business calculations
- ❌ Data transformations
- ❌ Direct backend communication

**Example:**
```tsx
// FastMenuBuilder.tsx
export function FastMenuBuilder({
  availableItems,  // ← Domain type: MenuItem[]
  onSave,
}: FastMenuBuilderProps) {
  // Uses business logic hook
  const menuState = useMenuBuilderState({
    availableItems,  // ← Pass domain types
  })

  // UI-only state
  const [searchQuery, setSearchQuery] = useState('')
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false)

  // Delegate to business logic
  const handleAddItem = (item: MenuItem) => {
    menuState.addItem(item)  // ← Business logic handles this
    setSearchQuery('')       // ← UI state only
  }

  // Render with domain types
  return (
    <div>
      <h1>{menuState.name}</h1>
      <span>${menuState.getTotalPrice() / 100}</span>
      {/* UI rendering only */}
    </div>
  )
}
```

---

### 2. 🧠 Business Logic Layer

**Files:**
- `hooks/useMenuBuilderState.ts`

**What it knows:**
```typescript
import type { MenuItem, MenuBuilder, Course, CourseItem } from '../types'
```

**What it does:**
- Manages menu state (courses, items, pricing)
- Adds/removes/moves items
- Calculates totals and subtotals
- Enforces business rules (category mapping, pricing strategies)
- Provides computed values

**What it NEVER does:**
- ❌ API calls
- ❌ UI rendering
- ❌ Data fetching
- ❌ Knows about API structure

**Example:**
```tsx
// useMenuBuilderState.ts
export function useMenuBuilderState({
  availableItems,  // ← Domain type: MenuItem[]
}: UseMenuBuilderStateProps) {
  const [courses, setCourses] = useState<Course[]>([...])
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>('sum-of-items')

  // Pure business logic
  const addItem = useCallback((item: MenuItem) => {
    const destinationCourseId = getCourseIdForCategory(item.category)
    setCourses(prev => {
      const targetCourse = prev.find(c => c.id === destinationCourseId)
      if (!targetCourse) return prev

      return prev.map(course => {
        if (course.id !== destinationCourseId) return course

        const newItem: CourseItem = {
          menuItemId: item.id,
          position: course.items.length,
          priceCents: item.priceCents,
          isAvailable: true,
        }

        return {
          ...course,
          items: [...course.items, newItem],
        }
      })
    })
    toast.success(`Added ${item.name}`)
  }, [courses])

  // Computed business value
  const getTotalPrice = useCallback(() => {
    if (pricingStrategy === 'fixed') return fixedPriceCents || 0

    return courses.reduce((sum, course) => {
      return sum + course.items.reduce((courseSum, item) => {
        const menuItem = availableItems.find(mi => mi.id === item.menuItemId)
        return courseSum + (item.priceCents || menuItem?.priceCents || 0)
      }, 0)
    }, 0)
  }, [courses, pricingStrategy, fixedPriceCents, availableItems])

  return {
    courses,
    pricingStrategy,
    addItem,
    removeItem,
    getTotalPrice,
    // ... only business logic methods
  }
}
```

---

### 3. 📦 Data Layer

**Files:**
- `hooks/useMenuBuilder.ts`

**What it knows:**
```typescript
import type { MenuItem, MenuBuilder } from '../types'
import { menuBuilderAdapter } from '../adapters/menuBuilder.adapter'
import { menuBuilderService } from '../api/menuBuilder.service'
```

**What it does:**
- Fetches data from backend
- Uses **adapters** to transform API ↔ Domain
- Caches data with React Query
- Handles mutations (create, update, delete)
- Manages loading states

**What it NEVER does:**
- ❌ Business calculations
- ❌ UI rendering
- ❌ Passes raw API responses to components

**Example:**
```typescript
// useMenuBuilder.ts (Data Layer)
export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.itemsList(accountId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return MOCK_MENU_ITEMS  // Already in domain format
      }

      // ⬇️ 1. Fetch from API (returns API types)
      const apiItems = await menuBuilderService.getAvailableItems(accountId)

      // ⬇️ 2. Transform using adapter (API → Domain)
      return menuBuilderAdapter.toMenuItems(apiItems)
      //     ↑ Returns domain type: MenuItem[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateMenu(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (menu: MenuBuilder) => {  // ← Receives domain type
      if (USE_MOCK_DATA) {
        // Mock returns domain type
        return menuBuilderAdapter.toMenuBuilder(mockResponse)
      }

      // ⬇️ 1. Transform domain → API request
      const apiRequest = menuBuilderAdapter.fromMenuBuilder(menu)

      // ⬇️ 2. Send to backend
      const apiResponse = await menuBuilderService.createMenu(accountId, apiRequest)

      // ⬇️ 3. Transform API response → domain
      return menuBuilderAdapter.toMenuBuilder(apiResponse)
      //     ↑ Returns domain type: MenuBuilder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
      toast.success('Menu created successfully')
    },
  })
}
```

**Key principle:** Data layer is the **transformation boundary**. API types never leave this layer.

---

### 4. 🔄 Adapter Layer ⭐

**Files:**
- `adapters/menuBuilder.adapter.ts`

**What it knows:**
```typescript
// Both API types AND domain types
import type { MenuItem, MenuBuilder, Course } from '../types'
import type { MenuBuilderResponse } from '../api/menuBuilder.service'
```

**What it does:**
- Transforms API responses → Domain models
- Transforms Domain models → API requests
- Converts `null` → `undefined`
- Normalizes data formats
- Provides isolation from backend changes

**What it NEVER does:**
- ❌ API calls
- ❌ Business logic
- ❌ UI rendering
- ❌ State management

**Example:**
```typescript
// menuBuilderAdapter.ts (Adapter Layer)
export const menuBuilderAdapter = {
  // API → Domain
  toMenuItem(apiItem: any): MenuItem {
    return {
      id: apiItem.id,
      name: apiItem.name,
      description: apiItem.description || undefined,  // ⬅️ null → undefined
      category: apiItem.category,
      dietaryTags: apiItem.dietaryTags || undefined,
      priceCents: apiItem.priceCents,
      currency: apiItem.currency,
      imageUrl: apiItem.imageUrl || undefined,
      isAvailable: apiItem.isAvailable,
    }
  },

  toMenuItems(apiItems: any[]): MenuItem[] {
    return apiItems.map(item => this.toMenuItem(item))
  },

  // Domain → API
  fromMenuBuilder(menu: MenuBuilder): any {
    return {
      id: menu.id,
      name: menu.name,
      description: menu.description || null,  // ⬅️ undefined → null
      imageUrl: menu.imageUrl || null,
      courses: menu.courses.map(c => this.fromCourse(c)),
      isActive: menu.isActive,
      pricingStrategy: menu.pricingStrategy || 'sum-of-items',
      fixedPriceCents: menu.fixedPriceCents || null,
    }
  },

  fromCourse(course: Course): any {
    return {
      id: course.id,
      name: course.name,
      icon: course.icon,
      items: course.items.map(item => this.fromCourseItem(item)),
    }
  },
}
```

**Key principle:** Adapters are **pure functions** with no side effects.

---

### 5. 🌐 API Service Layer

**Files:**
- `api/menuBuilder.service.ts`

**What it knows:**
```typescript
import { api } from '@/lib/api'  // openapi-fetch client
```

**What it does:**
- Makes raw HTTP calls
- Returns API response types (as-is)
- Throws errors on failures
- No transformations

**What it NEVER does:**
- ❌ Data transformations
- ❌ Business logic
- ❌ Type conversions (adapters handle this)

**Example:**
```typescript
// menuBuilder.service.ts (API Service)
export const menuBuilderService = {
  async getAvailableItems(accountId: string): Promise<any[]> {
    const { data, error } = await api.GET('/accounts/{accountId}/menu-items', {
      params: { path: { accountId } },
    })
    if (error) throw new Error('Failed to fetch menu items')
    return data  // ← Returns raw API response (no transformation!)
  },

  async createMenu(accountId: string, menu: any): Promise<any> {
    const { data, error } = await api.POST('/accounts/{accountId}/menus', {
      params: { path: { accountId } },
      body: menu,  // ← Sends raw request (no transformation!)
    })
    if (error) throw new Error('Failed to create menu')
    return data  // ← Returns raw API response
  },
}
```

**Key principle:** API service is **dumb** - it just makes HTTP calls.

---

## 🔄 Complete Data Flow Example

### Scenario: User Adds Item to Menu

```
1. USER CLICKS "Add Salmon" in UI
   ↓

2. PRESENTATION LAYER (FastMenuBuilder.tsx)
   const handleAddItem = (item: MenuItem) => {
     menuState.addItem(item)  // ← Delegates to business logic
   }
   ↓ Passes domain type: MenuItem

3. BUSINESS LOGIC LAYER (useMenuBuilderState.ts)
   const addItem = useCallback((item: MenuItem) => {
     const destinationCourseId = getCourseIdForCategory(item.category)  // ← Business rule
     setCourses(prev => {
       // ... add item to correct course
     })
     toast.success(`Added ${item.name}`)
   }, [courses])
   ↓ Updates local state

4. USER CLICKS "Save Menu"
   ↓

5. PRESENTATION LAYER (FastMenuBuilder.tsx)
   const handleSave = async () => {
     await onSave?.(menu)  // ← Passes MenuBuilder (domain type)
   }
   ↓ Passes domain type: MenuBuilder

6. DATA LAYER (useMenuBuilder.ts)
   const createMutation = useMutation({
     mutationFn: async (menu: MenuBuilder) => {  // ← Receives domain type
       const apiRequest = menuBuilderAdapter.fromMenuBuilder(menu)  // ⬅️ Transform
       const apiResponse = await menuBuilderService.createMenu(accountId, apiRequest)
       return menuBuilderAdapter.toMenuBuilder(apiResponse)  // ⬅️ Transform back
     },
   })
   ↓ Transforms domain → API

7. ADAPTER LAYER (menuBuilderAdapter.ts)
   fromMenuBuilder(menu: MenuBuilder): any {
     return {
       name: menu.name,
       description: menu.description || null,  // ⬅️ undefined → null
       courses: menu.courses.map(c => this.fromCourse(c)),
       pricingStrategy: menu.pricingStrategy,
       // ...
     }
   }
   ↓ Returns API request format

8. API SERVICE LAYER (menuBuilder.service.ts)
   async createMenu(accountId: string, menu: any): Promise<any> {
     const { data, error } = await api.POST('/accounts/{accountId}/menus', {
       body: menu,  // ← Sends to backend
     })
     return data  // ← Returns raw API response
   }
   ↓ HTTP POST

9. BACKEND (Go API)
   Saves to database, returns JSON
   ↓ Returns API response

10. API SERVICE LAYER
    Returns raw API response to data layer
    ↓

11. ADAPTER LAYER
    toMenuBuilder(apiResponse): MenuBuilder {
      return {
        id: apiResponse.id,
        name: apiResponse.name,
        description: apiResponse.description || undefined,  // ⬅️ null → undefined
        // ...
      }
    }
    ↓ Returns domain type: MenuBuilder

12. DATA LAYER
    Returns MenuBuilder to component
    ↓

13. PRESENTATION LAYER
    Receives saved menu (domain type), shows success message
```

---

## ✅ Layer Contract Rules

### Rule 1: Components Only Know Domain Types
```typescript
// ✅ GOOD
function FastMenuBuilder({
  availableItems,  // MenuItem[]
  onSave,
}: FastMenuBuilderProps) {
  const menuState = useMenuBuilderState({ availableItems })
  // Only uses domain types
}

// ❌ BAD
function FastMenuBuilder({
  apiItems,  // API type
}: FastMenuBuilderProps) {
  const items = apiItems.map(api => ({  // ❌ Component doing transformation
    id: api.id,
    name: api.name,
  }))
}
```

### Rule 2: Business Logic Never Calls APIs
```typescript
// ✅ GOOD
export function useMenuBuilderState({
  availableItems,  // Domain type from data layer
}: Props) {
  const addItem = (item: MenuItem) => {
    // Pure business logic
  }
}

// ❌ BAD
export function useMenuBuilderState() {
  const addItem = async (item: MenuItem) => {
    await fetch('/api/items')  // ❌ Business logic calling API
  }
}
```

### Rule 3: Data Layer Always Uses Adapters
```typescript
// ✅ GOOD
export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryFn: async () => {
      const apiItems = await menuBuilderService.getAvailableItems(accountId)
      return menuBuilderAdapter.toMenuItems(apiItems)  // ⬅️ Transform!
    },
  })
}

// ❌ BAD
export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryFn: () => menuBuilderService.getAvailableItems(accountId)  // ❌ No transformation
  })
}
```

### Rule 4: Adapters Are Pure Functions
```typescript
// ✅ GOOD
toMenuItem(apiItem: any): MenuItem {
  return {
    id: apiItem.id,
    name: apiItem.name,
    // ... pure transformation
  }
}

// ❌ BAD
toMenuItem(apiItem: any): MenuItem {
  toast.success('Transformed')  // ❌ Side effect
  fetchSomething()  // ❌ API call
  return { ... }
}
```

### Rule 5: API Service Returns Raw Responses
```typescript
// ✅ GOOD
async getAvailableItems(accountId: string): Promise<any[]> {
  const { data, error } = await api.GET('/menu-items')
  if (error) throw new Error('Failed')
  return data  // ← Raw API response
}

// ❌ BAD
async getAvailableItems(accountId: string): Promise<MenuItem[]> {
  const { data } = await api.GET('/menu-items')
  return data.map(item => ({  // ❌ Transformation in API service
    id: item.id,
    name: item.name,
  }))
}
```

---

## 🎯 Summary

**Clear Boundaries:**

| Layer | Input | Output | Never Does |
|-------|-------|--------|------------|
| Presentation | Domain types | UI events | API calls, business logic |
| Business Logic | Domain types | Domain types | API calls, UI rendering |
| Data Layer | Domain types | Domain types | Business logic |
| Adapter | API types | Domain types | API calls, business logic |
| API Service | HTTP params | API types | Transformations |

**Key Benefits:**

1. ✅ **Backend changes** → Update adapter only
2. ✅ **Business rule changes** → Update business logic only
3. ✅ **UI changes** → Update components only
4. ✅ **Each layer testable** independently
5. ✅ **Type safety** throughout
6. ✅ **No coupling** between layers

**Remember:** Components should NEVER see API types. Only domain types! 🎯
