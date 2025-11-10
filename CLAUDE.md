# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run dev              # Start Next.js development server on localhost:3000
npm run build            # Production build
npm start                # Start production server
npm run lint             # Run ESLint
```

### API Type Generation
The dashboard uses auto-generated TypeScript types from the Go API's OpenAPI spec:
```bash
npm run api:update       # Convert Swagger → OpenAPI → Generate TS types (~130ms)
npm run api:convert      # Convert Swagger 2.0 to OpenAPI 3.0
npm run api:generate     # Generate TypeScript from OpenAPI spec
npm run api:watch        # Watch mode for API changes
```

**Critical**: Run `npm run api:update` whenever the backend API changes. Never edit `src/lib/api/generated/schema.ts` manually.

### Testing
```bash
npm run cypress:open           # Open Cypress UI
npm run cypress:run            # Run all Cypress tests
npm run test:e2e              # Run auth E2E tests
npm run test:e2e:mock         # Run with mocked API
npm run test:e2e:headed       # Run in headed Chrome
```

## Architecture Overview

### Domain-Driven Design (DDD)
This codebase follows DDD principles with vertical slice architecture:

**Dependency Flow** (top → bottom only):
```
app/ (pages, routes)
  ↓
components/domains/ (bounded contexts)
  ↓
components/features/ (cross-domain)
  ↓
components/shared/ (UI primitives)
  ↓
lib/ (business logic, API)
  ↓
types/ (pure types)
```

**Rule**: Upper layers depend on lower layers, never vice versa. Domains are isolated - use features for cross-domain logic.

### Folder Structure

```
src/
├── app/[locale]/                    # Next.js 15 App Router with i18n
│   ├── (admin)/                     # Protected admin routes
│   ├── (full-width-pages)/          # Public routes (auth, errors)
│   └── api/                         # API routes
│
├── components/
│   ├── domains/                     # Bounded contexts (requests, offers, orders, etc.)
│   │   ├── auth/                    # Authentication domain
│   │   ├── requests/                # Catering requests
│   │   ├── offers/                  # Caterer offers
│   │   ├── orders/                  # Order management
│   │   ├── invoices/                # Invoicing
│   │   ├── payments/                # Payment processing
│   │   ├── caterers/                # Caterer management
│   │   ├── customers/               # Customer management
│   │   ├── menus/                   # Menu management
│   │   ├── inventory/               # Inventory tracking
│   │   └── deliveries/              # Delivery tracking
│   │
│   ├── features/                    # Cross-domain features
│   │   └── session/                 # Session management
│   │
│   ├── shared/                      # Reusable UI components
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── tables/                  # Table components
│   │   ├── form/                    # Form components
│   │   └── calendar/                # Calendar components
│   │
│   └── _template/                   # TailAdmin template components (reference only)
│
├── lib/                             # Business logic & infrastructure
│   ├── api/                         # Type-safe API client (100% auto-generated)
│   │   ├── generated/schema.ts      # DO NOT EDIT - Auto-generated types
│   │   ├── index.ts                 # Browser API client
│   │   ├── server.ts                # Server-side API client + auth
│   │   ├── hooks.ts                 # React Query hooks
│   │   ├── middleware.ts            # Request/response interceptors
│   │   └── README.md                # Comprehensive API client docs
│   │
│   ├── auth/                        # Authentication utilities
│   │   ├── jwt.ts                   # JWT token handling
│   │   ├── rbac.ts                  # Role-based access control
│   │   └── session.ts               # Session management
│   │
│   └── session/                     # Iron Session configuration
│
├── types/                           # TypeScript type definitions
│   ├── auth.ts                      # Auth types
│   ├── actions.ts                   # Server action types
│   └── index.ts                     # Barrel exports
│
├── hooks/                           # Global React hooks
├── config/                          # App configuration
├── stores/                          # Zustand state stores
└── middleware.ts                    # Next.js middleware (auth + i18n)
```

## Domain Structure Pattern

Each domain follows this consistent structure:

```
src/components/domains/{domain}/
├── components/              # UI Components
│   ├── {Domain}List.tsx     # List view with filters
│   ├── {Domain}Card.tsx     # Card display component
│   ├── {Domain}Form.tsx     # Create/edit form
│   └── {Domain}Detail.tsx   # Detail view
│
├── hooks/                   # Domain-specific hooks (optional)
├── types/                   # Domain types (optional)
├── utils/                   # Domain utilities (optional)
├── validation/              # Zod schemas (optional)
└── index.ts                 # Public API - barrel export
```

**Example**: Request domain at `src/components/domains/requests/`

## Authentication Architecture

### Token Management
- **Storage**: httpOnly cookies (secure, XSS-proof)
- **Cookies**: `access_token`, `refresh_token`
- **Flow**: Next.js Server Actions → Go API → httpOnly cookies
- **Middleware**: Validates tokens on every request (`src/middleware.ts`)

### Key Auth Files
- `src/components/domains/auth/actions.ts` - Server actions for all auth flows
- `src/lib/api/server.ts` - Server-side API client with token management
- `src/lib/auth/session.ts` - Iron Session integration
- `src/middleware.ts` - Route protection + i18n

### Auth Flows Supported
1. **Email/Password** - Standard login with optional 2FA
2. **2FA/TOTP** - Authenticator app verification
3. **Passkey/WebAuthn** - Platform authenticator support
4. **Passwordless** - Magic link (email) or SMS code
5. **Password Reset** - Email or SMS-based recovery
6. **Email Verification** - Post-signup verification

### Creating Protected Routes
```tsx
// Pages in app/(admin)/* are automatically protected by middleware
// Middleware checks for access_token cookie

// For granular control:
import { createServerClient } from '@/lib/api/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const api = await createServerClient()
  if (!api) redirect('/signin')

  // Use authenticated API client
  const { data } = await api.GET('/protected-endpoint')
  return <div>{/* ... */}</div>
}
```

## API Integration

### Type-Safe API Client
The app uses `openapi-typescript` + `openapi-fetch` for 100% type-safe API calls:

```tsx
// Client-side (React components)
import { api } from '@/lib/api'

const { data, error } = await api.GET('/requests', {
  params: { query: { limit: 10 } }
})

// Server-side (Server Components/Actions)
import { createServerClient } from '@/lib/api/server'

const api = await createServerClient()
const { data, error } = await api.GET('/requests')
```

### React Query Hooks
Pre-built hooks for common operations:

```tsx
import { useRequests, useCreateRequest } from '@/lib/api/hooks'

function RequestList() {
  const { data, isLoading } = useRequests({ limit: 10 })
  const createMutation = useCreateRequest()

  // ...
}
```

**Custom Hooks**: Domain-specific hooks go in `src/lib/api/{domain}.hooks.ts` (e.g., `ingredients.hooks.ts`, `menuItems.hooks.ts`)

### Adding New API Endpoints
1. Update backend OpenAPI spec
2. Run `npm run api:update`
3. Types automatically regenerated
4. Add React Query hook in `src/lib/api/hooks.ts` if needed

## Key Patterns & Conventions

### Server Actions Pattern
All mutations use Next.js Server Actions:

```tsx
'use server'

import { createServerClient } from '@/lib/api/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'

export async function createItemAction(data: FormData): Promise<ActionResult<Item>> {
  const api = await createServerClient()
  if (!api) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: item, error } = await api.POST('/items', {
    body: { name: data.get('name') as string }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/items')
  return { success: true, data: item }
}
```

### Form Validation
Use Zod for all form validation:

```tsx
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })
  // ...
}
```

### Component Naming
- **Domain components**: `{Domain}{Type}` → `RequestList`, `OfferCard`, `OrderForm`
- **Shared components**: Generic → `Button`, `Modal`, `Table`
- **Files**: PascalCase for components, camelCase for utils

### Imports
Always use path aliases:
```tsx
import { api } from '@/lib/api'
import { Button } from '@/components/shared/ui/button'
import { RequestList } from '@/components/domains/requests'
```

## Important Implementation Details

### Middleware Execution
`src/middleware.ts` runs on every request:
1. Handles i18n locale routing (next-intl)
2. Checks for `access_token` cookie
3. Redirects unauthenticated users to `/signin`
4. Prevents authenticated users from accessing auth pages

**Public Routes**: Listed in `PUBLIC_ROUTES` array in middleware

### Route Groups
- `(admin)` - Protected routes, requires authentication
- `(full-width-pages)` - Public routes (auth, errors)
- `[locale]` - i18n support (en, es, etc.)

### Environment Variables
See `.env.example` for required vars:
- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: `http://localhost:8080/v1`)
- Session encryption keys for iron-session

### Template Components
The `src/components/_template/` directory contains the original TailAdmin Pro components. Use as reference but prefer creating domain-specific components.

## Adding a New Domain

1. **Create structure**:
```bash
mkdir -p src/components/domains/mydomain/{components,hooks,types,validation}
touch src/components/domains/mydomain/index.ts
```

2. **Add components** in `components/`
3. **Create barrel export** in `index.ts`:
```tsx
export { MyDomainList } from './components/MyDomainList'
export { MyDomainCard } from './components/MyDomainCard'
```

4. **Create page** in `app/(admin)/mydomain/page.tsx`:
```tsx
import { MyDomainList } from '@/components/domains/mydomain'

export default function MyDomainPage() {
  return <MyDomainList />
}
```

## Testing Strategy

### E2E Tests (Cypress)
Located in `cypress/e2e/`:
- `auth.cy.ts` - Authentication flows
- Can mock API with `MOCK_API=true` env var

### Running Tests
```bash
npm run cypress:open        # Interactive mode
npm run cypress:run         # Headless mode
npm run test:e2e:mock      # With API mocking
```

## Common Gotchas

1. **Never edit generated files**: `src/lib/api/generated/schema.ts` is auto-generated
2. **Run api:update after backend changes**: Types won't match otherwise
3. **Use Server Actions for mutations**: Don't call API directly from client for writes
4. **Check middleware for route protection**: Some routes are auto-protected
5. **Domain isolation**: Domains should NOT import from other domains - use features instead
6. **Token expiration**: Backend sends `expiresAt` - may be in seconds or milliseconds, calculate properly
7. **2FA challenge tokens**: Stored in sessionStorage, not cookies (browser-only API)

## Documentation References

- **Architecture**: `ARCHITECTURE.md` - Full DDD architecture explanation
- **Quick Start**: `QUICKSTART.md` - Common patterns and examples
- **API Client**: `src/lib/api/README.md` - Comprehensive API client guide
- **Auth Details**: `AUTH_FIX_SUMMARY.md`, `AUTHENTICATION_FIXES.md` - Auth implementation notes

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives + shadcn/ui patterns
- **Forms**: react-hook-form + Zod validation
- **Data Fetching**: TanStack React Query + openapi-fetch
- **State**: Zustand (global), React Context (scoped)
- **Auth**: JWT tokens in httpOnly cookies
- **i18n**: next-intl
- **Testing**: Cypress (E2E)

## Code Quality Standards

1. **SOLID principles**: Single responsibility, dependency inversion
2. **DDD patterns**: Bounded contexts, ubiquitous language, domain models
3. **Type safety**: No `any` types, prefer `unknown` if needed
4. **Minimal comments**: Code should be self-documenting (per global Claude instructions)
5. **Explicit exports**: Use barrel exports (`index.ts`) for public API
6. **Error handling**: Always check `error` from API responses
7. **Loading states**: Handle `isLoading` in all data-fetching components
8. **Validation**: Validate all user input with Zod before API calls
