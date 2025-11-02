# Quick Start Guide

Get the Menu Builder running in 5 minutes.

## Installation

The module is already part of the codebase. No installation needed.

## Basic Usage

### 1. Create a New Menu

```tsx
// app/(admin)/menus/new/page.tsx
import { MenuBuilderContainer } from '@/components/domains/menus/menu-builder'
import { useRouter } from 'next/navigation'

export default function NewMenuPage() {
  const router = useRouter()

  return (
    <div className="h-screen flex flex-col">
      <MenuBuilderContainer
        accountId="your-account-id"
        onSuccess={(menuId) => router.push(`/menus/${menuId}`)}
        onCancel={() => router.back()}
      />
    </div>
  )
}
```

### 2. Edit Existing Menu

```tsx
// app/(admin)/menus/[menuId]/edit/page.tsx
import { MenuBuilderContainer } from '@/components/domains/menus/menu-builder'

export default function EditMenuPage({ params }: { params: { menuId: string } }) {
  return (
    <div className="h-screen flex flex-col">
      <MenuBuilderContainer
        accountId="your-account-id"
        menuId={params.menuId}
        onSuccess={(menuId) => router.push(`/menus/${menuId}`)}
      />
    </div>
  )
}
```

### 3. With Mock Data (Testing)

```tsx
import { FastMenuBuilder } from '@/components/domains/menus/menu-builder'

const MOCK_ITEMS = [
  {
    id: '1',
    name: 'Caesar Salad',
    category: 'appetizers',
    priceCents: 1200,
    isAvailable: true,
  },
  // ... more items
]

export default function TestPage() {
  const handleSave = async (menu) => {
    console.log('Saving:', menu)
  }

  return (
    <FastMenuBuilder
      accountId="test"
      availableItems={MOCK_ITEMS}
      onSave={handleSave}
    />
  )
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search |
| `Enter` | Add selected item |
| `Shift + Enter` | Add item and keep focus on search |
| `Alt + 1-9` | Target specific course |
| `]` | Open details panel |
| `[` or `Esc` | Close details panel |
| `↑` / `↓` | Navigate search results |

## Features Overview

### Drag and Drop
- Drag items between courses to reorganize
- Visual feedback during drag
- Prevents duplicates

### Duplicate Items
- Click copy icon on any item
- Creates duplicate in same course
- Maintains price and settings

### Smart Categorization
- Items auto-added to correct course
- Based on item category
- Customizable mapping

### Pricing Strategies
- **Sum of Items**: Total = sum of all item prices
- **Fixed Price**: Set one price for entire menu

### Details Panel
- Slide in from right
- Non-blocking UI
- Edit metadata, availability, tags, images

## Component Props

### MenuBuilderContainer

```typescript
interface MenuBuilderContainerProps {
  accountId: string                    // Required: Your account ID
  menuId?: string                      // Optional: For editing existing menu
  onSuccess?: (menuId: string) => void // Called after successful save
  onCancel?: () => void                // Called when user cancels
}
```

### FastMenuBuilder

```typescript
interface FastMenuBuilderProps {
  accountId: string                           // Required
  initialMenu?: MenuBuilder                   // Optional: Pre-populate data
  availableItems: MenuItem[]                  // Required: Items to choose from
  onSave?: (menu: MenuBuilder) => void | Promise<void>  // Save handler
  onCancel?: () => void                       // Cancel handler
}
```

## Common Patterns

### Get Account ID from Session

```tsx
import { getServerSession } from '@/lib/auth/session'

export default async function MenuPage() {
  const session = await getServerSession()
  const accountId = session.user.accountId

  return <MenuBuilderContainer accountId={accountId} />
}
```

### Handle Save with Redirect

```tsx
const router = useRouter()

const handleSuccess = (menuId: string) => {
  router.push(`/menus/${menuId}`)
  toast.success('Menu saved!')
}

<MenuBuilderContainer onSuccess={handleSuccess} />
```

### Custom Data Fetching

```tsx
import { FastMenuBuilder, useAvailableMenuItems } from '@/components/domains/menus/menu-builder'

function CustomBuilder() {
  const { data: items = [], isLoading } = useAvailableMenuItems(accountId)

  if (isLoading) return <Spinner />

  return <FastMenuBuilder accountId={accountId} availableItems={items} />
}
```

## Troubleshooting

### Issue: Items not loading

**Solution:**
- Check backend API is running
- Verify `accountId` is correct
- Check browser console for errors
- Open React Query DevTools

### Issue: Save not working

**Solution:**
- Check validation errors in console
- Ensure at least one course has items
- Verify menu name is provided
- Check network tab for API errors

### Issue: Search not working

**Solution:**
- Click search box or press `/`
- Check items have searchable `name` field
- Verify items array is not empty

### Issue: Drag and drop not working

**Solution:**
- Ensure browser supports HTML5 drag/drop
- Check no conflicting event handlers
- Verify items have unique `id` fields

## Next Steps

1. **Connect to Backend**: See `API_CONTRACT.md`
2. **Customize UI**: Modify `FastMenuBuilder.tsx`
3. **Add Validation**: Extend `validation/schemas.ts`
4. **Add Features**: Create new hooks in `hooks/`
5. **Deploy**: Follow deployment checklist in `ARCHITECTURE.md`

## Need Help?

- **User Guide**: `README.md`
- **Architecture**: `ARCHITECTURE.md`
- **API Docs**: `API_CONTRACT.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

## Example: Full Integration

```tsx
'use client'

import { MenuBuilderContainer } from '@/components/domains/menus/menu-builder'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session'
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb'

export default function CreateMenuPage() {
  const router = useRouter()
  const { session } = useSession()

  if (!session) {
    return <div>Please log in</div>
  }

  return (
    <div className="h-screen flex flex-col">
      <PageBreadcrumb pageTitle="Create Menu" />

      <div className="flex-1 overflow-hidden">
        <MenuBuilderContainer
          accountId={session.user.accountId}
          onSuccess={(menuId) => {
            router.push(`/menus/${menuId}`)
          }}
          onCancel={() => {
            router.back()
          }}
        />
      </div>
    </div>
  )
}
```

That's it! You're ready to build menus. 🚀
