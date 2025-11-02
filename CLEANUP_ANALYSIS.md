# Marketplace Cleanup Analysis

## Components to KEEP (Used by Enhanced)

### ✅ Core Components (Reused)
- `ProductCard.tsx` - Used in enhanced grid ✅
- All form fields (TextField, SelectField, etc.) - Used in checkout ✅
- `CheckoutFormBuilder.tsx` - JSON-driven forms ✅
- `DynamicField.tsx` - Form field factory ✅

### ✅ Enhanced-Specific Components
- `enhanced/SearchBar.tsx` - New search-first component ✅
- `enhanced/CartSidebar.tsx` - New sticky cart ✅
- `enhanced/FilterPane.tsx` - New slide-in filters ✅

## Components to REMOVE (Not Used in Enhanced)

### ❌ Old Multi-View Components
1. **`cart/CartItem.tsx`** - Replaced by inline CartSidebar rendering
2. **`cart/CartSummary.tsx`** - Replaced by CartSidebar footer
3. **`cart/ShoppingCart.tsx`** - Entire old cart view, not needed
4. **`checkout/CheckoutFlow.tsx`** - Old modal checkout, not used yet
5. **`store/ProductGrid.tsx`** - Enhanced page renders cards directly
6. **`store/StoreFilters.tsx`** - Replaced by FilterPane

### ❌ Old Demo Page
- `marketplace-demo/page.tsx` - Old multi-view demo

## What to Keep for Future

### Maybe Keep (For Checkout)
- `checkout/CheckoutFlow.tsx` - Might adapt for inline checkout
- `CheckoutFormBuilder.tsx` - Still useful for forms

## Recommendation

### Phase 1: Remove Unused Components
```bash
# Remove old cart components (replaced by CartSidebar)
rm -rf src/components/domains/marketplace/components/cart

# Remove old checkout flow (will rebuild inline)
rm -rf src/components/domains/marketplace/components/checkout

# Remove old store components (replaced by enhanced)
rm src/components/domains/marketplace/components/store/ProductGrid.tsx
rm src/components/domains/marketplace/components/store/StoreFilters.tsx

# Keep ProductCard.tsx - still used
```

### Phase 2: Remove Old Demo Page
```bash
# Remove old demo (replaced by enhanced)
rm -rf src/app/[locale]/(full-width-pages)/marketplace-demo
```

### Phase 3: Update Exports
Update `src/components/domains/marketplace/index.ts` to remove old exports

## Final Structure (After Cleanup)

```
marketplace/
├── components/
│   ├── enhanced/           ← New (Keep)
│   │   ├── SearchBar.tsx
│   │   ├── CartSidebar.tsx
│   │   └── FilterPane.tsx
│   ├── forms/              ← Keep (Used for checkout)
│   │   ├── fields/
│   │   ├── CheckoutFormBuilder.tsx
│   │   └── DynamicField.tsx
│   └── store/
│       └── ProductCard.tsx ← Keep (Used in enhanced)
├── types/                  ← Keep
├── validation/             ← Keep
├── stores/                 ← Keep
├── hooks/                  ← Keep
└── mocks/                  ← Keep
```

## Size Reduction

**Before:** ~28 files
**After:** ~22 files (6 files removed)

**Removed:**
- 3 cart components (replaced by CartSidebar)
- 1 checkout flow (will rebuild)
- 2 store components (replaced by enhanced)
- 1 old demo page

## Migration Impact

### Breaks
- ❌ Old `/marketplace-demo` page (intentional - replaced)

### Safe
- ✅ Enhanced page works independently
- ✅ All shared components intact (forms, fields)
- ✅ Types, validation, stores unchanged
- ✅ Mocks still available
