# Thiam Dashboard - Coding Guidelines

**Domain-Driven Design (DDD) Principles for React/Next.js**

Last Updated: 2025-10-23

---

## 📖 Table of Contents

1. [Core Principles](#core-principles)
2. [File Templates](#file-templates)
3. [Component Patterns](#component-patterns)
4. [Hook Patterns](#hook-patterns)
5. [Type Patterns](#type-patterns)
6. [Validation Patterns](#validation-patterns)
7. [Naming Conventions](#naming-conventions)
8. [Import Rules](#import-rules)
9. [Code Quality Rules](#code-quality-rules)
10. [Testing Patterns](#testing-patterns)

---

## Core Principles

### 1. Single Responsibility Principle (SRP)
**Each file, function, or component should have ONE clear responsibility.**

✅ **Good:**
```tsx
// Does one thing: displays a request card
function RequestCard({ request }: { request: Request }) {
  return <div>{request.title}</div>
}

// Does one thing: formats dates
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}
```

❌ **Bad:**
```tsx
// Does too many things: fetches data, formats, displays, AND handles actions
function RequestCard({ id }: { id: string }) {
  const { data } = useRequest(id)
  const formatted = new Date(data.date).toLocaleDateString()
  const handleDelete = () => api.DELETE('/requests/' + id)
  return <div onClick={handleDelete}>{formatted}</div>
}
```

### 2. Dependency Direction
**Always import from lower layers, never from siblings or higher layers.**

✅ **Good:**
```tsx
// app/requests/page.tsx (top layer)
import { RequestList } from '@/components/domains/requests'  // ✅ Lower layer

// components/domains/requests/components/RequestList.tsx
import { useRequests } from '@/lib/api/hooks'  // ✅ Lower layer
import { Button } from '@/components/shared'   // ✅ Lower layer
```

❌ **Bad:**
```tsx
// components/domains/requests/components/RequestList.tsx
import { OfferCard } from '@/components/domains/offers'  // ❌ Sibling domain

// components/shared/Button.tsx
import { useSession } from '@/lib/session'  // ❌ Too high-level for shared component
```

### 3. Explicit Over Implicit
**Be explicit about what you're doing. No magic.**

✅ **Good:**
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'  // Explicit options
  onClick: () => void                           // Explicit callback
  children: React.ReactNode                     // Explicit content
}
```

❌ **Bad:**
```tsx
interface ButtonProps {
  type?: string  // Unclear what values are valid
  action?: any   // No type safety
  [key: string]: any  // Anything goes!
}
```

### 4. Domain Language
**Use business terms from the domain, not technical jargon.**

✅ **Good:**
```tsx
// Uses business language
interface CateringRequest {
  guestCount: number
  eventDate: string
  dietaryRequirements: string[]
}

function acceptOffer(offerId: string) { ... }
```

❌ **Bad:**
```tsx
// Uses technical jargon
interface DataRecord {
  count: number
  timestamp: string
  tags: string[]
}

function updateStatus(id: string, value: number) { ... }
```

---

## File Templates

### Domain Component Template

```tsx
/**
 * {ComponentName}
 *
 * {Brief description of what this component does}
 *
 * @example
 * ```tsx
 * <{ComponentName} {exampleProps} />
 * ```
 */

import { ... } from '...'
import type { ... } from '../types/...'

interface {ComponentName}Props {
  // Props go here
}

export function {ComponentName}({ ...props }: {ComponentName}Props) {
  // Hooks
  const { data, isLoading } = use{Domain}()

  // Derived state
  const computed = useMemo(() => ..., [])

  // Event handlers
  const handleAction = useCallback(() => {
    // Handle action
  }, [])

  // Early returns
  if (isLoading) return <LoadingState />
  if (!data) return <EmptyState />

  // Main render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Domain Hook Template

```tsx
/**
 * use{HookName}
 *
 * {Brief description of what this hook does}
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, actions } = use{HookName}()
 *   return <div>{data}</div>
 * }
 * ```
 */

import { useState, useCallback } from 'react'
import type { ... } from '../types/...'

interface Use{HookName}Options {
  // Options go here
}

interface Use{HookName}Return {
  // Return type here
}

export function use{HookName}(options?: Use{HookName}Options): Use{HookName}Return {
  // State
  const [state, setState] = useState()

  // Actions
  const action = useCallback(() => {
    // Action logic
  }, [])

  // Return public API
  return {
    state,
    action,
  }
}
```

### Domain Type Template

```tsx
/**
 * {Domain} Domain Types
 *
 * Domain-specific types that extend/adapt API types for UI needs.
 */

import type { components } from '@/lib/api/generated/schema'

// Base API type
type Api{Domain} = components['schemas']['response.{Domain}']

/**
 * {Domain} View Model
 * Enriched type with computed properties for UI
 */
export interface {Domain}ViewModel extends Api{Domain} {
  // Computed properties
  isActive: boolean

  // Display helpers
  statusLabel: string
  formattedDate: string
}

/**
 * {Domain} Filters
 */
export interface {Domain}Filters {
  status?: string[]
  searchQuery?: string
}

/**
 * {Domain} Form Data
 */
export interface {Domain}FormData {
  // Form fields
}
```

### Domain Utility Template

```tsx
/**
 * {Domain} Domain Utilities
 *
 * Pure functions for {domain}-related calculations and transformations.
 * No side effects, no API calls - just data transformations.
 */

import type { {Domain}ViewModel } from '../types/{domain}.types'
import type { components } from '@/lib/api/generated/schema'

type Api{Domain} = components['schemas']['response.{Domain}']

/**
 * Transform API {domain} to view model
 */
export function to{Domain}ViewModel(api{Domain}: Api{Domain}): {Domain}ViewModel {
  return {
    ...api{Domain},
    // Add computed properties
    isActive: api{Domain}.status === 'active',
    statusLabel: getStatusLabel(api{Domain}.status),
    formattedDate: formatDate(api{Domain}.date),
  }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: string): string {
  // Implementation
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  // Implementation
}
```

### Domain Validation Template

```tsx
/**
 * {Domain} Domain Validation
 *
 * Zod schemas for validating {domain} data.
 */

import { z } from 'zod'

/**
 * {Domain} Form Schema
 */
export const {domain}FormSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  // Other fields
})

/**
 * {Domain} Filter Schema
 */
export const {domain}FilterSchema = z.object({
  status: z.array(z.string()).optional(),
  searchQuery: z.string().optional(),
})

// Export types
export type {Domain}FormInput = z.infer<typeof {domain}FormSchema>
export type {Domain}FilterInput = z.infer<typeof {domain}FilterSchema>
```

---

## Component Patterns

### Pattern 1: List Component

```tsx
/**
 * {Domain}List
 *
 * Displays a list of {domain} items with filtering and pagination.
 */

import { use{Domain}s } from '@/lib/api/hooks'
import { use{Domain}Filters } from '../hooks/use{Domain}Filters'
import { {Domain}Card } from './{Domain}Card'
import { {Domain}Filters as FilterPanel } from './{Domain}Filters'

export function {Domain}List() {
  // Filters
  const { filters, setFilters } = use{Domain}Filters()

  // Data fetching
  const { data: items, isLoading, error } = use{Domain}s(filters)

  // Loading state
  if (isLoading) return <div>Loading...</div>

  // Error state
  if (error) return <div>Error: {error.message}</div>

  // Empty state
  if (!items?.length) return <div>No items found</div>

  // Main render
  return (
    <div>
      <FilterPanel filters={filters} onChange={setFilters} />

      <div className="grid gap-4">
        {items.map((item) => (
          <{Domain}Card key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
```

### Pattern 2: Detail Component

```tsx
/**
 * {Domain}Detail
 *
 * Displays detailed information about a single {domain} item.
 */

import { use{Domain} } from '@/lib/api/hooks'
import { use{Domain}Actions } from '../hooks/use{Domain}Actions'

interface {Domain}DetailProps {
  id: string
}

export function {Domain}Detail({ id }: {Domain}DetailProps) {
  // Data fetching
  const { data: item, isLoading } = use{Domain}(id)

  // Actions
  const { canEdit, canDelete, handleEdit, handleDelete } = use{Domain}Actions(item)

  // Loading state
  if (isLoading) return <div>Loading...</div>

  // Not found
  if (!item) return <div>Not found</div>

  // Main render
  return (
    <div>
      <h1>{item.title}</h1>

      {/* Actions */}
      <div className="flex gap-2">
        {canEdit && <button onClick={handleEdit}>Edit</button>}
        {canDelete && <button onClick={handleDelete}>Delete</button>}
      </div>

      {/* Content */}
      <div>{item.description}</div>
    </div>
  )
}
```

### Pattern 3: Form Component

```tsx
/**
 * {Domain}Form
 *
 * Form for creating or editing a {domain} item.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreate{Domain}, useUpdate{Domain} } from '@/lib/api/hooks'
import { {domain}FormSchema, type {Domain}FormInput } from '../validation/{domain}Schema'

interface {Domain}FormProps {
  id?: string  // If provided, edit mode
  initialData?: Partial<{Domain}FormInput>
  onSuccess?: (item: any) => void
}

export function {Domain}Form({ id, initialData, onSuccess }: {Domain}FormProps) {
  // Form setup
  const form = useForm<{Domain}FormInput>({
    resolver: zodResolver({domain}FormSchema),
    defaultValues: initialData,
  })

  // Mutations
  const createMutation = useCreate{Domain}({ onSuccess })
  const updateMutation = useUpdate{Domain}({ onSuccess })

  // Submit handler
  const onSubmit = (data: {Domain}FormInput) => {
    if (id) {
      updateMutation.mutate({ id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <input {...form.register('title')} />
      {form.formState.errors.title && (
        <span>{form.formState.errors.title.message}</span>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : id ? 'Update' : 'Create'}
      </button>
    </form>
  )
}
```

### Pattern 4: Card Component

```tsx
/**
 * {Domain}Card
 *
 * Compact card view of a {domain} item.
 */

import Link from 'next/link'
import { Badge } from '@/components/shared/Badge'
import { to{Domain}ViewModel } from '../utils/{domain}Helpers'
import type { components } from '@/lib/api/generated/schema'

type Api{Domain} = components['schemas']['response.{Domain}']

interface {Domain}CardProps {
  item: Api{Domain}
  onClick?: () => void
}

export function {Domain}Card({ item, onClick }: {Domain}CardProps) {
  // Transform to view model
  const viewModel = to{Domain}ViewModel(item)

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/requests/${item.id}`}>
            <h3 className="font-semibold">{item.title}</h3>
          </Link>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>

        <Badge color={viewModel.statusColor}>
          {viewModel.statusLabel}
        </Badge>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {viewModel.formattedDate}
      </div>
    </div>
  )
}
```

---

## Hook Patterns

### Pattern 1: Filter Hook

```tsx
/**
 * use{Domain}Filters
 *
 * Manages filter state with URL sync and localStorage persistence.
 */

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { {Domain}Filters } from '../types/{domain}.types'

export function use{Domain}Filters(defaults: {Domain}Filters = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filters, setFiltersState] = useState<{Domain}Filters>(() => {
    // Initialize from URL or localStorage
    return defaults
  })

  const setFilters = useCallback((newFilters: Partial<{Domain}Filters>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters }

      // Sync to URL
      const params = new URLSearchParams()
      if (updated.status) params.set('status', updated.status.join(','))
      router.push(`?${params.toString()}`, { scroll: false })

      return updated
    })
  }, [router])

  const resetFilters = useCallback(() => {
    setFiltersState(defaults)
    router.push(window.location.pathname)
  }, [defaults, router])

  return {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters: Object.keys(filters).length > 0,
  }
}
```

### Pattern 2: Actions Hook

```tsx
/**
 * use{Domain}Actions
 *
 * Provides available actions for a {domain} item based on permissions.
 */

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePermission } from '@/lib/rbac/hooks'
import { useDelete{Domain} } from '@/lib/api/hooks'
import type { components } from '@/lib/api/generated/schema'

type Api{Domain} = components['schemas']['response.{Domain}']

export function use{Domain}Actions(item?: Api{Domain}) {
  const router = useRouter()
  const canEdit = usePermission('{domain}:update')
  const canDelete = usePermission('{domain}:delete')

  const deleteMutation = useDelete{Domain}({
    onSuccess: () => router.push('/{domain}s'),
  })

  const handleEdit = useCallback(() => {
    if (!item) return
    router.push(`/{domain}s/${item.id}/edit`)
  }, [item, router])

  const handleDelete = useCallback(() => {
    if (!item) return
    if (confirm('Are you sure?')) {
      deleteMutation.mutate(item.id)
    }
  }, [item, deleteMutation])

  const handleDuplicate = useCallback(() => {
    if (!item) return
    router.push(`/{domain}s/new?duplicate=${item.id}`)
  }, [item, router])

  return {
    canEdit: canEdit && item?.status === 'draft',
    canDelete: canDelete,
    canDuplicate: true,
    handleEdit,
    handleDelete,
    handleDuplicate,
    isDeleting: deleteMutation.isPending,
  }
}
```

---

## Naming Conventions

### Components
- PascalCase
- Noun-based (what it is)
- Domain prefix for domain components

```tsx
// ✅ Good
RequestList
RequestCard
OfferDetail
OrderForm

// ❌ Bad
request-list
ListOfRequests
ShowRequest
```

### Hooks
- camelCase
- Start with `use`
- Verb-based (what it does)

```tsx
// ✅ Good
useRequestFilters
useRequestActions
useAuth
usePermission

// ❌ Bad
RequestFilters
getFilters
UseFilters
```

### Types
- PascalCase
- Descriptive suffix

```tsx
// ✅ Good
RequestViewModel
RequestFilters
RequestFormData
RequestStatus

// ❌ Bad
Request
IRequest
RequestType
```

### Utilities
- camelCase
- Verb-based (what it does)

```tsx
// ✅ Good
formatDate
calculateTotal
toRequestViewModel
getStatusLabel

// ❌ Bad
DateFormatter
total
requestVM
status
```

---

## Import Rules

### Import Order

```tsx
// 1. External libraries
import React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

// 2. Internal libraries
import { api } from '@/lib/api'
import { usePermission } from '@/lib/rbac/hooks'

// 3. Domain components
import { RequestCard } from '@/components/domains/requests'
import { OfferList } from '@/components/domains/offers'

// 4. Shared components
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'

// 5. Relative imports (domain-internal)
import { useRequestFilters } from '../hooks/useRequestFilters'
import { toRequestViewModel } from '../utils/requestHelpers'

// 6. Types
import type { RequestViewModel } from '../types/request.types'
import type { components } from '@/lib/api/generated/schema'

// 7. Styles
import styles from './RequestList.module.css'
```

### Import Aliases

Always use `@/` alias for absolute imports:

```tsx
// ✅ Good
import { Button } from '@/components/shared/Button'
import { api } from '@/lib/api'

// ❌ Bad
import { Button } from '../../../components/shared/Button'
import { api } from '../../lib/api'
```

---

## Code Quality Rules

### 1. No `any` Types

```tsx
// ❌ Bad
function handleData(data: any) { ... }

// ✅ Good
function handleData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Now TypeScript knows it's an object
  }
}

// ✅ Better
function handleData(data: Request) { ... }
```

### 2. Explicit Return Types for Public APIs

```tsx
// ❌ Bad
export function useRequestFilters() {
  return { filters, setFilters }
}

// ✅ Good
interface UseRequestFiltersReturn {
  filters: RequestFilters
  setFilters: (filters: Partial<RequestFilters>) => void
}

export function useRequestFilters(): UseRequestFiltersReturn {
  return { filters, setFilters }
}
```

### 3. Prefer `interface` over `type` for Objects

```tsx
// ✅ Good
interface RequestProps {
  id: string
  title: string
}

// ✅ Good (for unions)
type Status = 'pending' | 'active' | 'completed'

// ❌ Bad
type RequestProps = {
  id: string
  title: string
}
```

### 4. Early Returns

```tsx
// ❌ Bad
function Component() {
  if (isLoading) {
    return <div>Loading...</div>
  } else {
    if (error) {
      return <div>Error</div>
    } else {
      return <div>Content</div>
    }
  }
}

// ✅ Good
function Component() {
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error</div>

  return <div>Content</div>
}
```

### 5. Memoization for Expensive Calculations

```tsx
// ❌ Bad
function Component({ items }) {
  const sorted = items.sort()  // Recalculates every render!
  return <div>{sorted.length}</div>
}

// ✅ Good
function Component({ items }) {
  const sorted = useMemo(() => items.sort(), [items])
  return <div>{sorted.length}</div>
}
```

### 6. useCallback for Event Handlers

```tsx
// ❌ Bad
function Component() {
  const handleClick = () => {  // New function every render
    console.log('clicked')
  }
  return <Button onClick={handleClick} />
}

// ✅ Good
function Component() {
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])
  return <Button onClick={handleClick} />
}
```

---

## Testing Patterns

### Unit Test Template

```tsx
import { render, screen } from '@testing-library/react'
import { RequestCard } from './RequestCard'

describe('RequestCard', () => {
  it('renders request title', () => {
    const mockRequest = {
      id: '1',
      title: 'Test Request',
      status: 'active',
    }

    render(<RequestCard item={mockRequest} />)

    expect(screen.getByText('Test Request')).toBeInTheDocument()
  })

  it('shows active status badge', () => {
    // Test implementation
  })
})
```

---

**Remember**: These guidelines are living rules. As we build, we'll refine them based on what works best for Thiam.
