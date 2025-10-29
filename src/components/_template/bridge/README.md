# Component Bridge

This directory contains bridge components that adapt shadcn/ui components to work seamlessly with TailAdmin layouts.

## Purpose

The hybrid approach combines:
- **shadcn/ui components** for ALL interactive elements (forms, buttons, dialogs, etc.)
- **TailAdmin layouts** for page structure, navigation, and visual design

## Usage Pattern

```tsx
// ✅ GOOD: Use shadcn components for interactive elements
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'

// ✅ GOOD: Use TailAdmin for layout structure
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Breadcrumb from '@/components/Breadcrumb'

// ❌ BAD: Don't use TailAdmin form components
import { InputField } from '@/components/ui/forms' // TailAdmin - deprecated
```

## Bridge Components

Bridge components in this directory wrap shadcn/ui components with TailAdmin styling for consistent appearance:

- `card-wrapper.tsx` - Wraps Card with TailAdmin styling
- `page-header.tsx` - Page header with breadcrumb integration
- `data-table.tsx` - TanStack Table with TailAdmin styling
- `form-section.tsx` - Form section with TailAdmin card styling

## Migration Guide

When converting TailAdmin pages to hybrid system:

1. **Keep**: Layout components (Sidebar, Header, Breadcrumb)
2. **Replace**: All form inputs, buttons, dialogs with shadcn/ui
3. **Bridge**: Use bridge components for consistent styling

### Example: Before/After

**Before (TailAdmin only):**
```tsx
<div className="rounded-lg border border-stroke bg-white p-6">
  <form onSubmit={handleSubmit}>
    <InputField label="Name" value={name} onChange={setName} />
    <TailAdminButton type="submit">Save</TailAdminButton>
  </form>
</div>
```

**After (Hybrid approach):**
```tsx
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

<Card>
  <CardContent>
    <Form {...form}>
      <FormField name="name" label="Name" />
      <Button type="submit">Save</Button>
    </Form>
  </CardContent>
</Card>
```
