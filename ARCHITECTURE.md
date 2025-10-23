# Thiam Dashboard Architecture

**Domain-Driven Design (DDD) for React/Next.js**

Last Updated: 2025-10-23

---

## 🎯 Architectural Principles

### 1. Domain-Driven Design (DDD)
- **Domain-centric** organization (not technical grouping)
- Clear **bounded contexts** for each domain
- **Ubiquitous language** - use business terms, not technical jargon
- **Separation of concerns** - Domain, Application, Infrastructure layers

### 2. Vertical Slices
- Features are organized by **domain** (e.g., requests, offers, orders)
- Each domain is self-contained with its own:
  - Components (UI)
  - Hooks (state + API integration)
  - Types (domain models)
  - Utils (domain-specific logic)
  - Validation schemas

### 3. Dependency Rules
```
┌─────────────────────────────────────┐
│  app/ (pages, routes)               │  ← Can use everything
├─────────────────────────────────────┤
│  components/domains/ (domain UI)    │  ← Can use: lib, types, hooks, shared components
├─────────────────────────────────────┤
│  components/features/ (cross-domain)│  ← Can use: domains, lib, types, hooks, shared
├─────────────────────────────────────┤
│  components/shared/ (UI primitives) │  ← Can use: types, utils only
├─────────────────────────────────────┤
│  lib/ (business logic, API)         │  ← Can use: types, utils only
├─────────────────────────────────────┤
│  types/ (domain models)             │  ← No dependencies (pure types)
└─────────────────────────────────────┘
```

**Rule:** Upper layers can depend on lower layers, but NOT vice versa.

---

## 📁 Folder Structure

### Complete Structure

```
thiam-dashboard/
├── src/
│   ├── app/                          # Next.js App Router (pages & routing)
│   │   ├── (admin)/                  # Admin layout group
│   │   │   ├── customers/            # Customer management pages
│   │   │   ├── caterers/             # Caterer management pages
│   │   │   ├── requests/             # Request pages
│   │   │   ├── offers/               # Offer pages
│   │   │   ├── orders/               # Order pages
│   │   │   ├── invoices/             # Invoice pages
│   │   │   ├── payments/             # Payment pages
│   │   │   └── menus/                # Menu pages
│   │   ├── (auth)/                   # Auth layout group
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── api/                      # API routes (Next.js server endpoints)
│   │
│   ├── components/
│   │   ├── domains/                  # DOMAIN-SPECIFIC COMPONENTS (Bounded Contexts)
│   │   │   ├── requests/             # Request domain
│   │   │   │   ├── components/       # UI components
│   │   │   │   │   ├── RequestList.tsx
│   │   │   │   │   ├── RequestCard.tsx
│   │   │   │   │   ├── RequestForm.tsx
│   │   │   │   │   └── RequestDetail.tsx
│   │   │   │   ├── hooks/            # Domain-specific hooks
│   │   │   │   │   ├── useRequestFilters.ts
│   │   │   │   │   ├── useRequestStatus.ts
│   │   │   │   │   └── useRequestValidation.ts
│   │   │   │   ├── types/            # Domain types (extends API types)
│   │   │   │   │   └── request.types.ts
│   │   │   │   ├── utils/            # Domain utilities
│   │   │   │   │   ├── requestHelpers.ts
│   │   │   │   │   └── requestCalculations.ts
│   │   │   │   ├── validation/       # Domain validation schemas
│   │   │   │   │   └── requestSchema.ts
│   │   │   │   └── index.ts          # Public API (barrel export)
│   │   │   │
│   │   │   ├── offers/               # Offer domain (same structure)
│   │   │   ├── orders/               # Order domain
│   │   │   ├── invoices/             # Invoice domain
│   │   │   ├── payments/             # Payment domain
│   │   │   ├── caterers/             # Caterer domain
│   │   │   ├── customers/            # Customer domain
│   │   │   ├── menus/                # Menu domain
│   │   │   └── deliveries/           # Delivery domain
│   │   │
│   │   ├── features/                 # CROSS-DOMAIN FEATURES
│   │   │   ├── chat/                 # Real-time chat (uses multiple domains)
│   │   │   ├── impersonation/        # Admin impersonation
│   │   │   ├── marketplace/          # Public marketplace
│   │   │   ├── daily-lunch/          # Daily lunch feature
│   │   │   ├── account-switcher/     # Switch between accounts
│   │   │   └── notifications/        # Notification system
│   │   │
│   │   ├── layouts/                  # LAYOUT COMPONENTS
│   │   │   ├── AdminLayout.tsx       # Main admin layout
│   │   │   ├── AuthLayout.tsx        # Auth pages layout
│   │   │   ├── CustomerLayout.tsx    # Customer-specific layout
│   │   │   ├── CatererLayout.tsx     # Caterer-specific layout
│   │   │   └── PublicLayout.tsx      # Public pages layout
│   │   │
│   │   └── shared/                   # SHARED UI COMPONENTS (Design System)
│   │       ├── Button/
│   │       ├── Input/
│   │       ├── Modal/
│   │       ├── Table/
│   │       ├── Card/
│   │       ├── Form/
│   │       └── index.ts
│   │
│   ├── lib/                          # BUSINESS LOGIC & INFRASTRUCTURE
│   │   ├── api/                      # API client (✅ DONE!)
│   │   │   ├── generated/            # Auto-generated types
│   │   │   ├── index.ts              # API client
│   │   │   └── hooks.ts              # React Query hooks
│   │   │
│   │   ├── rbac/                     # Role-Based Access Control
│   │   │   ├── permissions.ts        # Permission definitions
│   │   │   ├── roles.ts              # Role definitions
│   │   │   ├── guards.ts             # Permission guards/checks
│   │   │   └── hooks.ts              # usePermission, useRole hooks
│   │   │
│   │   ├── session/                  # Session management
│   │   │   ├── sessionStore.ts       # Session state
│   │   │   ├── auth.ts               # Auth helpers
│   │   │   └── hooks.ts              # useSession, useAuth
│   │   │
│   │   ├── ai/                       # AI / Generative UI
│   │   │   ├── chat.ts               # AI chat integration
│   │   │   ├── suggestions.ts        # AI suggestions
│   │   │   └── generative-ui.ts      # Dynamic UI generation
│   │   │
│   │   ├── validation/               # Global validation utilities
│   │   │   ├── schemas.ts            # Common validation schemas
│   │   │   └── validators.ts         # Custom validators
│   │   │
│   │   └── utils/                    # Shared utilities
│   │       ├── date.ts               # Date utilities
│   │       ├── format.ts             # Formatters (currency, etc.)
│   │       ├── string.ts             # String utilities
│   │       └── array.ts              # Array utilities
│   │
│   ├── types/                        # TYPE DEFINITIONS
│   │   ├── api/                      # API-related types
│   │   │   └── index.ts              # Re-export from generated schema
│   │   │
│   │   ├── models/                   # Domain models (extend API types)
│   │   │   ├── request.ts            # Request domain model
│   │   │   ├── offer.ts              # Offer domain model
│   │   │   ├── order.ts              # Order domain model
│   │   │   └── ...
│   │   │
│   │   ├── components/               # Component prop types
│   │   │   └── common.ts             # Common component props
│   │   │
│   │   └── rbac/                     # RBAC types
│   │       ├── roles.ts
│   │       └── permissions.ts
│   │
│   ├── hooks/                        # GLOBAL HOOKS (cross-domain)
│   │   ├── useBreakpoint.ts          # Responsive breakpoint
│   │   ├── useDebounce.ts            # Debounce hook
│   │   ├── useLocalStorage.ts        # Local storage
│   │   └── useMediaQuery.ts          # Media queries
│   │
│   ├── config/                       # CONFIGURATION
│   │   ├── constants.ts              # App constants
│   │   ├── features.ts               # Feature flags
│   │   └── routes.ts                 # Route definitions
│   │
│   └── stores/                       # GLOBAL STATE (Zustand)
│       ├── uiStore.ts                # UI state (sidebar, theme)
│       ├── sessionStore.ts           # User session
│       └── notificationStore.ts      # Notifications
│
├── tests/                            # TESTS
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   ├── e2e/                          # End-to-end tests
│   └── utils/                        # Test utilities
│
├── docs/                             # DOCUMENTATION
│   ├── domains/                      # Domain documentation
│   ├── features/                     # Feature specs
│   └── api/                          # API integration docs
│
└── public/                           # Public assets
    ├── images/
    └── fonts/
```

---

## 🧩 Domain Organization

Each domain follows this structure:

```
src/components/domains/{domain}/
├── components/              # UI Components
│   ├── {Domain}List.tsx     # List view
│   ├── {Domain}Card.tsx     # Card component
│   ├── {Domain}Form.tsx     # Create/Edit form
│   ├── {Domain}Detail.tsx   # Detail view
│   └── {Domain}Filters.tsx  # Filter component
│
├── hooks/                   # Domain-specific hooks
│   ├── use{Domain}Filters.ts
│   ├── use{Domain}Status.ts
│   └── use{Domain}Actions.ts
│
├── types/                   # Domain types
│   └── {domain}.types.ts
│
├── utils/                   # Domain utilities
│   └── {domain}Helpers.ts
│
├── validation/              # Domain validation
│   └── {domain}Schema.ts
│
└── index.ts                 # Public API (barrel export)
```

### Example: Request Domain

```typescript
// src/components/domains/requests/index.ts
export { RequestList } from './components/RequestList'
export { RequestCard } from './components/RequestCard'
export { RequestForm } from './components/RequestForm'
export { RequestDetail } from './components/RequestDetail'

export { useRequestFilters } from './hooks/useRequestFilters'
export { useRequestStatus } from './hooks/useRequestStatus'

export type { RequestViewModel, RequestFilters } from './types/request.types'
```

Usage in pages:
```typescript
// app/(admin)/requests/page.tsx
import { RequestList, useRequestFilters } from '@/components/domains/requests'
```

---

## 🔐 RBAC Integration

Role-based access control is built into the architecture:

### Permission Checks in Components

```tsx
// components/domains/requests/components/RequestList.tsx
import { usePermission } from '@/lib/rbac/hooks'

export function RequestList() {
  const canCreate = usePermission('requests:create')
  const canEdit = usePermission('requests:update')

  return (
    <div>
      {canCreate && <CreateButton />}
      {/* ... */}
    </div>
  )
}
```

### Route Guards

```tsx
// app/(admin)/requests/page.tsx
import { ProtectedRoute } from '@/lib/rbac/guards'

export default function RequestsPage() {
  return (
    <ProtectedRoute permission="requests:read">
      <RequestList />
    </ProtectedRoute>
  )
}
```

---

## 📝 Naming Conventions

### Files & Folders
- **PascalCase** for components: `RequestList.tsx`, `OrderCard.tsx`
- **camelCase** for utilities: `requestHelpers.ts`, `formatDate.ts`
- **kebab-case** for routes: `app/requests/[id]/page.tsx`

### Components
- **Domain components**: `{Domain}{Type}` - `RequestList`, `OfferCard`, `OrderForm`
- **Shared components**: Generic names - `Button`, `Modal`, `Table`
- **Feature components**: `{Feature}{Type}` - `ChatWindow`, `ImpersonationBanner`

### Hooks
- Start with `use`: `useRequestFilters`, `usePermission`, `useAuth`
- Domain hooks in domain folder: `domains/requests/hooks/useRequestStatus.ts`
- Global hooks in `hooks/`: `hooks/useDebounce.ts`

### Types
- **Interfaces** for objects: `interface Request { ... }`
- **Types** for unions/intersections: `type Status = 'pending' | 'active'`
- **Suffix with purpose**: `RequestViewModel`, `RequestFilters`, `RequestFormData`

---

## 🎨 Component Patterns

### 1. Domain Components (Business Logic)

```tsx
// src/components/domains/requests/components/RequestList.tsx
import { useRequests } from '@/lib/api/hooks'
import { useRequestFilters } from '../hooks/useRequestFilters'
import { RequestCard } from './RequestCard'

export function RequestList() {
  const { filters, setFilters } = useRequestFilters()
  const { data: requests, isLoading } = useRequests(filters)

  if (isLoading) return <LoadingState />

  return (
    <div>
      {requests?.map(request => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  )
}
```

### 2. Shared Components (UI Primitives)

```tsx
// src/components/shared/Button/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return <button className={cn(styles[variant], styles[size])} {...props} />
}
```

### 3. Feature Components (Cross-Domain)

```tsx
// src/components/features/impersonation/ImpersonationBanner.tsx
import { useSession } from '@/lib/session/hooks'

export function ImpersonationBanner() {
  const { isImpersonating, stopImpersonation } = useSession()

  if (!isImpersonating) return null

  return (
    <div className="bg-yellow-500">
      You are impersonating a user
      <button onClick={stopImpersonation}>Exit</button>
    </div>
  )
}
```

---

## 🔄 Data Flow

```
┌──────────────┐
│   Page       │  ← Composes domain components
│  (app/)      │
└──────┬───────┘
       │
┌──────▼───────────────────────┐
│   Domain Components          │  ← Uses API hooks + domain hooks
│  (components/domains/)       │
└──────┬───────────────────────┘
       │
┌──────▼───────────────────────┐
│   API Hooks                  │  ← Fetches data from API
│  (lib/api/hooks.ts)          │
└──────┬───────────────────────┘
       │
┌──────▼───────────────────────┐
│   API Client                 │  ← Type-safe HTTP client
│  (lib/api/index.ts)          │
└──────┬───────────────────────┘
       │
┌──────▼───────────────────────┐
│   Backend API                │
│  (thiam-api)                 │
└──────────────────────────────┘
```

---

## 🚀 Development Workflow

### 1. Adding a New Domain

```bash
# 1. Create domain structure
mkdir -p src/components/domains/mydomain/{components,hooks,types,utils,validation}

# 2. Create index.ts (public API)
touch src/components/domains/mydomain/index.ts

# 3. Add components
# 4. Add hooks
# 5. Add types
# 6. Export from index.ts
```

### 2. Adding a New Feature

```bash
# 1. Create feature folder
mkdir -p src/components/features/myfeature

# 2. Feature uses multiple domains
# 3. Export from index.ts
```

### 3. Adding a New Page

```tsx
// app/(admin)/mydomain/page.tsx
import { MyDomainList } from '@/components/domains/mydomain'

export default function MyDomainPage() {
  return <MyDomainList />
}
```

---

## ✅ Code Quality Rules

### 1. Single Responsibility
- Each component does ONE thing
- Each hook has ONE purpose
- Each utility has ONE job

### 2. Dependency Direction
- Always import from lower layers
- Never import from sibling domains
- Use features to combine domains

### 3. Explicit Exports
- Use barrel exports (`index.ts`)
- Only export public API
- Keep internal components private

### 4. Type Safety
- No `any` types (use `unknown` if needed)
- Strict TypeScript mode
- Prefer interfaces for objects

### 5. Naming Clarity
- Use business terms (ubiquitous language)
- Be descriptive, not clever
- Consistent patterns across domains

---

## 🧪 Testing Strategy

### Unit Tests
```
tests/unit/
├── components/domains/requests/
│   └── RequestCard.test.tsx
├── lib/utils/
│   └── formatDate.test.ts
└── hooks/
    └── useDebounce.test.ts
```

### Integration Tests
```
tests/integration/
├── domains/requests/
│   └── request-flow.test.tsx
└── features/impersonation/
    └── impersonation.test.tsx
```

### E2E Tests
```
tests/e2e/
├── customer-journey.spec.ts
├── caterer-journey.spec.ts
└── admin-journey.spec.ts
```

---

## 📚 Resources

- **DDD in Frontend**: [Domain-Driven Design in React](https://khalilstemmler.com/articles/software-design-architecture/domain-driven-design-vs-clean-architecture/)
- **Vertical Slice Architecture**: [Jimmy Bogard](https://www.youtube.com/watch?v=SUiWfhAhgQw)
- **Next.js Best Practices**: [Official Docs](https://nextjs.org/docs/app/building-your-application)

---

**Remember**: This architecture is a living document. As we build, we'll refine it based on what works best for Thiam.
