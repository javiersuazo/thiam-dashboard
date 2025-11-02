# Marketplace Domain - Architecture Documentation

## Executive Summary

This marketplace domain demonstrates enterprise-grade architecture following **Domain-Driven Design (DDD)** and **SOLID principles**, featuring a innovative **Lego-style approach** to form building with JSON configuration.

## Design Philosophy

### 1. Lego-Style Component Architecture

Like LEGO blocks that can be assembled into complex structures, our form system uses atomic, reusable components that can be composed via JSON configuration.

**Analogy:**
- **Individual LEGO blocks** = Atomic field components (TextField, SelectField, etc.)
- **Building instructions** = JSON configuration
- **Final model** = Complete checkout form

```
[TextField] + [SelectField] + [AddressField] = Custom Checkout Form
     ↓              ↓                ↓
  Atomic        Atomic           Composite
  Block         Block            Block
```

### 2. DDD Implementation

#### Bounded Context
```
┌─────────────────────────────────────────┐
│         Marketplace Domain              │
│  ┌──────────────────────────────────┐  │
│  │  Product Catalog (Subdomain)     │  │
│  │  - Products, Filters, Search     │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Shopping Cart (Subdomain)       │  │
│  │  - Cart, CartItems, Totals       │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Checkout (Subdomain)            │  │
│  │  - Forms, Validation, Orders     │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

#### Aggregates & Entities
```
Cart (Aggregate Root)
├── items: CartItem[] (Entity)
│   ├── product: StoreProduct (Entity Reference)
│   ├── quantity: number
│   └── notes: string
├── subtotal: number (Calculated)
├── tax: number (Calculated)
├── deliveryFee: number (Calculated)
└── total: number (Calculated)
```

#### Value Objects
- `AddressValue` - Immutable address representation
- `StoreFilters` - Filtering criteria
- Price calculations (subtotal, tax, total)

### 3. SOLID Principles in Action

#### Single Responsibility Principle (SRP)

Each component has ONE clear responsibility:

```typescript
// ✅ GOOD - Single responsibility
export function TextField({ id, label, value, onChange }: TextFieldProps) {
  // Only handles text input
}

export function FieldError({ error }: FieldErrorProps) {
  // Only displays errors
}

// ❌ BAD - Multiple responsibilities
export function TextFieldWithError() {
  // Handles input AND error display
}
```

#### Open/Closed Principle (OCP)

System is open for extension but closed for modification:

```typescript
// DynamicField acts as a factory - adding new field types doesn't require
// modifying existing code, just adding new cases

// ✅ Adding a new field type:
// 1. Create NewField component
// 2. Add case to DynamicField
// 3. No existing code changes needed

case 'new-field-type':
  return <NewField {...baseProps} />
```

#### Liskov Substitution Principle (LSP)

All field components are substitutable:

```typescript
// All fields implement the same base interface
interface BaseFieldProps {
  id: string
  label: string
  value: any
  onChange: (value: any) => void
  error?: string
}

// Any field can replace another without breaking the form
<DynamicField config={fieldConfig} /> // Works with ANY field type
```

#### Interface Segregation Principle (ISP)

Components only depend on what they need:

```typescript
// ✅ GOOD - Specific interfaces
interface TextFieldProps {
  id: string
  label: string
  value: string          // Only what TextField needs
  onChange: (value: string) => void
  placeholder?: string
}

// ❌ BAD - Bloated interface
interface FieldProps {
  id: string
  label: string
  value: any
  onChange: any
  options?: Array<any>    // TextField doesn't need this
  min?: number           // TextField doesn't need this
  max?: number           // TextField doesn't need this
}
```

#### Dependency Inversion Principle (DIP)

Depend on abstractions, not concrete implementations:

```typescript
// ✅ GOOD - Depends on interface
interface IFormBuilder {
  renderField(config: FieldConfig): ReactNode
}

function CheckoutForm({ builder }: { builder: IFormBuilder }) {
  return builder.renderField(config)
}

// ❌ BAD - Depends on concrete implementation
function CheckoutForm({ textField, selectField }: {
  textField: TextField
  selectField: SelectField
}) {
  // Tightly coupled to specific components
}
```

## Component Hierarchy

```
Page (marketplace-test)
├── ProductGrid (Presentation)
│   └── ProductCard (Presentation)
│       └── Button, Badge (UI Primitives)
├── StoreFilters (Presentation)
│   └── Input, Select, Checkbox (UI Primitives)
├── ShoppingCart (Presentation)
│   ├── CartItem (Presentation)
│   └── CartSummary (Presentation)
└── CheckoutFlow (Orchestrator)
    ├── CheckoutFormBuilder (Orchestrator)
    │   └── DynamicField (Factory)
    │       ├── TextField (Atomic Component)
    │       ├── SelectField (Atomic Component)
    │       ├── AddressField (Composite Component)
    │       │   ├── Input (UI Primitive)
    │       │   └── Textarea (UI Primitive)
    │       └── ... (Other Fields)
    └── CartSummary (Presentation)
```

### Component Classification

1. **Atomic Components** (LEGO Blocks)
   - Single, indivisible UI elements
   - Examples: TextField, CheckboxField, SelectField
   - No business logic, pure presentation

2. **Composite Components** (LEGO Assemblies)
   - Composed of multiple atomic components
   - Examples: AddressField (street + city + postal + country)
   - Manages internal state and coordination

3. **Orchestrator Components**
   - Coordinate multiple components
   - Examples: CheckoutFormBuilder, CheckoutFlow
   - Handle business logic and state management

4. **Presentation Components**
   - Display data and trigger events
   - Examples: ProductCard, CartItem
   - No state management

## Data Flow

### Store → Cart → Checkout

```
┌──────────────┐
│   Store      │
│  (Browse)    │
└──────┬───────┘
       │ addToCart()
       ↓
┌──────────────┐     useMarketplaceStore
│  Cart Store  │◄───────────────────────
│  (Zustand)   │
└──────┬───────┘
       │ checkout()
       ↓
┌──────────────┐
│  Checkout    │
│  (Forms)     │
└──────┬───────┘
       │ onComplete()
       ↓
┌──────────────┐
│    Order     │
│ (Confirmed)  │
└──────────────┘
```

### Form Configuration Flow

```
JSON Config
    ↓
CheckoutFormBuilder (Reads config)
    ↓
Maps steps → fields
    ↓
DynamicField (Factory pattern)
    ↓
Switch on field.type
    ↓
Renders appropriate atomic component
    ↓
User interaction
    ↓
onChange callback
    ↓
Update form state
    ↓
Validation (Zod)
    ↓
Submit / Next step
```

## State Management Architecture

### Zustand Store Structure

```typescript
MarketplaceStore
├── State
│   ├── cart: Cart
│   └── filters: StoreFilters
└── Actions
    ├── Cart Management
    │   ├── addToCart()
    │   ├── removeFromCart()
    │   ├── updateQuantity()
    │   ├── updateNotes()
    │   └── clearCart()
    └── Filter Management
        ├── setFilters()
        └── resetFilters()
```

### Why Zustand?

1. **Simple API** - Less boilerplate than Redux
2. **TypeScript Support** - Excellent type inference
3. **Persistence** - Built-in localStorage support
4. **Performance** - Selective subscriptions
5. **No Context** - No provider hell

## Validation Strategy

### Multi-Level Validation

```
1. Type-Level (TypeScript)
   ↓
2. Schema-Level (Zod)
   ↓
3. Business-Logic-Level (Custom validators)
   ↓
4. Server-Side (API validation)
```

### Example Validation Pipeline

```typescript
// 1. TypeScript enforces type
const email: string = formData.email

// 2. Zod validates format
const emailSchema = z.string().email()
emailSchema.parse(email)

// 3. Custom business logic
if (await isEmailBlacklisted(email)) {
  throw new Error('Email not allowed')
}

// 4. Server validates and creates order
const order = await api.createOrder(...)
```

## Form Configuration Schema

### Field Configuration Interface

```typescript
interface CheckoutFormFieldConfig {
  id: string                    // Unique identifier
  type: FieldType              // Field type (text, email, etc.)
  label: string                // Display label
  placeholder?: string         // Placeholder text
  required?: boolean           // Is field required?
  validation?: z.ZodType       // Zod validation schema
  options?: Option[]           // For select/radio fields
  defaultValue?: any           // Default value
  hint?: string                // Helper text
  condition?: Condition        // Conditional rendering
  grid?: GridConfig           // Layout configuration
}
```

### Conditional Rendering

Supports dynamic form behavior:

```typescript
{
  id: 'dietaryDetails',
  type: 'textarea',
  condition: {
    field: 'hasDietaryRestrictions',  // Watch this field
    operator: 'equals',                // Comparison operator
    value: true                        // Show when true
  }
}
```

## Performance Optimizations

### 1. Memoization
```typescript
// useFilteredProducts uses useMemo to avoid unnecessary recalculations
const filtered = useMemo(() => {
  return applyFilters(products, filters)
}, [products, filters])
```

### 2. Selective Re-renders
```typescript
// Zustand allows selective subscriptions
const cartItems = useMarketplaceStore(state => state.cart.items)
// Only re-renders when cart.items changes, not on filter changes
```

### 3. Lazy Loading
```typescript
// Components can be code-split
const CheckoutFlow = lazy(() => import('./components/checkout/CheckoutFlow'))
```

### 4. Persistent State
```typescript
// Cart persists to localStorage, avoiding data loss
persist(
  (set, get) => ({ ... }),
  { name: 'marketplace-storage' }
)
```

## Testing Strategy

### Unit Tests
- Test atomic components in isolation
- Test validation schemas
- Test state management logic

### Integration Tests
- Test component interactions
- Test form submission flows
- Test cart calculations

### E2E Tests
- Test complete user journeys
- Test checkout flow end-to-end
- Test error scenarios

## Extensibility Points

### 1. Adding New Field Types

```typescript
// Step 1: Create component
export function ColorPickerField(props: ColorPickerFieldProps) {
  return <input type="color" {...props} />
}

// Step 2: Add to DynamicField
case 'color':
  return <ColorPickerField {...baseProps} />

// Step 3: Use in config
{
  "id": "brandColor",
  "type": "color",
  "label": "Brand Color"
}
```

### 2. Adding Custom Validation

```typescript
const customSchema = z.string().refine(
  (val) => myCustomValidation(val),
  { message: 'Custom validation failed' }
)

{
  id: 'field',
  type: 'text',
  validation: customSchema
}
```

### 3. Adding New Cart Features

```typescript
// Extend the store
interface MarketplaceActions {
  // ... existing actions
  applyDiscount: (code: string) => void  // New action
}
```

## Best Practices Checklist

- [x] Single Responsibility - Each component has one job
- [x] Open/Closed - Extensible without modification
- [x] Liskov Substitution - Components are interchangeable
- [x] Interface Segregation - Minimal, focused interfaces
- [x] Dependency Inversion - Depend on abstractions
- [x] DDD Bounded Context - Clear domain boundaries
- [x] Ubiquitous Language - Consistent terminology
- [x] Immutability - State updates create new objects
- [x] Type Safety - Comprehensive TypeScript coverage
- [x] Validation - Multi-level validation strategy
- [x] Error Handling - User-friendly error messages
- [x] Accessibility - ARIA labels and semantic HTML
- [x] Performance - Memoization and optimization
- [x] Persistence - Cart state saved to localStorage
- [x] Testing - Comprehensive test coverage

## Conclusion

This marketplace domain exemplifies modern React architecture:

1. **Modular** - Components are independent and reusable
2. **Maintainable** - Clear separation of concerns
3. **Scalable** - Easy to extend with new features
4. **Testable** - Components can be tested in isolation
5. **Type-Safe** - Comprehensive TypeScript coverage
6. **User-Friendly** - Intuitive UX with helpful feedback
7. **Configurable** - Forms defined via JSON
8. **Performant** - Optimized rendering and state updates

The Lego-style approach to forms, combined with DDD and SOLID principles, creates a robust, flexible system that can adapt to changing requirements while maintaining code quality.
