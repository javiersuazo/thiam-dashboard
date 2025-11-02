# Marketplace Transformation Plan

## Current State → Target State

### ❌ Current Issues (Not Following Principles)

1. **Multi-view navigation** (Store → Cart → Checkout)
   - Blocks primary flow
   - Requires navigation between screens

2. **Modal-heavy checkout**
   - Multi-step modal blocks everything
   - Can't see cart while filling form

3. **No search focus**
   - Search is in sidebar, not primary
   - No keyboard shortcuts
   - No auto-focus on load

4. **Hidden state**
   - Cart total hidden until you click "Cart"
   - Items disappear into cart view
   - No always-visible summary

5. **Mouse-first**
   - No keyboard shortcuts
   - No visible hints
   - Click-only interactions

6. **Separate views**
   - Products, cart, checkout are different screens
   - Context switching required

### ✅ Target State (Following Principles)

1. **One screen, zero modals**
   - All on one page: search, products, cart, checkout
   - Slide-in panes (non-blocking)
   - Primary flow never interrupted

2. **Search-first**
   - Full-width search bar at top
   - Auto-focus on load
   - First result preselected
   - `/` to focus anytime

3. **Always-visible cart**
   - Right sidebar with cart summary
   - Always shows total, item count
   - Sticky, scrollable

4. **Keyboard-native**
   - Every action has shortcut
   - Visible hints in UI
   - Enter to add, Esc to close, arrows to navigate

5. **Glanceable state**
   - Name, price, availability always visible
   - Total always in view
   - No hidden information

6. **Predictable focus**
   - Add item → flash row → focus quantity
   - Tab order makes sense
   - Esc returns to search

## New Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Top Bar (Navbar)                                             │
│ Logo • Marketplace • Help (?) • Avatar                       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Search Bar (Full width, auto-focus)                          │
│ Type to search... (Press / to focus)                         │
│ Recent: [Pizza] [Pasta] [Salad]                             │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────────────────┬──────────────────────────┐
│                                  │ Cart Summary (Sticky)    │
│ Product Grid                     │ ┌──────────────────────┐ │
│ (Search results / All products)  │ │ 3 items              │ │
│                                  │ │                      │ │
│ [Product Card]  [Product Card]   │ │ • Pizza x2  €29.98  │ │
│                                  │ │ • Salad x1  €8.99   │ │
│ [Product Card]  [Product Card]   │ │                      │ │
│                                  │ │ Subtotal    €38.97  │ │
│ [Product Card]  [Product Card]   │ │ Delivery    €5.00   │ │
│                                  │ │ Tax         €7.79   │ │
│                                  │ │ ─────────────────── │ │
│                                  │ │ Total       €51.76  │ │
│                                  │ │                      │ │
│                                  │ │ [Checkout]          │ │
│                                  │ └──────────────────────┘ │
│                                  │                          │
│ 16 products found                │ Keyboard Shortcuts      │
│                                  │ / Search • Enter Add    │
└──────────────────────────────────┴──────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Footer: Filters (]) • Items: 3 • Total: €51.76              │
└─────────────────────────────────────────────────────────────┘

[Slide-in Pane (Right, when ']' pressed)]
┌────────────────────────┐
│ Filters                │
│ [X]                    │
│                        │
│ Categories             │
│ □ Italian              │
│ ☑ Salads              │
│                        │
│ Price Range            │
│ €0 ──●────── €100     │
│                        │
│ [Reset]                │
└────────────────────────┘
```

## Transformation Steps

### Phase 1: Layout Restructure
- [x] One-screen layout (no view switching)
- [ ] Search bar at top (full-width)
- [ ] Product grid on left (2/3 width)
- [ ] Cart summary on right (1/3 width, sticky)
- [ ] Slide-in pane for filters (non-blocking)
- [ ] Footer with totals and shortcuts

### Phase 2: Search-First
- [ ] Auto-focus search on page load
- [ ] Search results dropdown with keyboard nav
- [ ] First result preselected
- [ ] Enter to add selected item
- [ ] Shift+Enter to add and stay in search
- [ ] Recent items chips
- [ ] Real-time filtering

### Phase 3: Keyboard Navigation
- [ ] `/` - Focus search
- [ ] `Esc` - Clear search / Close pane
- [ ] `Enter` - Add selected item
- [ ] `Shift+Enter` - Add and continue
- [ ] `]` - Open filter pane
- [ ] `[` - Close filter pane
- [ ] `↑/↓` - Navigate search results
- [ ] Visible shortcut hints in UI

### Phase 4: Always-Visible State
- [ ] Cart summary always visible (sticky right)
- [ ] Total always in footer
- [ ] Item count in header
- [ ] No hidden state

### Phase 5: Predictable Focus
- [ ] Add item → flash cart row (600ms)
- [ ] Add item → focus quantity in cart
- [ ] Tab order: Search → Products → Cart → Checkout
- [ ] Esc returns to search

### Phase 6: Micro-interactions
- [ ] Row flash on add (600ms, 8% brand tint)
- [ ] Smooth scroll to cart item
- [ ] Hover states with 150ms transition
- [ ] Loading skeletons (no blocking)

### Phase 7: Inline Checkout
- [ ] Checkout form in slide-in pane OR
- [ ] Checkout form replaces product grid (expandable)
- [ ] Can still see cart summary
- [ ] No modal, no blocking

### Phase 8: Polish
- [ ] Content width: 1280px max
- [ ] 24px gutters
- [ ] 8px grid spacing
- [ ] Proper density (44-48px rows)
- [ ] Consistent icons (16px)
- [ ] ARIA announcements
- [ ] WCAG AA contrast

## Key Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Layout** | 3 separate views | 1 screen, slide-in panes |
| **Search** | Sidebar filter | Top bar, auto-focus |
| **Cart** | Separate page | Always-visible sidebar |
| **Checkout** | Modal blocking | Inline or slide-in |
| **Navigation** | Click between views | Keyboard shortcuts |
| **Focus** | Mouse-first | Keyboard-first |
| **State** | Hidden until click | Always visible |
| **Modals** | Multi-step modal | Zero modals |
| **Shortcuts** | None | Every action |
| **Hints** | None | Visible in UI |

## Implementation Priority

1. **Critical** (Must have)
   - One-screen layout
   - Search-first
   - Always-visible cart
   - Keyboard shortcuts (/, Enter, Esc)

2. **Important** (Should have)
   - Slide-in filter pane
   - Predictable focus
   - Row flash animation
   - Visible shortcut hints

3. **Nice to have** (Could have)
   - Advanced keyboard nav (↑/↓, Alt+1-9)
   - Drag reorder
   - Auto-save indicators
   - Recent items

## Success Criteria

✅ User can complete entire flow without mouse
✅ Search is focused on page load
✅ Cart total always visible
✅ No modals block the UI
✅ Every action has keyboard shortcut
✅ Shortcuts visible in UI
✅ Add item → cart updates + flashes + focuses quantity
✅ Filter pane doesn't cover content
✅ Content width ≤ 1280px
✅ 8px grid spacing throughout
✅ Loading never blocks interaction

## Next Steps

1. Create new layout component (one-screen)
2. Implement search-first bar with shortcuts
3. Create sticky cart sidebar
4. Build slide-in filter pane
5. Add keyboard event handlers
6. Implement focus management
7. Add micro-interactions
8. Polish spacing and density
9. Test complete keyboard flow
10. Add ARIA announcements

Let's build this! 🚀
