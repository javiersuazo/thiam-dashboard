# Menu Builder - Architecture Documentation

## Overview

The Menu Builder is a self-contained, production-ready module designed following Domain-Driven Design (DDD), SOLID principles, and clean architecture patterns. It provides a complete solution for creating and managing restaurant menus with a speed-first, keyboard-friendly interface.

## Design Philosophy

### 1. Plug and Play
- **Zero Configuration**: Works out of the box with just `accountId`
- **Self-Contained**: All dependencies within the module
- **No Side Effects**: Doesn't pollute global state
- **Easy Integration**: Single import, single component

### 2. Separation of Concerns
```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (FastMenuBuilder.tsx)                │
│    - UI rendering                       │
│    - User interactions                  │
│    - Visual feedback                    │
└─────────────────────────────────────────┘
              ↓ uses ↓
┌─────────────────────────────────────────┐
│         Business Logic Layer            │
│    (useMenuBuilderState.ts)             │
│    - State management                   │
│    - Business rules                     │
│    - Domain logic                       │
└─────────────────────────────────────────┘
              ↓ uses ↓
┌─────────────────────────────────────────┐
│         Data Access Layer               │
│    (useMenuBuilder.ts)                  │
│    - React Query hooks                  │
│    - Cache management                   │
│    - Optimistic updates                 │
└─────────────────────────────────────────┘
              ↓ uses ↓
┌─────────────────────────────────────────┐
│         API Service Layer               │
│    (menuBuilder.service.ts)             │
│    - HTTP calls                         │
│    - Request/Response mapping           │
│    - Error handling                     │
└─────────────────────────────────────────┘
              ↓ calls ↓
┌─────────────────────────────────────────┐
│         Backend API                     │
└─────────────────────────────────────────┘
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

Each module has exactly one reason to change:

- **menuBuilder.service.ts**: Changes only if API contracts change
- **useMenuBuilderState.ts**: Changes only if business logic changes
- **FastMenuBuilder.tsx**: Changes only if UI requirements change
- **schemas.ts**: Changes only if validation rules change

### Open/Closed Principle (OCP)

The module is open for extension, closed for modification:

```tsx
// ✅ Extension point: Custom validation
const customSchema = menuBuilderSchema.extend({
  customField: z.string()
})

// ✅ Extension point: Custom hooks
export function useMenuWithAnalytics(accountId: string) {
  const menu = useMenu(accountId)
  const analytics = useAnalytics(menu.data?.id)
  return { menu, analytics }
}

// ✅ Extension point: Composition
<FastMenuBuilder
  availableItems={customFilteredItems}
  onSave={customSaveWithAnalytics}
/>
```

### Liskov Substitution Principle (LSP)

Components accept interface contracts:

```tsx
// Any component implementing these props can substitute
interface MenuBuilderProps {
  accountId: string
  availableItems: MenuItem[]
  onSave?: (menu: MenuBuilder) => void | Promise<void>
}

// Both work interchangeably
<FastMenuBuilder {...props} />
<SlowMenuBuilder {...props} />  // Hypothetical alternative
```

### Interface Segregation Principle (ISP)

Small, focused interfaces:

```tsx
// ✅ Specific hooks for specific needs
useAvailableMenuItems(accountId)  // Just items
useMenu(accountId, menuId)        // Just one menu
useMenus(accountId)               // Just list

// ❌ Not a giant useMenuEverything() hook
```

### Dependency Inversion Principle (DIP)

High-level modules don't depend on low-level modules:

```tsx
// Component depends on abstraction (hook)
const { data } = useAvailableMenuItems(accountId)

// Hook depends on abstraction (service)
queryFn: () => menuBuilderService.getAvailableItems(accountId)

// Service depends on abstraction (api client)
await api.GET('/accounts/{accountId}/menu-items', {...})
```

## Domain-Driven Design (DDD)

### Bounded Context

```
Menu Builder Context
├── Entities
│   ├── Menu (aggregate root)
│   ├── Course (entity)
│   └── CourseItem (value object)
├── Value Objects
│   ├── PricingStrategy
│   ├── Price (cents)
│   └── Position
└── Services
    ├── MenuBuilderService
    └── ValidationService
```

### Ubiquitous Language

Terms used consistently across code, UI, and documentation:
- **Menu**: The aggregate containing courses
- **Course**: A section of a menu (appetizers, mains, etc.)
- **MenuItem**: An individual dish that can be added
- **CourseItem**: A MenuItem when added to a Course
- **Pricing Strategy**: Fixed or sum-of-items
- **Available**: Whether an item can be ordered

### Aggregates

**Menu is the Aggregate Root**:
```tsx
interface MenuBuilder {
  id?: string
  name: string
  courses: Course[]  // ← Aggregated entities
  // ... other properties
}
```

Rules:
- Only Menu can be directly queried/saved
- Courses are managed through Menu
- CourseItems are managed through Courses
- Consistency boundary at Menu level

## Data Flow Patterns

### Read Flow (Query)

```
Component
    ↓
useAvailableMenuItems(accountId)
    ↓
React Query Cache (check)
    ↓ (if stale)
menuBuilderService.getAvailableItems()
    ↓
api.GET('/accounts/{accountId}/menu-items')
    ↓
Backend API
    ↓ (response)
Transform to MenuItem[]
    ↓
React Query Cache (update)
    ↓
Component (re-render)
```

### Write Flow (Mutation)

```
User clicks Save
    ↓
handleSave(menu)
    ↓
Validate with Zod schema
    ↓ (if valid)
useCreateMenu.mutate(menu)
    ↓
Optimistic Update (optional)
    ↓
menuBuilderService.createMenu()
    ↓
api.POST('/accounts/{accountId}/menus')
    ↓
Backend API
    ↓ (response)
Invalidate related queries
    ↓
Re-fetch stale data
    ↓
Toast notification
    ↓
onSuccess callback
```

## State Management Strategy

### Local State (useState)
Used for:
- UI-only state (drawer open/closed, editing name)
- Temporary input values (search query)
- Visual feedback (highlighted row)

### Derived State (useMemo, useCallback)
Used for:
- Computed values (total price, item count)
- Filtered lists (search results)
- Memoized callbacks

### Server State (React Query)
Used for:
- API data (menu items, menus)
- Cache management
- Loading/error states
- Optimistic updates

### No Global State
- Each component instance is independent
- No Redux, Zustand, or Context needed
- State passed via props when needed

## Error Handling Strategy

### Layered Error Handling

```
1. Input Validation (Zod)
   ↓ (invalid)
   Show form errors

2. Business Logic Validation
   ↓ (invalid)
   Toast warning

3. API Error
   ↓ (error)
   Toast error + retry button

4. Network Error
   ↓ (error)
   Offline indicator + queue
```

### Error Recovery

```tsx
// Service layer: Throw descriptive errors
if (error) throw new Error('Failed to create menu')

// Hook layer: Catch and show user-friendly message
onError: () => {
  toast.error('Could not save your menu. Please try again.')
}

// Component layer: Show fallback UI
{isError && <ErrorBoundary />}
```

## Performance Optimizations

### 1. React Query Caching
```tsx
staleTime: 5 * 60 * 1000  // Items cached for 5 minutes
```

### 2. Optimistic Updates
```tsx
onMutate: async (newMenu) => {
  await queryClient.cancelQueries({ queryKey: MENU_BUILDER_KEYS.list(accountId) })
  const previous = queryClient.getQueryData(MENU_BUILDER_KEYS.list(accountId))
  queryClient.setQueryData(MENU_BUILDER_KEYS.list(accountId), old => [...old, newMenu])
  return { previous }
}
```

### 3. Memoization
```tsx
const getTotalPrice = useCallback(() => {
  // Expensive calculation memoized
}, [courses, pricingStrategy, fixedPriceCents])
```

### 4. Debouncing
```tsx
const debouncedSearch = useDe bounce(searchQuery, 300)
```

### 5. Code Splitting
```tsx
const MenuBuilder = lazy(() => import('./menu-builder'))
```

## Testing Strategy

### Unit Tests
- Pure functions in utils/
- Validation schemas
- Business logic in hooks

### Integration Tests
- Component + hooks
- API service + mocks
- Complete user flows

### E2E Tests
- Full application flow
- Real backend (staging)
- Critical paths only

## Security Considerations

### Input Sanitization
```tsx
// All user input validated with Zod
const result = menuBuilderSchema.safeParse(input)
```

### Authorization
```tsx
// Backend validates accountId matches user's account
// Frontend just passes accountId from session
```

### XSS Prevention
```tsx
// React escapes by default
// No dangerouslySetInnerHTML used
```

### CSRF Protection
```tsx
// API client handles CSRF tokens
// Configured in lib/api/middleware.ts
```

## Scalability Considerations

### Handling Large Menus
- Virtual scrolling for 1000+ items
- Pagination for course list
- Lazy loading of images

### Handling Many Users
- Optimistic updates reduce perceived latency
- React Query deduplicates requests
- Backend implements caching

### Database Design
```sql
-- Recommended schema
menus (id, account_id, name, metadata, created_at, updated_at)
courses (id, menu_id, name, position)
course_items (id, course_id, menu_item_id, position, price_cents)
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] CORS configured on backend
- [ ] Error tracking (Sentry) enabled
- [ ] Analytics events tracked
- [ ] Performance monitoring enabled
- [ ] Feature flags for gradual rollout
- [ ] Database migrations run
- [ ] Cache warming strategy
- [ ] Rollback plan documented

## Monitoring and Observability

### Key Metrics
- Time to first menu load
- Menu save success rate
- Average items per menu
- Search usage rate
- Keyboard shortcut usage

### Logs to Capture
- Menu creation/update/delete
- Failed API calls
- Validation errors
- User errors (not found, unauthorized)

### Alerts to Configure
- Error rate > 5%
- P95 load time > 3s
- Failed mutation rate > 10%

## Future Architecture Improvements

### Phase 2: Collaboration
- Real-time updates (WebSocket)
- Multi-user editing
- Change history/versioning

### Phase 3: AI Features
- Smart item suggestions
- Auto-categorization
- Price optimization

### Phase 4: Enterprise
- Approval workflows
- Role-based editing
- Audit logs
- Compliance features
