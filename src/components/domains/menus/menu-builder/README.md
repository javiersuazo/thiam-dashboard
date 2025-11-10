# Menu Builder Module

A self-contained, production-ready menu builder component following DDD, SOLID principles, and clean architecture patterns.

## Architecture

```
menu-builder/
├── api/                          # Backend service layer
│   └── menuBuilder.service.ts    # API calls abstraction
├── components/                   # React components
│   ├── FastMenuBuilder.tsx       # Main UI component
│   └── MenuBuilderContainer.tsx  # Smart container with data fetching
├── hooks/                        # Custom React hooks
│   ├── useMenuBuilder.ts         # React Query hooks for API
│   └── useMenuBuilderState.ts    # State management logic
├── validation/                   # Validation layer
│   └── schemas.ts                # Zod validation schemas
├── types.ts                      # TypeScript type definitions
└── index.ts                      # Public API exports
```

## Key Principles

### 1. Domain-Driven Design (DDD)
- **Bounded Context**: Menu builder is isolated from other domains
- **Ubiquitous Language**: Types match business domain (MenuItem, Course, MenuBuilder)
- **Aggregates**: Menu is the aggregate root containing courses and items

### 2. SOLID Principles
- **Single Responsibility**: Each module has one clear purpose
  - `menuBuilder.service.ts` - API communication
  - `useMenuBuilderState.ts` - State management
  - `FastMenuBuilder.tsx` - UI presentation

- **Open/Closed**: Extendable through props, closed for modification

- **Liskov Substitution**: Components accept interface contracts via props

- **Interface Segregation**: Small, focused interfaces (e.g., separate hooks for items vs menus)

- **Dependency Inversion**: Components depend on abstractions (hooks) not concrete implementations

### 3. Separation of Concerns
- **API Layer**: Handles all backend communication
- **Hooks Layer**: Manages data fetching and state
- **Validation Layer**: Ensures data integrity
- **Component Layer**: Pure UI rendering

## Usage

### Basic Usage (With Data Fetching)

```tsx
import { MenuBuilderContainer } from '@/components/domains/menus/menu-builder'

function MenuPage() {
  return (
    <MenuBuilderContainer
      accountId="account-123"
      onSuccess={(menuId) => router.push(`/menus/${menuId}`)}
      onCancel={() => router.back()}
    />
  )
}
```

### Edit Existing Menu

```tsx
<MenuBuilderContainer
  accountId="account-123"
  menuId="menu-456"
  onSuccess={(menuId) => router.push(`/menus/${menuId}`)}
/>
```

### Advanced Usage (Custom Data Source)

```tsx
import { FastMenuBuilder } from '@/components/domains/menus/menu-builder'

function CustomMenuBuilder() {
  const items = useCustomMenuItems() // Your custom hook

  const handleSave = async (menu: MenuBuilder) => {
    await customSaveLogic(menu)
  }

  return (
    <FastMenuBuilder
      accountId="account-123"
      availableItems={items}
      onSave={handleSave}
    />
  )
}
```

## API Integration

### Backend Endpoints Expected

```
GET    /accounts/:accountId/menu-items           # List available items
GET    /accounts/:accountId/menus                # List all menus
GET    /accounts/:accountId/menus/:menuId        # Get specific menu
POST   /accounts/:accountId/menus                # Create menu
PUT    /accounts/:accountId/menus/:menuId        # Update menu
DELETE /accounts/:accountId/menus/:menuId        # Delete menu
POST   /accounts/:accountId/menus/:menuId/duplicate  # Duplicate menu
```

### Request/Response Types

All API contracts are defined in `api/menuBuilder.service.ts`:
- `CreateMenuRequest` - Menu creation payload
- `UpdateMenuRequest` - Menu update payload
- `MenuBuilderResponse` - Menu response from backend

## Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook (useMenuBuilderState)
    ↓
State Update
    ↓
Re-render
    ↓
User Clicks Save
    ↓
Validation (Zod Schema)
    ↓
API Service (menuBuilder.service)
    ↓
React Query Mutation
    ↓
Backend API
    ↓
Cache Invalidation
    ↓
Success Callback
```

## Features

### Core Functionality
- ✅ Drag and drop items between courses
- ✅ Duplicate items within courses
- ✅ Smart category-to-course mapping
- ✅ Keyboard shortcuts (/, Enter, Alt+1-9, ], [, Esc)
- ✅ Real-time price calculation
- ✅ Fixed vs sum-of-items pricing
- ✅ Inline price editing
- ✅ Search with type-ahead
- ✅ Details slide-in panel
- ✅ Sticky footer with actions

### Technical Features
- ✅ Type-safe API integration
- ✅ React Query for caching and optimistic updates
- ✅ Zod validation
- ✅ Error handling with toast notifications
- ✅ Loading states
- ✅ Dark mode support

## Extending the Module

### Adding a New Course Type

```tsx
// In types.ts
export const DEFAULT_COURSES: Course[] = [
  // ... existing courses
  {
    name: 'Brunch',
    icon: '🥐',
    minItems: 0,
    maxItems: undefined,
  },
]
```

### Adding New Validation Rules

```tsx
// In validation/schemas.ts
export const menuBuilderSchema = z.object({
  // ... existing fields
  maxPrice: z.number().optional(),
}).refine(
  (data) => {
    if (data.maxPrice) {
      const total = calculateTotal(data.courses)
      return total <= data.maxPrice
    }
    return true
  },
  {
    message: 'Total price exceeds maximum allowed',
  }
)
```

### Adding Custom Actions

```tsx
// In hooks/useMenuBuilder.ts
export function useExportMenu(accountId: string) {
  return useMutation({
    mutationFn: (menuId: string) =>
      menuBuilderService.exportMenu(accountId, menuId),
    onSuccess: () => {
      toast.success('Menu exported successfully')
    },
  })
}
```

## Testing Strategy

### Unit Tests
```tsx
// hooks/useMenuBuilderState.test.ts
describe('useMenuBuilderState', () => {
  it('should add item to correct course based on category', () => {
    const { result } = renderHook(() => useMenuBuilderState({...}))
    act(() => {
      result.current.addItem(mockAppetizer)
    })
    expect(result.current.courses[0].items).toHaveLength(1)
  })
})
```

### Integration Tests
```tsx
// components/MenuBuilderContainer.test.tsx
describe('MenuBuilderContainer', () => {
  it('should fetch and display available items', async () => {
    render(<MenuBuilderContainer accountId="test" />)
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument()
    })
  })
})
```

## Performance Considerations

- **React Query Caching**: Menu items cached for 5 minutes
- **Optimistic Updates**: UI updates before backend confirms
- **Debounced Search**: Prevents excessive filtering
- **Virtual Scrolling**: Consider for large item lists (future)
- **Code Splitting**: Module can be lazy-loaded

## Migration Guide

### From Old MenuBuilder

```tsx
// Before
import { OldMenuBuilder } from './old-menu-builder'

// After
import { MenuBuilderContainer } from '@/components/domains/menus/menu-builder'

<MenuBuilderContainer
  accountId={accountId}
  menuId={menuId}
  onSuccess={handleSuccess}
/>
```

## Troubleshooting

### Items not showing
- Check that backend returns items with correct structure
- Verify `accountId` is valid
- Check React Query DevTools for errors

### Validation errors
- Ensure menu has at least one course with items
- Check fixed price is set when using fixed pricing strategy
- Verify all required fields are present

### State not updating
- Check that hooks are called at component top-level
- Verify mutations are properly awaited
- Check browser console for errors

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `zod` - Runtime validation
- `sonner` - Toast notifications
- `@/lib/api` - Type-safe API client

## Best Practices

1. **Always use MenuBuilderContainer for pages** - Handles loading and error states
2. **Use FastMenuBuilder directly only for custom scenarios** - When you have your own data source
3. **Extend validation schemas before changing component logic** - Validate early
4. **Use React Query DevTools in development** - Debug data fetching issues
5. **Test with real backend early** - Don't rely on mocks too long

## Future Enhancements

- [ ] Drag to reorder within same course
- [ ] Bulk import from CSV
- [ ] Menu templates
- [ ] Seasonal availability rules
- [ ] Multi-language support
- [ ] Version history
- [ ] Approval workflows
- [ ] Menu analytics
