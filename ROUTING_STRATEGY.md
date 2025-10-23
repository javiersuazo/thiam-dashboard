# Routing Strategy - Thiam Dashboard

**URL structure for role-based multi-tenant catering platform**

Last Updated: 2025-10-23

---

## 🎯 Routing Principles

1. **Role-Based Routes** - Different URL spaces for different user types
2. **RESTful Patterns** - Predictable, conventional URLs
3. **Deep Linking** - Every state should have a URL
4. **SEO Friendly** - Clean, descriptive paths (for public pages)
5. **Type-Safe** - Route definitions in TypeScript

---

## 🗺️ Complete Route Map

### Public Routes (Unauthenticated)

```
/                              → Landing page
/login                         → Login page
/register                      → Registration
/forgot-password               → Password reset
/reset-password?token=xxx      → Password reset form

# Public Marketplace (if enabled)
/marketplace                   → Browse caterers
/marketplace/caterers/:id      → Caterer profile
/marketplace/menus/:id         → Menu detail

# Legal
/terms                         → Terms of service
/privacy                       → Privacy policy
/contact                       → Contact page
```

---

## 👥 Customer Routes

**Base Path:** `/customer`

### Dashboard
```
/customer/dashboard            → Customer home (overview)
```

### Requests (Catering Requests)
```
/customer/requests                      → List all requests
/customer/requests/new                  → Create new request
/customer/requests/:id                  → Request detail
/customer/requests/:id/edit             → Edit request (draft only)
/customer/requests/:id/offers           → View offers for request
/customer/requests/:id/offers/:offerId  → Offer detail
```

**Query Parameters:**
- `?status=pending,active` - Filter by status
- `?q=search` - Search query
- `?dateFrom=2025-01-01` - Date range
- `?dateTo=2025-12-31`

### Orders
```
/customer/orders               → List all orders
/customer/orders/:id           → Order detail
/customer/orders/:id/tracking  → Delivery tracking
```

### Invoices & Payments
```
/customer/invoices             → List invoices
/customer/invoices/:id         → Invoice detail
/customer/invoices/:id/pay     → Payment flow
/customer/wallet               → Wallet management
/customer/payment-methods      → Manage payment methods
```

### Account & Settings
```
/customer/profile              → Profile settings
/customer/favorites            → Favorite caterers/menus
/customer/support              → Support tickets
/customer/support/new          → Create ticket
/customer/support/:id          → Ticket detail
```

---

## 🍽️ Caterer Routes

**Base Path:** `/caterer`

### Dashboard
```
/caterer/dashboard             → Caterer home (overview)
```

### Requests (Bidding)
```
/caterer/requests              → Browse open requests
/caterer/requests/:id          → Request detail
/caterer/requests/:id/offer    → Create offer for request
```

### My Offers
```
/caterer/offers                → List my offers
/caterer/offers/:id            → Offer detail
/caterer/offers/:id/edit       → Edit offer (draft only)
```

### Orders
```
/caterer/orders                → List my orders
/caterer/orders/:id            → Order detail
/caterer/orders/:id/prepare    → Production view
```

### Menus & Items
```
/caterer/menus                 → List my menus
/caterer/menus/new             → Create menu
/caterer/menus/:id             → Menu detail
/caterer/menus/:id/edit        → Edit menu
/caterer/menus/:id/items       → Manage menu items

/caterer/items                 → Standalone items library
/caterer/items/new             → Create item
/caterer/items/:id/edit        → Edit item
```

### Staff & Availability
```
/caterer/staff                 → Manage staff
/caterer/staff/new             → Add staff member
/caterer/staff/:id             → Staff detail

/caterer/availability          → Manage calendar/availability
```

### Invoices
```
/caterer/invoices              → List invoices I've created
/caterer/invoices/new          → Create invoice
/caterer/invoices/:id          → Invoice detail
```

### Settings
```
/caterer/profile               → Business profile
/caterer/settings              → Account settings
/caterer/locations             → Service areas
```

---

## 🏢 Operations Routes (Internal Staff)

**Base Path:** `/ops`

**Permissions:** `operations:*`

### Dashboard
```
/ops/dashboard                 → Operations overview
```

### Request Management
```
/ops/requests                  → All requests (all customers)
/ops/requests/:id              → Request detail (can impersonate)
/ops/requests/:id/assign       → Assign to sales
```

### User Management
```
/ops/users                     → All users
/ops/users/:id                 → User detail
/ops/users/:id/impersonate     → Impersonate user
```

### Caterer Management
```
/ops/caterers                  → All caterers
/ops/caterers/:id              → Caterer detail
/ops/caterers/:id/approve      → Approve/reject caterer
```

### Impersonation
```
/ops/impersonate?userId=xxx    → Active impersonation view
/ops/impersonate/stop          → Exit impersonation
```

---

## 💰 Finance Routes (Internal Staff)

**Base Path:** `/finance`

**Permissions:** `finance:*`

### Dashboard
```
/finance/dashboard             → Finance overview
```

### Invoices
```
/finance/invoices              → All invoices
/finance/invoices/:id          → Invoice detail
/finance/invoices/:id/edit     → Edit invoice
/finance/invoices/:id/void     → Void invoice
```

### Payments
```
/finance/payments              → All payments
/finance/payments/:id          → Payment detail
/finance/payments/:id/refund   → Process refund
```

### Reports
```
/finance/reports               → Financial reports
/finance/reports/revenue       → Revenue report
/finance/reports/outstanding   → Outstanding invoices
```

---

## 📊 Sales Routes (Internal Staff)

**Base Path:** `/sales`

**Permissions:** `sales:*`

### Dashboard
```
/sales/dashboard               → Sales overview
```

### Lead Management
```
/sales/leads                   → All leads (unqualified requests)
/sales/leads/:id               → Lead detail
/sales/leads/:id/qualify       → Qualify lead
```

### Requests
```
/sales/requests                → Qualified requests
/sales/requests/:id            → Request detail
/sales/requests/:id/assign     → Assign to caterer
```

---

## 🔧 Admin Routes (Super Admin)

**Base Path:** `/admin`

**Permissions:** `admin:*`

### Dashboard
```
/admin/dashboard               → Admin overview
```

### System Management
```
/admin/users                   → All users
/admin/accounts                → All accounts
/admin/settings                → System settings
/admin/feature-flags           → Feature toggles
/admin/logs                    → System logs
```

---

## 🔄 Shared Routes (All Authenticated Users)

```
/notifications                 → Notifications center
/messages                      → Message inbox (chat)
/messages/:conversationId      → Conversation view
/settings                      → User settings
/help                          → Help center
```

---

## 🎨 Route Patterns

### List Pages
```
/{role}/{domain}
  ?status=active
  &q=search
  &page=1
  &limit=20
  &sortBy=createdAt
  &sortOrder=desc
```

**Example:** `/customer/requests?status=active&q=wedding&page=1`

### Detail Pages
```
/{role}/{domain}/:id
```

**Example:** `/customer/requests/abc-123-def`

### Create Pages
```
/{role}/{domain}/new
```

**Example:** `/caterer/menus/new`

### Edit Pages
```
/{role}/{domain}/:id/edit
```

**Example:** `/caterer/menus/abc-123-def/edit`

### Sub-Resource Pages
```
/{role}/{domain}/:id/{subDomain}
/{role}/{domain}/:id/{subDomain}/:subId
```

**Example:** `/customer/requests/abc-123/offers/xyz-789`

---

## 🛣️ Route Middleware & Guards

### Authentication Guard
Protects all routes except public routes.

```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')

  if (!token && !isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

### Role Guard
Protects role-specific routes.

```tsx
// app/(authenticated)/customer/layout.tsx
export default function CustomerLayout() {
  const { user } = useSession()

  if (!hasRole(user, 'customer')) {
    redirect('/unauthorized')
  }

  return <>{children}</>
}
```

### Permission Guard
Protects specific actions.

```tsx
// app/(authenticated)/ops/users/[id]/impersonate/page.tsx
import { ProtectedRoute } from '@/lib/rbac/guards'

export default function ImpersonatePage() {
  return (
    <ProtectedRoute permission="users:impersonate">
      <ImpersonateForm />
    </ProtectedRoute>
  )
}
```

---

## 📁 Next.js App Router Structure

```
app/
├── (public)/                    # Public routes (no auth)
│   ├── page.tsx                 # / - Landing
│   ├── login/
│   ├── register/
│   └── marketplace/
│
├── (authenticated)/             # All authenticated routes
│   ├── layout.tsx               # Authenticated layout
│   │
│   ├── customer/                # Customer routes
│   │   ├── layout.tsx           # Customer layout + role guard
│   │   ├── dashboard/
│   │   ├── requests/
│   │   │   ├── page.tsx         # List
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Detail
│   │   │       ├── edit/
│   │   │       └── offers/
│   │   ├── orders/
│   │   ├── invoices/
│   │   └── profile/
│   │
│   ├── caterer/                 # Caterer routes
│   │   ├── layout.tsx           # Caterer layout + role guard
│   │   ├── dashboard/
│   │   ├── menus/
│   │   ├── offers/
│   │   └── orders/
│   │
│   ├── ops/                     # Operations routes
│   │   ├── layout.tsx           # Ops layout + permission guard
│   │   ├── dashboard/
│   │   ├── requests/
│   │   └── users/
│   │
│   ├── finance/                 # Finance routes
│   │   ├── layout.tsx
│   │   ├── invoices/
│   │   └── payments/
│   │
│   ├── sales/                   # Sales routes
│   │   ├── layout.tsx
│   │   ├── leads/
│   │   └── requests/
│   │
│   ├── admin/                   # Admin routes
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │
│   └── shared/                  # Shared authenticated routes
│       ├── notifications/
│       ├── messages/
│       └── settings/
│
└── api/                         # API routes
    ├── auth/
    ├── session/
    └── webhooks/
```

---

## 🔗 Route Configuration (Type-Safe)

```tsx
// src/config/routes.ts

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Customer
  CUSTOMER: {
    DASHBOARD: '/customer/dashboard',
    REQUESTS: '/customer/requests',
    REQUEST_NEW: '/customer/requests/new',
    REQUEST_DETAIL: (id: string) => `/customer/requests/${id}`,
    REQUEST_EDIT: (id: string) => `/customer/requests/${id}/edit`,
    REQUEST_OFFERS: (id: string) => `/customer/requests/${id}/offers`,
    ORDERS: '/customer/orders',
    ORDER_DETAIL: (id: string) => `/customer/orders/${id}`,
    INVOICES: '/customer/invoices',
    INVOICE_DETAIL: (id: string) => `/customer/invoices/${id}`,
  },

  // Caterer
  CATERER: {
    DASHBOARD: '/caterer/dashboard',
    REQUESTS: '/caterer/requests',
    REQUEST_DETAIL: (id: string) => `/caterer/requests/${id}`,
    CREATE_OFFER: (requestId: string) => `/caterer/requests/${requestId}/offer`,
    MENUS: '/caterer/menus',
    MENU_NEW: '/caterer/menus/new',
    MENU_DETAIL: (id: string) => `/caterer/menus/${id}`,
    MENU_EDIT: (id: string) => `/caterer/menus/${id}/edit`,
  },

  // Operations
  OPS: {
    DASHBOARD: '/ops/dashboard',
    REQUESTS: '/ops/requests',
    USERS: '/ops/users',
    IMPERSONATE: (userId: string) => `/ops/impersonate?userId=${userId}`,
  },

  // Finance
  FINANCE: {
    DASHBOARD: '/finance/dashboard',
    INVOICES: '/finance/invoices',
    PAYMENTS: '/finance/payments',
  },

  // Sales
  SALES: {
    DASHBOARD: '/sales/dashboard',
    LEADS: '/sales/leads',
    REQUESTS: '/sales/requests',
  },
} as const

// Type-safe navigation
import { useRouter } from 'next/navigation'

function MyComponent() {
  const router = useRouter()

  // ✅ Type-safe
  router.push(ROUTES.CUSTOMER.REQUEST_DETAIL('abc-123'))

  // ❌ TypeScript error
  router.push('/wrong/path')
}
```

---

## 🎯 Dynamic Routing Based on Role

```tsx
// Redirect to appropriate dashboard based on role
function DashboardRedirect() {
  const { user } = useSession()

  const dashboards = {
    customer: ROUTES.CUSTOMER.DASHBOARD,
    caterer: ROUTES.CATERER.DASHBOARD,
    operations: ROUTES.OPS.DASHBOARD,
    finance: ROUTES.FINANCE.DASHBOARD,
    sales: ROUTES.SALES.DASHBOARD,
    admin: ROUTES.ADMIN.DASHBOARD,
  }

  const route = dashboards[user.primaryRole]
  redirect(route)
}
```

---

## 📌 URL Design Principles

### ✅ Good URL Design

```
/customer/requests/abc-123              # Clear, RESTful
/caterer/menus/xyz-789/items            # Hierarchical
/ops/users?role=caterer&status=active   # Filterable
```

### ❌ Bad URL Design

```
/req/abc-123                            # Abbreviated, unclear
/menu-items?menuId=xyz                  # Should be nested
/users/list/page/1                      # Redundant
```

---

## 🚀 Implementation Steps

### Phase 1: Setup Route Config
1. Create `src/config/routes.ts` with ROUTES constant
2. Add type-safe route helpers
3. Export from `src/config/index.ts`

### Phase 2: Setup Layouts
1. Create `app/(public)/layout.tsx`
2. Create `app/(authenticated)/layout.tsx`
3. Create role-specific layouts with guards

### Phase 3: Build First Routes
1. Start with `/login` (public)
2. Add `/customer/dashboard` (authenticated)
3. Add `/customer/requests` (list)
4. Add `/customer/requests/:id` (detail)

### Phase 4: Add Middleware
1. Authentication check
2. Role-based redirects
3. Permission guards

---

## 💡 Best Practices

1. **Use Type-Safe Routes** - Always import from `ROUTES` config
2. **Keep URLs Clean** - No technical IDs in URLs for public pages
3. **Support Deep Linking** - Every view should have a shareable URL
4. **Use Query Params** - For filters, search, pagination
5. **Use Path Params** - For resource IDs
6. **Hierarchical URLs** - Reflect resource relationships
7. **Predictable Patterns** - Follow REST conventions

---

**This routing strategy aligns with your DDD architecture and supports all user roles!** 🎯
