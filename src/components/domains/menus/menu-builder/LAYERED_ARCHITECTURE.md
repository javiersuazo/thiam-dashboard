# Menu Builder - Layered Architecture

## Overview

The Menu Builder follows a clean 3-layer architecture that completely separates:
1. **Presentation** (UI components)
2. **Business Logic** (domain rules & state management)
3. **Data** (API calls with mock data for now)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│                  FastMenuBuilder.tsx                     │
│                                                          │
│  - Pure UI rendering                                     │
│  - User interactions (clicks, drags, keyboard)          │
│  - Visual feedback                                       │
│  - NO business logic                                     │
│  - NO API calls                                          │
└─────────────────────────────────────────────────────────┘
                          ↓ uses hooks
┌─────────────────────────────────────────────────────────┐
│                 Business Logic Layer                     │
│              useMenuBuilderState.ts                      │
│                                                          │
│  - Domain logic (add/remove/duplicate items)            │
│  - Business rules (category mapping, validation)        │
│  - State management (courses, prices, metadata)         │
│  - Computed values (totals, subtotals)                  │
│  - NO UI code                                            │
│  - NO API calls                                          │
└─────────────────────────────────────────────────────────┘
                          ↓ calls
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                           │
│                useMenuBuilder.ts                         │
│                                                          │
│  - React Query hooks                                     │
│  - Data fetching/caching                                 │
│  - Mutations (create/update/delete)                      │
│  - **Returns MOCK DATA now** ← 🔄 Swap to real API later│
│  - NO business logic                                     │
│  - NO UI code                                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    API Service Layer                     │
│              menuBuilder.service.ts                      │
│                                                          │
│  - HTTP calls to backend                                 │
│  - Request/response mapping                              │
│  - Error handling                                        │
│  - **Not used yet** (data layer returns mocks)          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     Backend API                          │
│                  (Not implemented yet)                   │
└─────────────────────────────────────────────────────────┘
```

## Current State: Mock Data Mode

Right now, the **Data Layer** returns mock data:

```typescript
// hooks/useMenuBuilder.ts
const USE_MOCK_DATA = true // ← Toggle this to switch to real API

export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.itemsList(accountId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Returns mock menu items
        await new Promise(resolve => setTimeout(resolve, 500))
        return MOCK_MENU_ITEMS
      }
      // This will be used when backend is ready
      return menuBuilderService.getAvailableItems(accountId)
    },
  })
}
```

## Benefits of This Architecture

### 1. **Plug and Play Data Source**

When backend is ready, just change ONE line:

```typescript
// hooks/useMenuBuilder.ts
const USE_MOCK_DATA = false // ← That's it!
```

No other code changes needed! The UI and business logic remain untouched.

### 2. **Easy Testing**

Each layer can be tested independently:

```typescript
// Test business logic without UI
describe('useMenuBuilderState', () => {
  it('should add item to correct course', () => {
    const { result } = renderHook(() => useMenuBuilderState({...}))
    act(() => result.current.addItem(mockItem))
    expect(result.current.courses[0].items).toHaveLength(1)
  })
})

// Test UI without business logic
describe('FastMenuBuilder', () => {
  it('should render search input', () => {
    render(<FastMenuBuilder {...mockProps} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })
})
```

### 3. **Development Without Backend**

Frontend team can:
- ✅ Build complete UI
- ✅ Implement all features
- ✅ Test user flows
- ✅ Demo to stakeholders
- ✅ Deploy to staging

All without waiting for backend!

### 4. **Clear Responsibilities**

Each layer has ONE job:

| Layer | Responsibility | Should NOT |
|-------|---------------|------------|
| **Presentation** | Render UI, handle events | Calculate prices, call APIs |
| **Business Logic** | Domain rules, state | Render JSX, make HTTP calls |
| **Data** | Fetch/save data | Validate data, render UI |
| **API Service** | HTTP communication | Business logic, UI code |

## Layer Details

### Presentation Layer (FastMenuBuilder.tsx)

**What it does:**
- Renders forms, tables, buttons
- Handles user interactions (clicks, drags, keyboard)
- Shows loading states, errors
- Manages UI-only state (drawer open/closed, editing mode)

**What it doesn't do:**
- ❌ Calculate totals
- ❌ Validate business rules
- ❌ Make API calls
- ❌ Transform data

**Example:**
```tsx
export function FastMenuBuilder({ accountId, availableItems, onSave }: Props) {
  const menuState = useMenuBuilderState({...}) // ← Gets business logic

  // UI-only state
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'builder' | 'details'>('builder')

  return (
    <div>
      <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      <Button onClick={() => menuState.addItem(selectedItem)}>Add</Button>
      <div>Total: ${menuState.getTotalPrice() / 100}</div>
    </div>
  )
}
```

### Business Logic Layer (useMenuBuilderState.ts)

**What it does:**
- Manages domain state (courses, items, prices)
- Implements business rules (category mapping, duplication logic)
- Provides computed values (totals, subtotals)
- Handles domain events (add/remove/move items)

**What it doesn't do:**
- ❌ Render UI
- ❌ Make API calls
- ❌ Handle keyboard events

**Example:**
```typescript
export function useMenuBuilderState({ availableItems, ... }: Props) {
  const [courses, setCourses] = useState<Course[]>([...])
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>('sum-of-items')

  const addItem = useCallback((item: MenuItem) => {
    const destinationCourseId = getCourseIdForCategory(item.category) // Business rule
    setCourses(prev => /* ... */)
    toast.success(`Added ${item.name}`)
  }, [courses])

  const getTotalPrice = useCallback(() => {
    if (pricingStrategy === 'fixed') return fixedPriceCents || 0
    return courses.reduce(/* calculate sum */)
  }, [courses, pricingStrategy])

  return { courses, addItem, getTotalPrice, ... }
}
```

### Data Layer (useMenuBuilder.ts)

**What it does:**
- Fetches data from backend (or mocks)
- Caches data with React Query
- Handles mutations (create/update/delete)
- Manages loading/error states

**What it doesn't do:**
- ❌ Validate business rules
- ❌ Calculate prices
- ❌ Render UI

**Example (Current - Mock Data):**
```typescript
export function useAvailableMenuItems(accountId: string) {
  return useQuery({
    queryKey: MENU_BUILDER_KEYS.itemsList(accountId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network
        return MOCK_MENU_ITEMS
      }
      return menuBuilderService.getAvailableItems(accountId) // Real API
    },
    staleTime: 5 * 60 * 1000,
  })
}
```

**Example (Future - Real API):**
```typescript
// Just change USE_MOCK_DATA to false!
const USE_MOCK_DATA = false

// Everything else stays the same
```

### API Service Layer (menuBuilder.service.ts)

**What it does:**
- Makes HTTP requests
- Maps request/response data
- Handles HTTP errors

**What it doesn't do:**
- ❌ Business logic
- ❌ State management
- ❌ UI rendering

**Example:**
```typescript
export const menuBuilderService = {
  async getAvailableItems(accountId: string): Promise<MenuItem[]> {
    const { data, error } = await api.GET('/accounts/{accountId}/menu-items', {
      params: { path: { accountId } },
    })

    if (error) throw new Error('Failed to fetch menu items')
    return data as unknown as MenuItem[]
  },

  async createMenu(accountId: string, menu: CreateMenuRequest) {
    const { data, error } = await api.POST('/accounts/{accountId}/menus', {
      params: { path: { accountId } },
      body: menu as any,
    })

    if (error) throw new Error('Failed to create menu')
    return data
  },
}
```

## How to Switch from Mock to Real API

### Step 1: Backend implements endpoints

Backend team implements:
- `GET /accounts/:accountId/menu-items`
- `POST /accounts/:accountId/menus`
- etc.

### Step 2: Toggle the flag

```typescript
// hooks/useMenuBuilder.ts
- const USE_MOCK_DATA = true
+ const USE_MOCK_DATA = false
```

### Step 3: Test

That's it! The entire app now uses real API.

## Usage Examples

### Page Component (Now)

```tsx
// app/(admin)/menu-builder-test/page.tsx
import { MenuBuilderContainer } from '@/components/domains/menus/menu-builder'

export default function MenuBuilderPage() {
  return (
    <MenuBuilderContainer
      accountId="test-account"
      onSuccess={(menuId) => router.push(`/menus/${menuId}`)}
    />
  )
}
```

**What happens:**
1. `MenuBuilderContainer` calls `useAvailableMenuItems('test-account')`
2. Hook returns mock data (6 items)
3. User builds menu
4. User clicks Save
5. `useCreateMenu` mutation runs with mock (logs to console)
6. Success callback called with mock menu ID

### Page Component (After Backend Ready)

**Exact same code!** Just the internal flag changes.

```tsx
// No changes to this file!
export default function MenuBuilderPage() {
  return (
    <MenuBuilderContainer
      accountId="test-account"
      onSuccess={(menuId) => router.push(`/menus/${menuId}`)}
    />
  )
}
```

**What happens (automatically):**
1. `MenuBuilderContainer` calls `useAvailableMenuItems('test-account')`
2. Hook calls `menuBuilderService.getAvailableItems()` → backend API
3. User builds menu
4. User clicks Save
5. `useCreateMenu` mutation calls backend API
6. Success callback called with real menu ID from backend

## Summary

✅ **3 clean layers** - Each with single responsibility
✅ **Mock data in Data Layer** - Can develop without backend
✅ **One line to switch** - Change `USE_MOCK_DATA` flag when ready
✅ **No code duplication** - Business logic used by all
✅ **Easy testing** - Test each layer independently
✅ **Future-proof** - Easy to extend with new features

**Current State:**
- Presentation ✅ Complete
- Business Logic ✅ Complete
- Data Layer ✅ Returns mock data
- API Service ✅ Ready (not used yet)
- Backend ❌ Not implemented yet

**When Backend Ready:**
1. Change `USE_MOCK_DATA = false`
2. Test
3. Deploy

That's it! 🚀
