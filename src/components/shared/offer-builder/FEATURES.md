# Offer Builder - Complete Feature List

## ✅ Core Features (Implemented)

### Block Management
- Create, Read, Update, Delete blocks
- Block metadata: date, deliveryTime, headcount, location, notes
- Block navigation with keyboard shortcuts (Alt+1, Alt+2, etc.)
- Block ordering

### Item Management
- Search catalog items
- Add items to blocks
- Update quantity inline
- Update price inline
- Delete items
- Drag & drop reordering
- Item grouping by type (food, equipment, service, delivery)

### Pricing & Calculations
- Line item totals
- Block subtotals
- Tax calculations (configurable per plugin)
- Offer grand total
- Real-time calculation updates

### UI/UX
- Beautiful animated interface
- Touch gestures support
- Price change animations (up/down indicators)
- Preview/Edit mode toggle
- Keyboard shortcuts
- Responsive design
- Dark mode support

### Plugin System
- Domain-agnostic core
- Pluggable domain logic
- Smart quantity suggestions
- Custom formatters
- Custom pricing strategies
- Repository pattern for data access

## ⚠️ Features Needing Integration

### Adjustments & Comments (CRITICAL)
**Status:** ✅ IMPLEMENTED
- Comment threads on blocks and items
- Photo attachments to comments
- Adjustment types: quantity change, item addition/removal, time changes, etc.
- Adjustment status: pending, approved, rejected, applied
- Price impact tracking for adjustments

**Completed:**
1. ✅ Added `OfferAdjustment` to extended types
2. ✅ Added `IAdjustmentRepository` interface
3. ✅ Updated adapter to load and pass adjustments
4. ✅ Exposed in public API

### Discounts
**Status:** ✅ TYPE SUPPORT ADDED
- Item-level discounts
- Block-level discounts
- Offer-level discounts
- Discount types: percentage, fixed amount
- Discount codes

**Completed:**
1. ✅ Added `Discount` to extended types
2. ✅ Added discount fields to `ExtendedOfferItem`, `ExtendedOfferBlock`, `ExtendedOffer`
3. ✅ Exposed in public API

**Still Needed:**
- Update pricing calculations in plugin
- Update UI to show/edit discounts

### Attachments
**Status:** ✅ TYPE SUPPORT & REPOSITORY ADDED
- Offer-level documents (PDFs, contracts, floor plans)
- Block-level attachments
- Item-level attachments
- Photo uploads
- File management

**Completed:**
1. ✅ Added `OfferAttachment` to extended types
2. ✅ Added `IAttachmentRepository` interface
3. ✅ Exposed in public API

**Still Needed:**
- Implement mock attachment repository
- Add file upload handling in UI

### Advanced Block Fields
**Status:** ✅ TYPE SUPPORT ADDED
**Fields Added:**
- startTime, endTime (for event blocks)
- pickupTime (for pickup orders)
- dietaryRequirements (structured data)
- specialInstructions (for caterer)
- discount (block-level)

**Completed:**
1. ✅ Extended `ExtendedOfferBlock` with all fields
2. ✅ Exposed in public API

**Still Needed:**
- Update block forms in UI
- Update block display

### Advanced Item Fields
**Status:** ✅ TYPE SUPPORT ADDED
**Fields Added:**
- customizations (structured modifications)
- specialInstructions (per item)
- discount (item-level)
- Links to source entities (menuId, menuItemId, equipmentId, serviceItemId)

**Completed:**
1. ✅ Extended `ExtendedOfferItem` with all fields
2. ✅ Exposed in public API

**Still Needed:**
- Update item forms in UI
- Update item display

### Version History
**Status:** ✅ TYPE SUPPORT ADDED
- Track all changes to offers
- Version snapshots
- Change logs
- Diff visualization
- Revert to previous version

**Completed:**
1. ✅ Added `OfferVersion` types to extended types
2. ✅ Exposed in public API

**Still Needed:**
- Add version repository interface
- Implement version tracking logic
- Add version UI

### Request Integration
**Status:** Partially implemented (passed as prop)
- Display request details in sidebar
- Link offer to originating request
- Show request requirements
- Budget constraints

**Required Changes:**
- Better request type definition
- Request repository interface

## 📊 Priority Roadmap

### Phase 1: Critical (COMPLETED ✅)
1. ✅ Adjustments support - users need this for collaboration
2. ✅ Better adapter abstraction - field name changes shouldn't break everything
3. ✅ Complete public API - clean exports
4. ✅ Extended types for all features
5. ✅ Repository interfaces for adjustments & attachments

### Phase 2: Important (Next)
1. ⚠️ Discounts - implement pricing calculations (types done)
2. ⚠️ Advanced block/item fields - update UI forms (types done)
3. Mock attachment repository - for testing
4. API repository examples - production readiness

### Phase 3: Nice to Have
1. Version history - audit trail
2. Undo/redo - better UX
3. Templates - faster offer creation
4. Bulk operations - efficiency

## 🎯 API Abstraction Goals

The offer-builder package should:
1. ✅ Export single entry point (`index.ts`)
2. ✅ Hide internal implementation details
3. ✅ Provide clear contracts (interfaces)
4. ✅ Allow field mapping/transformation
5. ✅ Support all FastOfferBuilder features (types added)
6. ✅ Be backend-agnostic (work with any API structure)

### Field Mapping Strategy
If API field names change, only the adapter/mapper changes:
```typescript
// API changes "deliveryTime" to "scheduledDeliveryTime"
// Only change the mapper, not the component:

function mapApiBlockToOfferBlock(apiBlock: ApiBlock): OfferBlock {
  return {
    ...apiBlock,
    deliveryTime: apiBlock.scheduledDeliveryTime, // Map here
  }
}
```

Component code never changes!
