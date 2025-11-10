# Marketplace Pagination Implementation

## Overview

Added clean, functional pagination to the Airbnb-inspired marketplace to handle the 30 products efficiently and provide a better browsing experience.

## Features Implemented

### 1. Page Size Selector ✅
- **Options**: 12, 24, or 48 items per page
- **Default**: 12 items per page
- **Location**: Bottom left of product grid
- **Behavior**: Resets to page 1 when changing page size

### 2. Page Navigation ✅
- **Previous/Next buttons**: With disabled states
- **Page numbers**: Smart ellipsis for many pages
- **Current page**: Highlighted (dark background)
- **Navigation pattern**:
  - 1-7 pages: All numbers shown
  - 8+ pages: 1 ... 4 5 6 ... 10 (smart ellipsis)

### 3. Pagination Info ✅
- **Display**: "Showing X-Y of Z"
- **Example**: "Showing 1-12 of 30"
- **Updates live**: As filters/search change

### 4. Smart Page Reset ✅
- Resets to page 1 when:
  - Search query changes
  - Filters applied/removed
  - Page size changes
- Preserves page when:
  - Adding to cart
  - Opening/closing drawers
  - Toggling density

### 5. Scroll to Top ✅
- Smooth scroll to top on page change
- Ensures users see new results
- `window.scrollTo({ top: 0, behavior: 'smooth' })`

## Component Structure

### Pagination Component
**File**: `src/components/shared/ui/pagination.tsx`

```typescript
interface PaginationProps {
  currentPage: number          // Current active page
  totalPages: number           // Total number of pages
  onPageChange: (page: number) => void
  pageSize: number             // Items per page
  onPageSizeChange: (size: number) => void
  totalItems: number           // Total items across all pages
  pageSizeOptions?: number[]   // [12, 24, 48]
}
```

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Show [12▼] per page • Showing 1-12 of 30    [<] 1 2 3 [>]  │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

**State Management**:
```typescript
const [currentPage, setCurrentPage] = useState(1)
const [pageSize, setPageSize] = useState(12)
```

**Pagination Logic**:
```typescript
const totalProducts = searchFilteredProducts.length
const totalPages = Math.ceil(totalProducts / pageSize)
const startIndex = (currentPage - 1) * pageSize
const endIndex = startIndex + pageSize
const paginatedProducts = searchFilteredProducts.slice(startIndex, endIndex)
```

**Auto-reset Effect**:
```typescript
useEffect(() => {
  setCurrentPage(1)
}, [searchQuery, filters])
```

## User Flows

### Flow 1: Browse All Products
1. Load page → See 12 products (page 1)
2. Click "2" → See products 13-24
3. Click "3" → See products 25-30
4. Click "Previous" → Back to page 2

### Flow 2: Change Page Size
1. On page 2 (items 13-24)
2. Change to "24 per page"
3. Resets to page 1
4. Now shows items 1-24
5. Page 2 shows items 25-30

### Flow 3: Filter with Pagination
1. On page 2 of 30 products
2. Select "Mediterranean" filter → 6 products
3. Auto-resets to page 1
4. Pagination hides (only 1 page needed)

### Flow 4: Search with Pagination
1. Viewing page 2
2. Type "spicy" → 8 results
3. Auto-resets to page 1
4. Shows "Showing 1-8 of 8" (no pagination needed)

## Responsive Behavior

### Desktop (≥640px)
```
Show [12▼] per page • Showing 1-12 of 30    [<] 1 2 3 [>]
```
- Horizontal layout
- All info visible

### Mobile (<640px)
```
      Show [12▼] per page
    Showing 1-12 of 30

      [<] 1 2 3 [>]
```
- Stacked layout
- Page size selector on top
- Page numbers below

## Visual Design

### Page Size Selector
- Dropdown with border
- Options: 12, 24, 48
- Gray text with border
- Focus ring on interaction

### Page Number Buttons
- **Inactive**: White background, gray border, gray text
- **Active**: Dark background (gray-900), white text
- **Hover**: Subtle highlight
- **Size**: 32x32px (h-8 w-8)

### Navigation Buttons
- Previous: ChevronLeft icon
- Next: ChevronRight icon
- Disabled state: Gray, not clickable
- Same 32x32px size

### Info Text
- "Show X per page • Showing Y-Z of W"
- Gray 600 color
- 14px font size
- Bullet separator (•)

## Edge Cases Handled

### 1. Single Page
- Pagination component hidden
- Shows all results without controls

### 2. Empty Results
- No pagination shown
- Empty state message displayed

### 3. Last Page Partial
- 30 products, 12 per page → Page 3 shows 6 items
- Info: "Showing 25-30 of 30"

### 4. Filter to Single Page
- Start with 30 products (3 pages)
- Filter to 10 products
- Pagination hides (fits in 12)

### 5. Very Many Pages
- Smart ellipsis: 1 ... 5 6 7 ... 20
- Always shows first, last, and current ±1

## Performance Considerations

### Array Slicing
```typescript
const paginatedProducts = searchFilteredProducts.slice(startIndex, endIndex)
```
- O(n) operation but fast for 30 items
- Creates shallow copy (efficient)

### Re-render Optimization
- Only paginatedProducts rendered
- Not rendering hidden products
- Reduces DOM nodes

### Scroll Performance
```typescript
window.scrollTo({ top: 0, behavior: 'smooth' })
```
- Smooth scroll (300-500ms)
- Non-blocking
- Native browser optimization

## Testing Checklist

### Basic Pagination
- [ ] Load page: Shows 12 products
- [ ] Page 2: Shows products 13-24
- [ ] Page 3: Shows products 25-30
- [ ] Previous button: Goes back
- [ ] Next button: Advances
- [ ] First page: Previous disabled
- [ ] Last page: Next disabled

### Page Size
- [ ] Change to 24: Resets to page 1, shows 24
- [ ] Change to 48: Shows all 30 (no pagination)
- [ ] Change back to 12: Shows 12 with pagination

### Current Page Highlight
- [ ] Active page has dark background
- [ ] Other pages have white background
- [ ] Click page: Becomes active

### Info Display
- [ ] Shows correct "Showing X-Y of Z"
- [ ] Updates when page changes
- [ ] Updates when page size changes
- [ ] Updates when filters change

### Search & Filter Integration
- [ ] Search: Resets to page 1
- [ ] Apply filter: Resets to page 1
- [ ] Remove filter: Resets to page 1
- [ ] Clear all: Resets to page 1

### Scroll Behavior
- [ ] Click page 2: Scrolls to top smoothly
- [ ] Click page 3: Scrolls to top
- [ ] Smooth animation (no jump)

### Responsive
- [ ] Desktop: Horizontal layout
- [ ] Mobile: Stacked layout
- [ ] All controls accessible
- [ ] Touch-friendly buttons (44x44px effective)

### Edge Cases
- [ ] 0 results: No pagination
- [ ] 10 results (1 page): No pagination
- [ ] 13 results (2 pages): Pagination shows
- [ ] Filter to 1 page: Pagination hides

## Keyboard Navigation

- **Tab**: Navigate through page numbers
- **Enter/Space**: Activate page button
- **Tab to dropdown**: Open with Arrow Down
- **Arrow keys**: Navigate dropdown options
- **Enter**: Select page size

## Accessibility

### ARIA Labels
```typescript
<button aria-label="Go to page 2">2</button>
<button aria-label="Previous page" disabled>...</button>
<button aria-label="Next page">...</button>
```

### Focus Management
- Visible focus rings
- Logical tab order
- Disabled state prevents focus

### Screen Reader Announcements
- "Showing 1 to 12 of 30 results"
- "Page 2 of 3"
- "Selected page size: 12"

## Future Enhancements (Optional)

### Phase 2
- [ ] URL query params for page (`?page=2`)
- [ ] Browser back/forward support
- [ ] Jump to page input field
- [ ] Keyboard shortcuts (Cmd+Left/Right for prev/next)

### Phase 3
- [ ] Infinite scroll option
- [ ] "Load more" button alternative
- [ ] Pagination position (top + bottom)
- [ ] Remember page size preference (localStorage)

## Code Example

```typescript
// In marketplace-enhanced/page.tsx

const [currentPage, setCurrentPage] = useState(1)
const [pageSize, setPageSize] = useState(12)

// Calculate pagination
const totalProducts = searchFilteredProducts.length
const totalPages = Math.ceil(totalProducts / pageSize)
const startIndex = (currentPage - 1) * pageSize
const endIndex = startIndex + pageSize
const paginatedProducts = searchFilteredProducts.slice(startIndex, endIndex)

// Handlers
const handlePageChange = (page: number) => {
  setCurrentPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = (size: number) => {
  setPageSize(size)
  setCurrentPage(1)
}

// Auto-reset on filter/search change
useEffect(() => {
  setCurrentPage(1)
}, [searchQuery, filters])

// Render
{totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={handlePageChange}
    pageSize={pageSize}
    onPageSizeChange={handlePageSizeChange}
    totalItems={totalProducts}
    pageSizeOptions={[12, 24, 48]}
  />
)}
```

## Integration with Existing Features

### Density Toggle
- Works independently
- 4-col standard: 12 items = 3 rows
- 5-col compact: 12 items = 2-3 rows
- Page count unchanged

### Filters
- Apply filter → page resets to 1
- Filter may reduce page count
- Pagination hides if results fit in one page

### Search
- Type search → page resets to 1
- Results update instantly
- Pagination adjusts to result count

### Cart
- Adding to cart doesn't change page
- Cart drawer overlays pagination
- Page preserved during cart operations

## Benefits

1. **Better Performance**: Only render 12 items instead of 30
2. **Cleaner UI**: Less scrolling, focused view
3. **Scalable**: Ready for 100+ products
4. **Familiar UX**: Standard pagination pattern
5. **Flexible**: User controls page size
6. **Smart**: Auto-resets when needed
7. **Accessible**: Keyboard + screen reader friendly

## Summary

Pagination adds:
- ✅ Page size selector (12/24/48)
- ✅ Page navigation (prev/next + numbers)
- ✅ Smart ellipsis for many pages
- ✅ Info display (showing X-Y of Z)
- ✅ Auto-reset on filter/search
- ✅ Smooth scroll to top
- ✅ Responsive layout
- ✅ Keyboard accessible
- ✅ Integrates seamlessly with existing features

**Result**: Professional, scalable pagination that handles any product count efficiently. 🎉
