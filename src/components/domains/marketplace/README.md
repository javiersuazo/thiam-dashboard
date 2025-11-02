# Marketplace Domain

A comprehensive online marketplace/store implementation following **DDD (Domain-Driven Design)** and **SOLID principles**, featuring a Lego-style approach to form building with JSON configuration.

## Architecture Overview

This domain implements a complete e-commerce experience inspired by platforms like HEYCater, with enhanced UX and modern architecture patterns.

### Domain Structure

```
marketplace/
├── types/                  # Domain types and interfaces
├── validation/             # Zod schemas for validation
├── components/
│   ├── store/             # Product browsing and filtering
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── StoreFilters.tsx
│   ├── cart/              # Shopping cart functionality
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── ShoppingCart.tsx
│   ├── checkout/          # Checkout flow
│   │   └── CheckoutFlow.tsx
│   └── forms/             # Lego-style form components
│       ├── fields/        # Atomic field components
│       │   ├── TextField.tsx
│       │   ├── SelectField.tsx
│       │   ├── AddressField.tsx
│       │   └── ... (more atomic fields)
│       ├── DynamicField.tsx        # Field factory
│       └── CheckoutFormBuilder.tsx  # JSON-configurable form
├── stores/                # Zustand state management
│   └── useMarketplaceStore.ts
├── hooks/                 # Domain-specific hooks
│   └── useFilteredProducts.ts
└── mocks/                 # Mock data for testing
    ├── products.ts
    └── checkoutConfig.ts
```

## Key Features

### 1. **Product Catalog with Advanced Filtering**
- Real-time search across name, description, caterer, and tags
- Category and tag filtering
- Price range filtering
- Rating filtering
- Availability filtering
- Multiple sort options (price, rating, name, popularity)

### 2. **Shopping Cart**
- Persistent cart state (localStorage via Zustand persist)
- Quantity management with min/max order validation
- Special instructions per item
- Real-time price calculations (subtotal, tax, delivery fee, total)

### 3. **JSON-Configurable Checkout Forms (Lego Approach)**

The checkout form is built using atomic, reusable components that can be assembled via JSON configuration:

#### Atomic Field Components (LEGO Blocks)
- `TextField` - Text input (also handles email, password, tel, url)
- `TextAreaField` - Multi-line text input
- `SelectField` - Dropdown selection
- `RadioField` - Radio button groups
- `CheckboxField` - Single checkbox
- `NumberField` - Numeric input with min/max
- `DateTimeField` - Date and time pickers
- `AddressField` - Composite address field (street, city, postal, country)
- `PhoneField` - Phone number input
- `FieldError` - Error message display
- `FieldHint` - Hint/helper text display

#### Dynamic Form Builder
The `CheckoutFormBuilder` component:
- Renders multi-step forms from JSON configuration
- Conditional field visibility based on other field values
- Per-field validation with Zod schemas
- Progress indicator
- Grid layout support
- Auto-saves progress

#### Example JSON Configuration
```json
{
  "id": "checkout",
  "title": "Complete Your Order",
  "showProgressBar": true,
  "steps": [
    {
      "id": "customer-info",
      "title": "Customer Information",
      "fields": [
        {
          "id": "firstName",
          "type": "text",
          "label": "First Name",
          "required": true,
          "grid": { "cols": 2, "span": 1 }
        },
        {
          "id": "email",
          "type": "email",
          "label": "Email",
          "required": true,
          "hint": "We'll send confirmation here"
        }
      ]
    }
  ]
}
```

### 4. **Conditional Field Rendering**
Fields can be shown/hidden based on other field values:

```typescript
{
  id: 'dietaryDetails',
  type: 'textarea',
  label: 'Dietary Restrictions',
  condition: {
    field: 'hasDietaryRestrictions',
    operator: 'equals',
    value: true
  }
}
```

Supported operators:
- `equals` / `not-equals`
- `contains`
- `greater-than` / `less-than`

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- Each field component has ONE job (e.g., `TextField` only handles text input)
- `FieldError` and `FieldHint` are separate components
- `DynamicField` acts as a factory, delegating to specific field types
- State management separated into `useMarketplaceStore`
- Filtering logic separated into `useFilteredProducts` hook

### Open/Closed Principle (OCP)
- `DynamicField` is open for extension (add new field types) but closed for modification
- Form configuration is external (JSON), no code changes needed for new forms
- New field types can be added without changing existing code

### Liskov Substitution Principle (LSP)
- All field components implement the same interface
- Any field component can be swapped for another without breaking the form

### Interface Segregation Principle (ISP)
- Field components receive only the props they need
- Separate interfaces for each field type
- No component is forced to depend on interfaces it doesn't use

### Dependency Inversion Principle (DIP)
- Components depend on abstractions (TypeScript interfaces), not concrete implementations
- `CheckoutFormBuilder` depends on `CheckoutFormConfig` interface, not specific forms
- `DynamicField` depends on field interfaces, not concrete field components

## DDD Principles Applied

### Bounded Context
The marketplace domain is self-contained with clear boundaries. It doesn't depend on other domains.

### Ubiquitous Language
- `StoreProduct` - A product available in the store
- `CartItem` - A product added to the cart with quantity
- `Cart` - Shopping cart with items and totals
- `Order` - Completed purchase
- `CheckoutFormConfig` - Form definition
- `StoreFilters` - Product filtering criteria

### Aggregates
- `Cart` is the aggregate root containing `CartItem` entities
- `Order` is the aggregate root for completed purchases

### Value Objects
- `AddressValue` - Immutable address representation
- `StoreFilters` - Filtering criteria

### Domain Services
- `useFilteredProducts` - Product filtering logic
- `calculateCartTotals` - Cart calculation logic (in store)

## State Management

Uses **Zustand** with persistence:

```typescript
const { cart, filters, addToCart, setFilters } = useMarketplaceStore()
```

### Store Features
- Cart persistence to localStorage
- Filters state (ephemeral)
- Automatic cart total calculations
- Optimized updates

## Usage Examples

### Basic Store Page
```tsx
import {
  ProductGrid,
  StoreFilters,
  useMarketplaceStore,
  useFilteredProducts
} from '@/components/domains/marketplace'

export default function StorePage() {
  const { filters, addToCart, setFilters, resetFilters } = useMarketplaceStore()
  const products = useFilteredProducts(allProducts, filters)

  return (
    <div className="grid grid-cols-4 gap-6">
      <StoreFilters
        filters={filters}
        availableCategories={categories}
        availableTags={tags}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />
      <ProductGrid
        products={products}
        onAddToCart={addToCart}
      />
    </div>
  )
}
```

### Cart Page
```tsx
import { ShoppingCart, useMarketplaceStore } from '@/components/domains/marketplace'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, updateNotes } = useMarketplaceStore()

  return (
    <ShoppingCart
      cart={cart}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeFromCart}
      onUpdateNotes={updateNotes}
      onCheckout={() => router.push('/checkout')}
    />
  )
}
```

### Checkout Page with JSON Config
```tsx
import { CheckoutFlow } from '@/components/domains/marketplace'
import checkoutConfig from './checkout-config.json'

export default function CheckoutPage() {
  const { cart, clearCart } = useMarketplaceStore()

  const handleComplete = async (formData, cart) => {
    const order = await api.createOrder({ formData, cart })
    clearCart()
    return order
  }

  return (
    <CheckoutFlow
      cart={cart}
      formConfig={checkoutConfig}
      onComplete={handleComplete}
      onCancel={() => router.push('/cart')}
    />
  )
}
```

## Testing

Visit `/marketplace-test` to see the complete flow in action with:
- Mock product data
- Full filtering and sorting
- Shopping cart operations
- Multi-step checkout with JSON-configured forms
- Order confirmation

## Extending the Domain

### Adding a New Field Type

1. Create the field component:
```tsx
// components/forms/fields/MyCustomField.tsx
export function MyCustomField({ id, label, value, onChange, ... }: MyCustomFieldProps) {
  return (
    <div>
      <Label>{label}</Label>
      <MyCustomInput value={value} onChange={onChange} />
    </div>
  )
}
```

2. Export from `fields/index.ts`:
```typescript
export { MyCustomField } from './MyCustomField'
```

3. Add to `DynamicField.tsx`:
```tsx
case 'my-custom':
  return <MyCustomField {...baseProps} />
```

4. Use in JSON config:
```json
{
  "id": "myField",
  "type": "my-custom",
  "label": "My Custom Field"
}
```

### Adding New Filters
Update `StoreFilters` type and `useFilteredProducts` hook logic.

## Tech Stack
- **React 19** - UI library
- **TypeScript** - Type safety
- **Zustand** - State management
- **Zod** - Validation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Best Practices

1. **Always validate user input** - Use Zod schemas
2. **Keep components atomic** - Single responsibility
3. **Use TypeScript interfaces** - Type safety
4. **Follow DDD patterns** - Bounded contexts, ubiquitous language
5. **Persist cart state** - Better UX
6. **Make forms configurable** - JSON configuration for flexibility
7. **Test the complete flow** - Use `/marketplace-test` page
