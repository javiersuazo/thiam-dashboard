# Marketplace Testing Guide

## Overview

This guide provides comprehensive testing instructions for the Airbnb-inspired marketplace implementation with 30 products, collapsible cart, chip-based filters, and density toggles.

## Test Data

**Product Count**: 30 products
- 8 cuisines: Mediterranean (6), Asian (6), Latin American (4), German (3), French (1), British (1), African (1), Caribbean (1), Scandinavian (1), Eastern European (1), Spanish (1)
- Price range: EUR 42.00 - EUR 110.00
- All with ratings, reviews, lead times, and preparation times

## Testing Checklist

### 1. Product Grid Layout ✅

#### Standard Density (4 columns)
- [ ] Desktop (≥1024px): 4 columns visible
- [ ] Tablet (768-1023px): 3 columns visible
- [ ] Small tablet (640-767px): 2 columns visible
- [ ] Mobile (<640px): 1 column visible
- [ ] Max width: 1360px, centered
- [ ] Gutters: 16px between cards

#### Compact Density (5 columns)
- [ ] Click "Compact" button
- [ ] Desktop shows 5 columns
- [ ] Cards are smaller (140-152px image height)
- [ ] All content still readable
- [ ] Click "Standard" button to return

### 2. Product Cards ✅

#### Visual Design
- [ ] Border radius: 16px (rounded-2xl)
- [ ] 1px gray border
- [ ] Image 4:3 ratio
- [ ] Heart button visible in top-right
- [ ] Badges show for "Limited today" (limited stock)
- [ ] "Guest favorite" badge for 4.5+ rating

#### Content Structure
- [ ] Title: 16px, semibold, 1 line truncate
- [ ] Provider name: 14px, underlined on hover
- [ ] Lead time shows (e.g., "Lead 48h")
- [ ] Meta row: ⭐ rating · reviews • 🕒 prep time • Min order
- [ ] Price shows as "EUR XX.XX · per serving"
- [ ] "Add" button (32-36px height) inline with price

#### Interactions
- [ ] Hover card: image scales 105%, shadow lifts
- [ ] Click heart: fills red, toggles favorite
- [ ] Click "Add": quantity popper opens
- [ ] Quantity options: 10, 20, 30, 50, Custom
- [ ] Click card anywhere else: details page (if implemented)

### 3. Mini-Cart Pill ✅

#### Collapsed State
- [ ] Pill visible in top-right (fixed position)
- [ ] Shows shopping bag icon
- [ ] Shows item count badge
- [ ] Shows total amount (e.g., "EUR 152.00")
- [ ] Dark background (gray-900) with white text
- [ ] Click to open drawer

#### First Add Behavior
- [ ] Add first item to cart
- [ ] Cart drawer auto-opens
- [ ] Item appears with flash animation (600ms)
- [ ] Scrolls to new item smoothly
- [ ] Quantity input focuses after flash

### 4. Cart Drawer ✅

#### Opening/Closing
- [ ] Click pill: drawer slides in from right (360-400px)
- [ ] Backdrop dims main content
- [ ] 200ms slide animation with overshoot
- [ ] Click backdrop: drawer closes (if not pinned)
- [ ] Click X button: drawer closes
- [ ] Esc key: drawer closes

#### Pin Functionality
- [ ] Click pin icon: drawer stays open
- [ ] Pin icon fills/highlights when active
- [ ] Scroll page: drawer stays open when pinned
- [ ] Scroll page: drawer auto-closes when unpinned
- [ ] Click pin again: unpins drawer

#### Header
- [ ] Title: "Cart"
- [ ] Pin button (right)
- [ ] Close button (X)

#### Cart Items
- [ ] Each item shows:
  - 80x80px product image
  - Product name (14px, semibold)
  - Caterer name (12px, muted)
  - Quantity controls (-, number, +)
  - Remove button (trash icon)
  - Subtotal (EUR XX.XX)
- [ ] Last added item flashes gray (600ms)
- [ ] Quantity +/- buttons work
- [ ] Can't decrease below minOrder
- [ ] Remove button deletes item

#### Footer
- [ ] Subtotal row
- [ ] Tax (19%) row
- [ ] Delivery fee row
- [ ] Border separator
- [ ] Total (bold, 16px)
- [ ] Checkout button (full width, large)

#### Empty State
- [ ] Empty cart shows shopping bag icon
- [ ] Shows "Your cart is empty" message
- [ ] No footer buttons shown

### 5. Filter Chip Rail ✅

#### Search Field
- [ ] Wide input field (max 448px)
- [ ] Search icon on left
- [ ] Placeholder: "Search products... (Press /)"
- [ ] Press "/" key: focuses search
- [ ] Type query: filters products live
- [ ] X button appears when typing
- [ ] Click X: clears search

#### Filter Chips
- [ ] **Cuisine**: Opens popover with checkboxes
  - Shows all categories (Mediterranean, Asian, etc.)
  - Check/uncheck to filter
  - Badge shows count when active
  - Chip turns dark (gray-900) when active
- [ ] **Price**: Opens popover with min/max inputs
  - Enter min price
  - Enter max price
  - Filters products in range
- [ ] **Rating**: Opens popover with options
  - 4.5+, 4.0+, 3.5+, 3.0+
  - Click to filter
  - Popover closes after selection
- [ ] **Tags**: Opens popover with checkboxes
  - Shows all tags (vegetarian, spicy, etc.)
  - Check/uncheck to filter
  - Badge shows count when active
- [ ] **Available**: Toggle button
  - Click to show only available
  - Turns dark when active

#### Active Filter Chips
- [ ] Applied filters show as chips below rail
- [ ] Each chip has X button to remove
- [ ] Shows filter count: "X active:"
- [ ] "Clear all" button removes all filters
- [ ] Removing filter updates products instantly

#### Click Outside
- [ ] Click outside popover: closes popover
- [ ] Multiple popovers: only one open at a time

### 6. Product Filtering ✅

#### Search
- [ ] Search "pizza": shows Italian products
- [ ] Search "sushi": shows Japanese products
- [ ] Search "healthy": shows tagged products
- [ ] Search "Athens": shows products by caterer name
- [ ] Case insensitive search works

#### Cuisine Filter
- [ ] Select "Mediterranean": shows only Mediterranean products
- [ ] Select multiple: shows products from any selected cuisine
- [ ] Results count updates

#### Price Filter
- [ ] Set min EUR 50: hides products below 50
- [ ] Set max EUR 80: hides products above 80
- [ ] Range EUR 50-80: shows only products in range

#### Rating Filter
- [ ] Select 4.5+: shows only 4.5+ rated products
- [ ] Select 4.0+: includes 4.0+ products

#### Tag Filter
- [ ] Select "vegetarian": shows vegetarian products
- [ ] Select "spicy": shows spicy products
- [ ] Multiple tags: shows products with any tag

#### Available Only
- [ ] Toggle on: hides "limited" and "unavailable" products
- [ ] Toggle off: shows all products

#### Combined Filters
- [ ] Apply search + cuisine: both filters active
- [ ] Apply multiple filters: results match all conditions
- [ ] Clear individual filter: other filters remain active
- [ ] Clear all: resets to full product list

### 7. Empty States ✅

#### No Search Results
- [ ] Search "xyz": shows empty state
- [ ] Shows sad face icon
- [ ] Message: "No results found"
- [ ] Helpful text: "Try adjusting..."
- [ ] "Clear all filters" button
- [ ] "Clear search" button

#### No Filter Results
- [ ] Apply impossible filter combo
- [ ] Shows same empty state
- [ ] Clear buttons work

### 8. Pagination/Scrolling ✅

#### With 30 Products
- [ ] Standard density (4 cols): ~8 rows needed
- [ ] Compact density (5 cols): ~6 rows needed
- [ ] Scroll performance smooth
- [ ] Images load progressively
- [ ] No layout shifts

### 9. Results Header ✅

#### Display
- [ ] Title shows search query if searching
- [ ] Default title: "All Listings"
- [ ] Count: "X listing(s) available"
- [ ] Updates live with filters

#### Density Toggle
- [ ] Two buttons: Standard and Compact
- [ ] Active button has dark background
- [ ] Inactive button is ghost style
- [ ] Click switches instantly
- [ ] Grid reflows smoothly

### 10. Responsive Behavior ✅

#### Desktop (≥1280px)
- [ ] 4-column standard grid
- [ ] 5-column compact grid
- [ ] Cart pill top-right
- [ ] Filter chips in one row
- [ ] All shortcuts visible

#### Tablet (768-1023px)
- [ ] 3-column grid
- [ ] Cart pill still visible
- [ ] Some chip text may hide
- [ ] Drawer covers more of screen

#### Mobile (<640px)
- [ ] 1-column grid
- [ ] Cart pill may move to bottom
- [ ] Filter chips horizontal scroll
- [ ] Drawer full screen
- [ ] Touch-friendly targets

### 11. Performance ✅

#### Load Time
- [ ] Initial page load < 2s
- [ ] Images lazy load
- [ ] Smooth animations (60fps)
- [ ] No janky transitions

#### Interactions
- [ ] Filter changes: instant
- [ ] Search typing: debounced, smooth
- [ ] Cart updates: immediate
- [ ] Drawer slide: smooth

#### Memory
- [ ] No memory leaks on repeated adds/removes
- [ ] Browser doesn't slow down

### 12. Accessibility ✅

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] "/" focuses search
- [ ] Esc closes popovers and drawer
- [ ] Enter submits search
- [ ] Arrow keys work in dropdowns

#### Screen Readers
- [ ] Product cards have proper labels
- [ ] Cart updates announce changes
- [ ] Filter changes announce results
- [ ] Buttons have descriptive labels

#### Focus Management
- [ ] Visible focus rings
- [ ] Focus trapped in open drawer
- [ ] Focus restored after closing

### 13. Edge Cases ✅

#### Cart
- [ ] Add product, then delete: cart empty
- [ ] Add to max quantity: + button disabled
- [ ] Decrease to min: - button disabled
- [ ] Remove last item: cart shows empty state
- [ ] Add 30 products: drawer scrolls

#### Filters
- [ ] Apply all filters: 0 results possible
- [ ] Clear filters with items in cart: cart persists
- [ ] Change filters rapidly: no race conditions

#### Search
- [ ] Type very long query: input handles it
- [ ] Special characters: doesn't break
- [ ] Empty query: shows all products

## Test Scenarios

### Scenario 1: Browse and Purchase
1. Load page
2. See 30 products in 4-column grid
3. Click "Compact" → see 5 columns
4. Scroll down → see all products
5. Click "Mediterranean" filter → see 6 products
6. Click heart on Greek Mezze → marked favorite
7. Click "Add" on Greek Mezze → quantity popper opens
8. Select "20 servings" → cart drawer opens
9. Item appears with flash
10. Quantity focuses (pre-selected)
11. Click +/-: adjust quantity
12. Continue shopping (cart stays open if pinned)
13. Add 2 more items
14. Check subtotal, tax, delivery, total
15. Click "Checkout" → success

### Scenario 2: Search and Filter
1. Type "spicy" in search → 8 products
2. Select "Asian" cuisine → 5 products (Asian + spicy)
3. Set price EUR 60-80 → 3 products
4. Select 4.5+ rating → 2 products
5. Clear all filters → back to 30

### Scenario 3: Cart Management
1. Add 5 products
2. Pin drawer open
3. Scroll page → drawer stays
4. Adjust quantities
5. Remove 2 items
6. Total updates correctly
7. Unpin drawer
8. Scroll → drawer closes
9. Click pill → reopen

## Known Limitations

1. **No actual pagination**: All 30 products load at once (good for 30, might need pagination at 100+)
2. **No product detail page**: Cards clickable but no details view yet
3. **No persistent favorites**: Heart toggles but doesn't save
4. **No checkout flow**: Checkout button shows alert
5. **Auto-collapse scroll**: Drawer closes on scroll unless pinned (by design)

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Performance Benchmarks

### Target Metrics
- **First Contentful Paint**: <1s
- **Time to Interactive**: <2s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### Load Testing
With 30 products:
- [ ] Grid renders in <500ms
- [ ] All images load in <3s
- [ ] Smooth scroll at 60fps
- [ ] Cart operations <50ms

## Regression Testing

After changes, verify:
1. Grid layout still responsive
2. Cart drawer still opens/closes
3. Filters still work
4. Search still instant
5. Density toggle still works
6. No console errors
7. No visual regressions

## Success Criteria

✅ All 30 products display correctly
✅ Grid responsive (1/2/3/4/5 columns)
✅ Cart drawer works (open/close/pin)
✅ Filters work (search, cuisine, price, rating, tags, available)
✅ Density toggle works (standard/compact)
✅ Product cards match Airbnb style
✅ Mini-cart pill shows correct count/total
✅ Empty states friendly
✅ Keyboard shortcuts work
✅ No errors in console
✅ Smooth 60fps animations
✅ Mobile responsive

## Access

**URL**: `http://localhost:3003/en/marketplace-enhanced`

**No authentication required** - Public access

## Reporting Issues

When reporting issues, include:
1. Browser + version
2. Screen size
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots/video if visual
6. Console errors if any

## Summary

With 30 products, you can now thoroughly test:
- Pagination needs (scrolling through multiple rows)
- Filter combinations (many options available)
- Cart with multiple items (realistic cart state)
- Search relevance (more products to match)
- Performance with realistic data size

The marketplace is production-ready for up to ~50 products without pagination. Beyond that, consider implementing infinite scroll or pagination.
