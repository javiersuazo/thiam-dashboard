# Marketplace Domain - Quick Start Guide

## 🚀 Getting Started

Visit the public demo page to see everything in action:

```
http://localhost:3003/en/marketplace-demo
```

**Note:** This page is publicly accessible (no authentication required).

## 📋 What You'll See

### 1. Product Browsing
- **Left Sidebar**: Filters (search, categories, tags, price, rating)
- **Main Area**: Product grid with cards
- **Each Product Card**:
  - Product image
  - Name, caterer, rating
  - Price and availability
  - "Add to Cart" button

### 2. Shopping Cart
- Click the **Cart** button in header
- See all added items
- Adjust quantities with +/- buttons
- Add special instructions per item
- View real-time price calculation
- Click **Proceed to Checkout**

### 3. Checkout Flow (JSON-Configured Form)
The form is built from JSON configuration with 4 steps:

**Step 1: Customer Information**
- First Name, Last Name
- Email, Phone
- Company (optional)

**Step 2: Delivery Information**
- Full address (composite field)
- Delivery date & time
- Special instructions

**Step 3: Event Details** (Optional)
- Event type
- Guest count
- Dietary restrictions (conditional field)

**Step 4: Payment**
- Payment method (radio buttons)
- Purchase order (conditional on invoice payment)
- Terms checkbox

### 4. Order Confirmation
- Order number
- Summary
- Print receipt option

## 🏗️ Architecture Highlights

### Component Structure

```
/marketplace
  /types              → TypeScript interfaces
  /validation         → Zod schemas
  /components
    /store           → Product browsing
    /cart            → Shopping cart
    /checkout        → Checkout flow
    /forms
      /fields        → Atomic field components (LEGO blocks)
      DynamicField   → Field factory
      CheckoutFormBuilder → Form orchestrator
  /stores            → Zustand state management
  /hooks             → Domain-specific hooks
  /mocks             → Test data
```

### Key Files

| File | Purpose |
|------|---------|
| `types/index.ts` | All TypeScript types |
| `stores/useMarketplaceStore.ts` | Global state (cart, filters) |
| `components/forms/CheckoutFormBuilder.tsx` | JSON-configurable form engine |
| `components/forms/fields/*` | Atomic field components |
| `mocks/checkoutConfig.ts` | Example JSON form configuration |
| `app/[locale]/(admin)/marketplace-test/page.tsx` | Test page |

## 🎯 Key Concepts

### 1. Lego-Style Forms

Forms are built from atomic components like LEGO blocks:

```typescript
// Atomic components (LEGO blocks)
<TextField />
<SelectField />
<CheckboxField />
<AddressField />  // Composite: multiple inputs

// Assembled via JSON
{
  "fields": [
    { "type": "text", "id": "firstName", ... },
    { "type": "email", "id": "email", ... },
    { "type": "address", "id": "deliveryAddress", ... }
  ]
}

// Result: Complete form
<CheckoutFormBuilder config={jsonConfig} />
```

### 2. Conditional Fields

Fields can show/hide based on other fields:

```typescript
{
  id: "dietaryDetails",
  type: "textarea",
  label: "Dietary Details",
  condition: {
    field: "dietaryRestrictions",  // When this field...
    operator: "equals",             // ...equals...
    value: true                     // ...true, show this field
  }
}
```

### 3. State Management (Zustand)

```typescript
// Get state and actions
const {
  cart,              // Current cart state
  filters,           // Current filters
  addToCart,         // Add product to cart
  updateQuantity,    // Update item quantity
  setFilters,        // Update filters
  clearCart          // Clear cart
} = useMarketplaceStore()

// Cart persists to localStorage automatically
```

### 4. Product Filtering

```typescript
// Hook handles all filtering logic
const filteredProducts = useFilteredProducts(allProducts, filters)

// Supports:
// - Text search (name, description, caterer, tags)
// - Category filter
// - Tag filter
// - Price range
// - Rating threshold
// - Availability status
// - Sorting (price, rating, name, popularity)
```

## 🔧 Common Tasks

### Adding a New Field Type

1. **Create the component:**
```tsx
// components/forms/fields/ColorField.tsx
export function ColorField({ id, label, value, onChange }: ColorFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        type="color"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
```

2. **Export it:**
```tsx
// components/forms/fields/index.ts
export { ColorField } from './ColorField'
```

3. **Add to factory:**
```tsx
// components/forms/DynamicField.tsx
case 'color':
  return <ColorField {...baseProps} />
```

4. **Use in JSON:**
```json
{
  "id": "brandColor",
  "type": "color",
  "label": "Brand Color"
}
```

### Customizing the Checkout Form

Edit `mocks/checkoutConfig.ts`:

```typescript
export const mockCheckoutConfig: CheckoutFormConfig = {
  id: 'checkout',
  title: 'My Custom Checkout',
  showProgressBar: true,
  steps: [
    {
      id: 'step-1',
      title: 'Step 1',
      fields: [
        {
          id: 'myField',
          type: 'text',
          label: 'My Field',
          required: true,
          hint: 'This is a hint',
          validation: z.string().min(3)
        }
      ]
    }
  ]
}
```

### Adding Product Mock Data

Edit `mocks/products.ts`:

```typescript
export const mockProducts: StoreProduct[] = [
  {
    id: '99',
    name: 'New Product',
    description: 'Description',
    price: 49.99,
    currency: 'EUR',
    category: 'Category',
    tags: ['tag1', 'tag2'],
    availability: 'available',
    catererId: 'cat-1',
    catererName: 'Caterer Name',
    rating: 4.5,
    reviewCount: 42
  },
  // ... existing products
]
```

## 🎨 Customizing Styles

All components use Tailwind CSS and shadcn/ui. To customize:

1. **Tailwind Config:** Edit `tailwind.config.js`
2. **Component Styles:** Directly in component files
3. **Global Styles:** Edit `app/globals.css`

Example:
```tsx
// Change button color in ProductCard
<Button className="bg-purple-600 hover:bg-purple-700">
  Add to Cart
</Button>
```

## 📊 Testing the Flow

### Complete User Journey

1. **Start:** Visit `/marketplace-test`
2. **Browse:** Use filters to find products
3. **Add:** Click "Add to Cart" on products
4. **Review:** Click "Cart" in header
5. **Adjust:** Change quantities or add notes
6. **Checkout:** Click "Proceed to Checkout"
7. **Fill Form:** Complete all 4 steps
8. **Confirm:** See order confirmation

### Test Different Scenarios

- **Filtering:** Try search, categories, price range
- **Sorting:** Change sort order (price, rating, name)
- **Cart:** Add, remove, update quantities
- **Conditional Fields:** Check dietary restrictions checkbox (step 3)
- **Payment Methods:** Try different payment options (step 4)
- **Validation:** Leave required fields empty, see errors

## 🐛 Troubleshooting

### Page Not Loading
```bash
# Check server is running
npm run dev

# Visit: http://localhost:3003/en/marketplace-test
```

### State Not Persisting
- Cart uses localStorage
- Clear browser cache if issues
- Check browser console for errors

### Form Validation Not Working
- Check Zod schemas in `validation/index.ts`
- Check field `required` property
- Check custom validation in field config

### Filters Not Working
- Check `useFilteredProducts` hook
- Verify filter state in React DevTools
- Check console for errors

## 📚 Learn More

- **README.md** - Detailed documentation
- **ARCHITECTURE.md** - In-depth architecture explanation
- **types/index.ts** - All type definitions
- **mocks/checkoutConfig.ts** - Example form configuration

## 🎓 Educational Value

This domain demonstrates:

1. **DDD** - Bounded contexts, aggregates, value objects
2. **SOLID** - All 5 principles in action
3. **Lego Pattern** - Composable atomic components
4. **State Management** - Zustand with persistence
5. **Form Handling** - JSON-driven dynamic forms
6. **TypeScript** - Comprehensive type safety
7. **React Best Practices** - Hooks, memoization, composition
8. **Modern UI** - Tailwind CSS, shadcn/ui components

## 🚦 Next Steps

1. **Explore the code** - Read through component files
2. **Modify the form** - Edit `checkoutConfig.ts`
3. **Add a field type** - Follow the guide above
4. **Customize styles** - Change colors, layouts
5. **Add features** - Implement wishlist, product reviews, etc.

## 📞 Need Help?

Check these files for examples:
- Product display: `components/store/ProductCard.tsx`
- Cart logic: `stores/useMarketplaceStore.ts`
- Form building: `components/forms/CheckoutFormBuilder.tsx`
- Field creation: `components/forms/fields/TextField.tsx`

Happy coding! 🎉
