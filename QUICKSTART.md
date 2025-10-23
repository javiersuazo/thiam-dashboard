# Quick Start Guide - Thiam Dashboard

**Get started building features in 5 minutes**

---

## 🚀 Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Dashboard: http://localhost:3000
API (if needed): cd ../thiam-api && docker-compose up

### 2. Update API Types

When API changes:

```bash
npm run api:update
```

This regenerates TypeScript types in ~130ms.

---

## 📝 Creating a New Feature

### Option A: New Domain Feature

**Example: Building a "Delivery Tracking" feature**

```bash
# 1. Domain already exists: src/components/domains/deliveries/
# 2. Create your component:
```

```tsx
// src/components/domains/deliveries/components/DeliveryTracker.tsx

import { useDeliveries } from '@/lib/api/hooks'
import { DeliveryCard } from './DeliveryCard'

export function DeliveryTracker() {
  const { data: deliveries, isLoading } = useDeliveries({ status: 'in_transit' })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h2>Active Deliveries</h2>
      {deliveries?.map(delivery => (
        <DeliveryCard key={delivery.id} delivery={delivery} />
      ))}
    </div>
  )
}
```

```tsx
// 3. Export from domain's public API
// src/components/domains/deliveries/index.ts

export { DeliveryTracker } from './components/DeliveryTracker'
export { DeliveryCard } from './components/DeliveryCard'
```

```tsx
// 4. Use in a page
// app/(admin)/deliveries/page.tsx

import { DeliveryTracker } from '@/components/domains/deliveries'

export default function DeliveriesPage() {
  return <DeliveryTracker />
}
```

### Option B: Cross-Domain Feature

**Example: Chat feature that uses multiple domains**

```tsx
// src/components/features/chat/ChatWindow.tsx

import { useRequests } from '@/lib/api/hooks'
import { RequestCard } from '@/components/domains/requests'
import { OfferCard } from '@/components/domains/offers'

export function ChatWindow() {
  // Can use multiple domains
  const { data: requests } = useRequests()

  return (
    <div>
      <h2>Chat</h2>
      {/* Chat UI that references requests/offers */}
    </div>
  )
}
```

---

## 🎨 Component Checklist

When creating a new component, follow this checklist:

### 1. Component File

```tsx
// ✅ Has JSDoc comment
// ✅ Has example usage
// ✅ Props interface defined
// ✅ Proper imports from lower layers only
// ✅ Handles loading/error states
// ✅ Uses type-safe API hooks
```

### 2. Types File

```tsx
// ✅ Extends API types (don't duplicate)
// ✅ ViewModel for computed properties
// ✅ Filters for list views
// ✅ FormData for forms
```

### 3. Hooks File

```tsx
// ✅ Domain-specific logic only
// ✅ Returns typed object
// ✅ Uses useCallback for actions
// ✅ Uses useMemo for computations
```

### 4. Validation File

```tsx
// ✅ Zod schemas for forms
// ✅ Export inferred types
// ✅ Clear error messages
```

### 5. Utils File

```tsx
// ✅ Pure functions only
// ✅ No side effects
// ✅ Well-documented
// ✅ Exported types
```

### 6. Index File

```tsx
// ✅ Only exports public API
// ✅ No internal exports
// ✅ Commented exports for documentation
```

---

## 🔑 Common Patterns

### Pattern 1: List with Filters

```tsx
import { useRequests } from '@/lib/api/hooks'
import { useRequestFilters } from '@/components/domains/requests'

function RequestList() {
  const { filters, setFilters } = useRequestFilters()
  const { data, isLoading } = useRequests(filters)

  return (
    <div>
      <FilterPanel filters={filters} onChange={setFilters} />
      <ItemGrid items={data} />
    </div>
  )
}
```

### Pattern 2: Detail Page

```tsx
import { useRequest } from '@/lib/api/hooks'

function RequestDetail({ params }: { params: { id: string } }) {
  const { data: request, isLoading } = useRequest(params.id)

  if (isLoading) return <Loading />
  if (!request) return <NotFound />

  return <RequestDetailView request={request} />
}
```

### Pattern 3: Create Form

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateRequest } from '@/lib/api/hooks'
import { requestFormSchema } from '@/components/domains/requests'

function CreateRequestForm() {
  const form = useForm({
    resolver: zodResolver(requestFormSchema),
  })

  const createMutation = useCreateRequest({
    onSuccess: () => router.push('/requests'),
  })

  return (
    <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}>
      {/* Form fields */}
    </form>
  )
}
```

### Pattern 4: Permission-Based Rendering

```tsx
import { usePermission } from '@/lib/rbac/hooks'

function RequestActions() {
  const canEdit = usePermission('requests:update')
  const canDelete = usePermission('requests:delete')

  return (
    <div>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  )
}
```

---

## 📂 File Location Guide

**"Where do I put this file?"**

| What | Where | Example |
|------|-------|---------|
| Request list component | `components/domains/requests/components/` | `RequestList.tsx` |
| Request filters hook | `components/domains/requests/hooks/` | `useRequestFilters.ts` |
| Request types | `components/domains/requests/types/` | `request.types.ts` |
| Request utilities | `components/domains/requests/utils/` | `requestHelpers.ts` |
| Request validation | `components/domains/requests/validation/` | `requestSchema.ts` |
| Chat feature | `components/features/chat/` | `ChatWindow.tsx` |
| Button component | `components/shared/Button/` | `Button.tsx` |
| Layout | `components/layouts/` | `AdminLayout.tsx` |
| API hooks | `lib/api/` | `hooks.ts` |
| RBAC logic | `lib/rbac/` | `permissions.ts` |
| Auth logic | `lib/session/` | `auth.ts` |
| Global types | `types/models/` | `request.ts` |
| Pages | `app/(admin)/` | `requests/page.tsx` |
| API routes | `app/api/` | `session/route.ts` |

---

## 🧪 Testing Your Code

### Unit Test

```tsx
import { render, screen } from '@testing-library/react'
import { RequestCard } from './RequestCard'

describe('RequestCard', () => {
  it('renders title', () => {
    render(<RequestCard request={mockRequest} />)
    expect(screen.getByText('Test Request')).toBeInTheDocument()
  })
})
```

Run tests:

```bash
npm test
```

---

## ❓ FAQs

### Q: Can I import from another domain?

**A:** No! Domains should be independent. If you need to use multiple domains, create a **feature** component instead.

```tsx
// ❌ Bad - domains importing from each other
// components/domains/requests/components/RequestDetail.tsx
import { OfferCard } from '@/components/domains/offers'

// ✅ Good - feature that uses both domains
// components/features/request-offers/RequestWithOffers.tsx
import { RequestDetail } from '@/components/domains/requests'
import { OfferCard } from '@/components/domains/offers'
```

### Q: Where do I put shared utilities?

**A:** Depends on scope:

- **Domain-specific**: `components/domains/{domain}/utils/`
- **Global**: `lib/utils/`

### Q: How do I add a new API hook?

**A:** Add it to `lib/api/hooks.ts`:

```tsx
export function useMyNewEndpoint(params) {
  return useQuery({
    queryKey: ['my-endpoint', params],
    queryFn: async () => {
      const { data, error } = await api.GET('/my-endpoint', { params })
      if (error) throw error
      return data!
    },
  })
}
```

### Q: Do I need to regenerate API types often?

**A:** Only when the backend API changes. Run `npm run api:update` and you're done in 130ms.

---

## 🎯 Next Steps

1. **Read**: `ARCHITECTURE.md` - Understand the big picture
2. **Read**: `CODING_GUIDELINES.md` - Learn the patterns
3. **Build**: Pick a feature from your roadmap and start coding!
4. **Reference**: `src/lib/api/examples.tsx` - Copy-paste examples

---

**Happy coding!** 🚀

Questions? Check the docs or refer to the Request domain as the reference implementation.
